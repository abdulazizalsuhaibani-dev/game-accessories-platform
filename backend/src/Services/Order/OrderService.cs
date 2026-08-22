using AutoMapper;
using Microsoft.EntityFrameworkCore;
using src.Database;
using src.Entity;
using src.Repository;
using src.Utils;
using static src.DTO.OrderDTO;

namespace src.Services
{
    public class OrderService : IOrderService
    {
        protected readonly OrderRepository _orderRepository;
        protected readonly CartRepository _cartRepository;
        protected readonly ProductRepository _productRepository;
        protected readonly PaymentRepository _paymentRepository;
        // placing an order writes to several tables through several repositories,
        // and the context is what lets those writes share one transaction
        protected readonly DatabaseContext _databaseContext;
        protected IMapper _mapper;
        public static int deliveryDays = 2;

        public OrderService(OrderRepository orderRepository, CartRepository cartRepository,
            ProductRepository productRepository, PaymentRepository paymentRepository,
            DatabaseContext databaseContext, IMapper mapper)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _productRepository = productRepository;
            _paymentRepository = paymentRepository;
            _databaseContext = databaseContext;
            _mapper = mapper;
        }

        public async Task<OrderReadDTO> CreateOneAsync(OrderCreateDTO createDTO)
        {
            var order = _mapper.Map<OrderCreateDTO, Order>(createDTO);

            // initialize new entry
            order.OrderDate = DateTime.Now.ToUniversalTime();
            order.ShipDate = DateTime.Now.AddDays(deliveryDays).ToUniversalTime();
            order.OrderStatus = "Ordered";
            order.IsDelivered = false;

            var cart = await _cartRepository.GetCartByIdAsync(order.CartId);
            if (cart == null)
                throw CustomException.NotFound($"Cart ID {order.CartId} of order not found");

            // the controller proves the caller owns order.UserId. this proves the
            // cart belongs to that same user - without it a signed in customer can
            // post an order carrying a stranger's cart id and drain their stock
            if (cart.UserId != order.UserId)
                throw CustomException.Forbidden("You can only order your own cart");

            // and the payment has to be the one settled against this cart, rather
            // than another cart's payment reused to make this order look paid
            var payment = await _paymentRepository.GetByIdAsync(order.PaymentId);
            if (payment == null)
                throw CustomException.NotFound($"Payment ID {order.PaymentId} of order not found");
            if (payment.CartId != order.CartId)
                throw CustomException.BadRequest("The payment does not belong to this cart");

            // every line is checked before a single SKU moves. the previous version
            // decremented and saved line by line and then bailed out mid loop, which
            // left every product before the failing one permanently short with no
            // order to account for it
            var lowStockProduct = CartUtils.ThereIsLowStockProduct(cart);
            if (!string.IsNullOrEmpty(lowStockProduct))
                throw CustomException.BadRequest($"{lowStockProduct} is out of stock");

            // the decrements and the order insert are one unit of work. every
            // repository shares this request's DatabaseContext, so their own
            // SaveChangesAsync calls enlist in this transaction automatically.
            // NOTE: this is only safe while Npgsql is registered without a retrying
            // execution strategy. if EnableRetryOnFailure is ever turned on in
            // Program.cs, this has to move inside
            // _databaseContext.Database.CreateExecutionStrategy().ExecuteAsync(...)
            await using var transaction = await _databaseContext.Database.BeginTransactionAsync();

            foreach (var cartdetail in cart.CartDetails)
            {
                var product = cartdetail.Product;
                product.SKU -= cartdetail.Quantity;
                await _productRepository.UpdateProductInfoAsync(product);
            }

            var orderCreated = await _orderRepository.CreateOneAsync(order);

            await transaction.CommitAsync();

            return _mapper.Map<Order, OrderReadDTO>(orderCreated);
        }

        public async Task<List<OrderReadDTO>> GetAllAsync(PaginationOptions paginationOptions)
        {
            var orderList = await _orderRepository.GetAllAsync(paginationOptions);
            return _mapper.Map<List<Order>, List<OrderReadDTO>>(orderList);
        }

        public async Task<OrderReadDTO> GetByIdAsync(Guid id)
        {
            var foundOrder = await _orderRepository.GetByIdAsync(id);
            if (foundOrder == null)
                throw CustomException.NotFound($"Order with ID {id} not found");
            return _mapper.Map<Order, OrderReadDTO>(foundOrder);
        }

        public async Task<List<OrderReadDTO>> GetByUserIdAsync(Guid userId, PaginationOptions paginationOptions)
        {
            var ordersList = await _orderRepository.GetByUserIdAsync(userId, paginationOptions);
            return _mapper.Map<List<Order>, List<OrderReadDTO>>(ordersList);
        }

        public async Task<List<OrderReadDTO>> GetHistoryByUserIdAsync(Guid userId, PaginationOptions paginationOptions)
        {
            var ordersList = await _orderRepository.GetByHistoryUserIdAsync(userId, paginationOptions);
            return _mapper.Map<List<Order>, List<OrderReadDTO>>(ordersList);
        }
        public async Task<bool> UpdateOneAsync(Guid id, OrderUpdateDTO updateDTO)
        {
            var foundOrder = await _orderRepository.GetByIdAsync(id);
            if (foundOrder == null)
            {
                return false;
            }
            // Assigned by hand rather than through AutoMapper. Its ForAllMembers null guard
            // does not hold for ShipDate: the destination is a non-nullable DateTime, so a
            // null source is materialised as DateTime.MinValue before the condition is
            // consulted, and a status-only update silently reset the ship date to 0001-01-01.
            if (updateDTO.OrderStatus is not null)
                foundOrder.OrderStatus = updateDTO.OrderStatus;

            if (updateDTO.ShipDate is DateTime shipDate)
                foundOrder.ShipDate = shipDate;

            // IsDelivered has to track the status in both directions. GetByUserIdAsync and
            // GetByHistoryUserIdAsync partition a customer's orders on this flag, so an order
            // walked back from "delivered" would otherwise stay stranded in their history.
            foundOrder.IsDelivered =
                foundOrder.OrderStatus is not null
                && foundOrder.OrderStatus.Equals("delivered", StringComparison.OrdinalIgnoreCase);

            return await _orderRepository.UpdateOneAsync(foundOrder);
        }
        public async Task<bool> DeleteOneAsync(Guid id)
        {
            var foundOrder = await _orderRepository.GetByIdAsync(id);
            if (foundOrder == null)
                throw CustomException.NotFound($"Order with ID {id} not found");
            if (!foundOrder.OrderStatus.Equals("Ordered", StringComparison.OrdinalIgnoreCase))
                throw CustomException.BadRequest($"Order with ID {id} cannot be deleted since its already shipped");

            // increase the SKU back.
            var cart = await _cartRepository.GetCartByIdAsync(foundOrder.CartId);
            if (cart == null)
                throw CustomException.NotFound($"Cart ID {foundOrder.CartId} of order not found");
            foreach (var cartdetail in cart.CartDetails)
            {
                var product = cartdetail.Product;
                product.SKU += cartdetail.Quantity;
                await _productRepository.UpdateProductInfoAsync(product);
            }

            return await _orderRepository.DeleteOneAsync(foundOrder);
        }
    }
}