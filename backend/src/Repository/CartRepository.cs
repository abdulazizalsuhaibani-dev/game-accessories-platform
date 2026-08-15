using Microsoft.EntityFrameworkCore;
using src.Database;
using src.Entity;
using src.Utils;

namespace src.Repository
{
    public class CartRepository
    {
        private readonly DatabaseContext _dbContext;
        /* this class will be used to interact with two tables in the database 1-cart 2-cartDetails. 
        Therefore it will be using the database context to interact with the database directly 
        No need to use a private variable like _cart.
        using two variables _cart and _cartDetails is a valid way to do it.
        However, it is not a good practice.
        */
        public CartRepository(DatabaseContext dbContext)
        {
            _dbContext = dbContext;
        }
        //create new cart
        public async Task<Cart> CreateCartAsync(Cart newCart)
        {
            CartUtils.CalculateCartFields(newCart);
            await _dbContext.Cart.AddAsync(newCart);
            await _dbContext.SaveChangesAsync();
            return newCart;
        }

        //find cart by id
        public async Task<Cart?> GetCartByIdAsync(Guid id)
        {
            return await _dbContext.Cart
                .Include(c => c.CartDetails)
                    .ThenInclude(cd => cd.Product)
                .FirstOrDefaultAsync(c => c.Id == id);
        }



        //delete cart
        public async Task<bool> DeleteCartAsync(Cart cart)
        {
            var cartDetails = await _dbContext.CartDetails.Where(cd => cd.CartId == cart.Id).ToListAsync();
            if (cartDetails.Any())
            {
                _dbContext.CartDetails.RemoveRange(cartDetails);
            }
            _dbContext.Cart.Remove(cart);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        //update cart
        public async Task<Cart?> UpdateCartAsync(Cart cart)
        {
            CartUtils.CalculateCartFields(cart);
            _dbContext.Cart.Update(cart);
            await _dbContext.SaveChangesAsync();
            return cart;
        }

        //get all carts
        public async Task<List<Cart>> GetAllCartsAsync()
        {
            return await _dbContext.Cart.Include(c => c.CartDetails).ThenInclude(cd => cd.Product).ToListAsync();
        }

        //get product by id to use in cart
        public async Task<Product?> GetProductByIdForCartAsync(Guid productId)
        {
            return await _dbContext.Product.FindAsync(productId);
        }
    }
}