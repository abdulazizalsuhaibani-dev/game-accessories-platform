using AutoMapper;
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
        protected IMapper _mapper;
        public static int deliveryDays = 2;

        public OrderService(OrderRepository orderRepository, CartRepository cartRepository,
            ProductRepository productRepository, PaymentRepository paymentRepository, IMapper mapper)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _productRepository = productRepository;
            _paymentRepository = paymentRepository;
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

            // validate if products has enough SKU
            var cart = await _cartRepository.GetCartByIdAsync(order.CartId);
            if (cart == null)
                throw CustomException.NotFound($"Cart ID {order.CartId} of order not found");
            foreach (var cartdetail in cart.CartDetails)
            {
                var product = cartdetail.Product;
                if (cartdetail.Quantity > product.SKU)
                {
                    return null;
                }
                else
                {
                    product.SKU -= cartdetail.Quantity;
                    await _productRepository.UpdateProductInfoAsync(product);
                }
            }

            var orderCreated = await _orderRepository.CreateOneAsync(order);
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
            _mapper.Map(updateDTO, foundOrder);

            // if order is delivered to the user
            if (foundOrder.OrderStatus.Equals("delivered", StringComparison.OrdinalIgnoreCase))
                foundOrder.IsDelivered = true;
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