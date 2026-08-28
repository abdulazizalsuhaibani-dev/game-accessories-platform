using System;
using System.Collections.Generic;
using System.Linq;

using Microsoft.EntityFrameworkCore;
using src.Database;
using src.Entity;

using src.Utils;
namespace src.Repository
{
    public class CategoryRepository
    {
        protected DbSet<Category> _categories;
        protected DatabaseContext _databaseContext;

        public CategoryRepository(DatabaseContext databaseContext)
        {
            _databaseContext = databaseContext;
            _categories =databaseContext.Set<Category>();
        }

        // Create a category
        public async Task<Category> CreateOneAsync(Category newCategory)
        {
            await _categories.AddAsync(newCategory);
            await _databaseContext.SaveChangesAsync();
            return newCategory;
        }
        
        // Get all categories
        public async Task<List<Category>> GetAllAsync()
        {
            return await _categories.Include(sc=>sc.SubCategory).  
            ThenInclude(p => p.Products)
            .ToListAsync();
        }

        // One row per category, projected in the database. GetAllAsync above is the
        // only way to ask what categories exist, and it serialises every product of
        // every subcategory - the storefront needs a name, a count and one image.
        public async Task<List<CategorySummary>> GetSummariesAsync()
        {
            return await _categories
                .OrderBy(c => c.CategoryName)
                .Select(c => new CategorySummary
                {
                    Id = c.Id,
                    CategoryName = c.CategoryName,
                    ProductCount = c.SubCategory!.SelectMany(s => s.Products!).Count(),

                    // the best-rated product represents its category. rated products are
                    // ordered ahead of unrated ones - the same null-last handling the
                    // catalogue sort uses - so an unrated product is picked only when the
                    // category holds nothing else, which today is true of Gaming Chairs.
                    TopProductImage = c
                        .SubCategory!.SelectMany(s => s.Products!)
                        .Where(p => p.ProductImage != null && p.ProductImage != "")
                        .OrderByDescending(p => p.AverageRating != null)
                        .ThenByDescending(p => p.AverageRating)
                        .Select(p => p.ProductImage)
                        .FirstOrDefault(),
                })
                .ToListAsync();
        }

        // Get a category by id
         public async Task<Category> GetByIdAsync(Guid id)
        {
             return await _categories
                .Include(c => c.SubCategory)
                .ThenInclude(p => p.Products)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        // Delete a catgeory
        public async Task<bool> DeleteOneAsync(Category category)
        {
            _categories.Remove(category);
            await _databaseContext.SaveChangesAsync();
            return true;
        }  
        
        // Update a category
        public async Task<bool> UpdateOneAsync(Category updateCategory)
        {
            _categories.Update(updateCategory);
            await _databaseContext.SaveChangesAsync();
            return true;
        }
    }
}   