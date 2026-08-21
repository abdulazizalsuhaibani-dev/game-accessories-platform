using Microsoft.EntityFrameworkCore;
using src.Database;
using src.Entity;
using src.Utils;
namespace src.Repository
{
    public class ReviewRepository
    {
        protected DbSet<Review> _review;
        protected DbSet<Product> _products;
        protected DatabaseContext _databaseContext;

        public ReviewRepository(DatabaseContext databaseContext)
        {
            _databaseContext = databaseContext;
            _review = databaseContext.Set<Review>();
            _products = databaseContext.Set<Product>();
        }

        public async Task<Review> CreateReviewAsync(Review review)
        {
            await _review.AddAsync(review);
            await _databaseContext.SaveChangesAsync();
            return review;
        }


        public async Task<Review?> GetReviewByIdAsync(Guid id)
        {
            return await _review.FirstOrDefaultAsync(x => x.ReviewId == id);
        }
        public async Task<List<Review>> GetReviewsByProductIdAsync(Guid productId)
        {
            return await _review.Where(x => x.ProductId == productId).ToListAsync();
        }

        public async Task<List<Review>> GetAllReviewsAsync()
        {
            return await _review.ToListAsync();
        }

        public async Task UpdateProductReviewAsync(Guid id)
        {
            var product = await _products.FirstOrDefaultAsync(x => x.ProductId == id);

            // A recompute for a product that is already gone is nothing to do, not an error.
            // The delete path calls this after the review row is committed, so throwing here
            // would report failure for work that has in fact succeeded.
            if (product == null)
                return;

            var reviewsForProduct = await _review.Where(r => r.ProductId == id).ToListAsync();// all reviews for this product

            // Average() throws on an empty sequence. Null is what the rest of the system
            // already reads as "unrated" — the catalogue's rating sort puts nulls last.
            product.AverageRating = reviewsForProduct.Count == 0
                ? null
                : (decimal)reviewsForProduct.Average(r => r.Rating);

            _products.Update(product);
            await _databaseContext.SaveChangesAsync();
        }


        public async Task<bool> DeleteReviewAsync(Review review)
        {
            _review.Remove(review);
            await _databaseContext.SaveChangesAsync();
            return true;
        }

        public async Task<Review?> UpdateReviewAsync(Review review)
        {
            _review.Update(review);
            await _databaseContext.SaveChangesAsync();
            return review;
        }

        public async Task<Product?> GetProductByIdForReviewsAsync(Guid productId)
        {
            return await _databaseContext.Product.FindAsync(productId);
        }

    }
}