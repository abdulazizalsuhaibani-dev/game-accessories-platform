using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using src.Entity;
using src.Services.cart;
using src.Utils;
using static src.DTO.CartDTO;

namespace src.Controller
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CartsController : ControllerBase

    {
        protected readonly ICartService _cartService;
        public CartsController(ICartService service)
        {
            _cartService = service;
        }
        // get all carts: GET api/v1/cart
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<List<CartReadDto>>> GetAllCarts()
        {
            var cartRead = await _cartService.GetCartsAsync();
            return Ok(cartRead);
        }

        //get cart by id: GET api/v1/cart/{id}
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<CartReadDto>> GetCartById(Guid id)
        {
            var cartRead = await _cartService.GetCartByIdAsync(id);
            AuthorizationUtils.EnsureOwnerOrAdmin(User, cartRead.UserId);

            return Ok(cartRead);
        }

        //create new cart: POST api/v1/cart
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<CartReadDto>> CreateCart([FromBody] CartCreateDto createDto)
        {
            // stops a customer from creating a cart that belongs to somebody else
            AuthorizationUtils.EnsureOwnerOrAdmin(User, createDto.UserId);

            var cartRead = await _cartService.CreateCartAsync(createDto);

            return CreatedAtAction(nameof(GetCartById), new { id = cartRead.Id }, cartRead);
        }

        //update cart: PUT api/v1/cart/{id}
        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<CartReadDto>> UpdateCart(Guid id, CartUpdateDto updateDto)
        {
            var foundCart = await _cartService.GetCartByIdAsync(id);
            AuthorizationUtils.EnsureOwnerOrAdmin(User, foundCart.UserId);

            var cartRead = await _cartService.UpdateCartAsync(id, updateDto);
            return Ok(cartRead);
        }

        //delete cart: DELETE api/v1/cart/{id}
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> DeleteCartById(Guid id)
        {
            var foundCart = await _cartService.GetCartByIdAsync(id);
            AuthorizationUtils.EnsureOwnerOrAdmin(User, foundCart.UserId);

            var isDeleted = await _cartService.DeleteCartByIdAsync(id);
            return Ok(isDeleted);
        }
    }
}

