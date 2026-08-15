using Microsoft.AspNetCore.Mvc;
using src.Entity;
using src.Controller;
using src.Services.Payment;
using src.Services.cart;
using src.Repository;
using src.Utils;
using static src.DTO.PaymentDTO;
using Microsoft.AspNetCore.Authorization;

namespace src.Controller
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class PaymentsController : ControllerBase
    {
        protected readonly IPaymentService _paymentService;
        protected readonly ICartService _cartService;
        public PaymentsController(IPaymentService service, ICartService cartService)
        {
            _paymentService = service;
            _cartService = cartService;
        }

        // Get all payments      
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<List<PaymentCreateDto>>> GetAllAsync()
        {
            var paymentList = await _paymentService.GetAllAsync();
            return Ok(paymentList);
        }

        // Get a payment by its id
        [Authorize(Roles = "Admin")]
        [HttpGet("{paymentId}")]
        public async Task<ActionResult<PaymentReadDto>> GetByIdAsync([FromRoute] Guid paymentId)
        {
            var payment = await _paymentService.GetByIdAsync(paymentId);
            return Ok(payment);
        }

        // Add a new payment       
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<PaymentReadDto>> CreateOne([FromBody] PaymentCreateDto createDto)
        {
            // the cart is what the payment is settled against, so paying is only
            // allowed for a cart the caller owns. without this any signed in
            // customer could pay off a stranger's cart, or mark it paid for free
            var cart = await _cartService.GetCartByIdAsync(createDto.CartId);
            AuthorizationUtils.EnsureOwnerOrAdmin(User, cart.UserId);

            var paymentCreated = await _paymentService.CreateOneAsync(createDto);
            return Created($"api/v1/payments/{paymentCreated.PaymentId}", paymentCreated);
        }

        // Update a payment using its id        
        [Authorize(Roles = "Admin")]
        [HttpPut("{paymentId}")]
        public async Task<ActionResult<PaymentReadDto>> UpdateOneAsync([FromRoute] Guid paymentId, [FromBody] PaymentUpdateDto updateDto)
        {
            await _paymentService.UpdateOneAsync(paymentId, updateDto);
            var updatedPayment = await _paymentService.GetByIdAsync(paymentId); // Assuming you have a method to fetch the updated category
            return Ok(updatedPayment);
        }

        // Delete a payment using its id        
        [Authorize(Roles = "Admin")]
        [HttpDelete("{paymentId}")]
        public async Task<IActionResult> DeleteOneAsync([FromRoute] Guid paymentId)
        {
            await _paymentService.DeleteOneAsync(paymentId);
            return NoContent();
        }
    }

}
