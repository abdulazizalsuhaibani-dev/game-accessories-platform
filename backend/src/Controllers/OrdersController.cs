using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using src.Services;
using static src.DTO.OrderDTO;
using src.Utils;

namespace scr.Controller
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class OrdersController : ControllerBase
    {
        protected IOrderService _orderService;
        public readonly static string[] orderStatuses = { "ordered", "shipped", "on delivery", "delivered" };

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }
        // Gets all available orders.
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<List<OrderReadDTO>>> GetAllOrders([FromQuery] PaginationOptions paginationOptions)
        {
            var ordersList = await _orderService.GetAllAsync(paginationOptions);
            return Ok(ordersList.OrderByDescending(o => o.OrderDate));
        }

        // Gets a specific order by it's ID
        [Authorize]
        [HttpGet("{orderId}")]
        public async Task<ActionResult<OrderReadDTO>> GetOrderById([FromRoute] Guid orderId)
        {
            var foundOrder = await _orderService.GetByIdAsync(orderId);

            // an order carries a home address, only its owner and an admin may read it
            AuthorizationUtils.EnsureOwnerOrAdmin(User, foundOrder.UserId);

            return Ok(foundOrder);
        }
        // Gets a user's orders by its ID in ascending.
        [Authorize]
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<OrderReadDTO>>> GetOrdersByUserID([FromRoute] Guid userId,
            [FromQuery] PaginationOptions paginationOptions)
        {
            AuthorizationUtils.EnsureOwnerOrAdmin(User, userId);

            var userOrders = await _orderService.GetByUserIdAsync(userId, paginationOptions);
            return Ok(userOrders.OrderBy(o => o.OrderDate));
        }

        // Gets a user's old orders by its ID in descending.
        [Authorize]
        [HttpGet("user/{userId}/ordershistory")]
        public async Task<ActionResult<List<OrderReadDTO>>> GetOrdersHistoryByUserID([FromRoute] Guid userId,
            [FromQuery] PaginationOptions paginationOptions)
        {
            AuthorizationUtils.EnsureOwnerOrAdmin(User, userId);

            var userOrders = await _orderService.GetHistoryByUserIdAsync(userId, paginationOptions);
            return Ok(userOrders.OrderByDescending(o => o.OrderDate));
        }


        // Post new order to the order database
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<OrderReadDTO>> CreateOrder([FromBody] OrderCreateDTO newOrder)
        {
            // stops a customer from placing an order in somebody else's name.
            // the cart and the payment are checked against this user in the service
            AuthorizationUtils.EnsureOwnerOrAdmin(User, newOrder.UserId);

            // out of stock now throws a CustomException naming the product, so the
            // customer is told which item is short instead of "one of products"
            var createdOrder = await _orderService.CreateOneAsync(newOrder);
            return Created($"api/v1/orders/{createdOrder.Id}", createdOrder);
        }

        // Update current order status into ("shipped", "on delivery", "delivered") or the ship date into new one.
        [Authorize(Roles = "Admin")]
        [HttpPut("{orderId}")]
        public async Task<ActionResult> UpdateOrder(Guid orderId, OrderUpdateDTO updatedOrder)
        {
            // Both fields are optional and validated only when supplied, so an admin can
            // advance the status without restating the ship date. Omitting both is a no-op
            // the caller almost certainly did not mean.
            if (updatedOrder.OrderStatus is null && updatedOrder.ShipDate is null)
                return BadRequest("Supply an order status, a ship date, or both");

            if (updatedOrder.OrderStatus is not null
                && !orderStatuses.Contains(updatedOrder.OrderStatus, StringComparer.OrdinalIgnoreCase))
                return BadRequest($"Invalid order status. Expected one of: {string.Join(", ", orderStatuses)}");

            if (updatedOrder.ShipDate is DateTime shipDate)
            {
                // OrderDate and ShipDate are timestamptz, so Npgsql rejects a non-UTC value
                var shipDateUtc = shipDate.ToUniversalTime();

                if (shipDateUtc < DateTime.UtcNow)
                    return BadRequest("Invalid ship date");

                updatedOrder.ShipDate = shipDateUtc;
            }

            bool isUpdated = await _orderService.UpdateOneAsync(orderId, updatedOrder);

            return isUpdated ? NoContent() : NotFound("Order ID not found");

        }
        // Cancel the current order by deleting it from orders database
        [Authorize]
        [HttpDelete("{orderId}")]
        public async Task<ActionResult> CancelOrder(Guid orderId)
        {
            var foundOrder = await _orderService.GetByIdAsync(orderId);
            AuthorizationUtils.EnsureOwnerOrAdmin(User, foundOrder.UserId);

            var isDeleted = await _orderService.DeleteOneAsync(orderId);
            return isDeleted ? NoContent() : NotFound("Order ID not found");
        }
    }
}