using static src.DTO.CartDTO;
using src.Entity;
namespace src.Services.cart
{
    public interface ICartService
    {
        //create new cart
        Task<CartReadDto> CreateCartAsync(CartCreateDto createDto);

        //get all carts
        Task<List<CartReadDto>> GetCartsAsync();

        //get cart by id
        Task<CartReadDto> GetCartByIdAsync(Guid id);

        //delete cart
        Task<bool> DeleteCartByIdAsync(Guid id);

        //update cart
        Task<CartReadDto> UpdateCartAsync(Guid id, CartUpdateDto updateDto);

    }
}