using System;
using Microsoft.EntityFrameworkCore;
using src.Database;
using src.Entity;
using src.Services;
using src.Utils;

namespace src.Repository
{
    public class SubCategoryRepository
    {
        protected DbSet<SubCategory> _subCategories;
        protected DbSet<Product> _products;
        protected DatabaseContext _databaseContext;

        public SubCategoryRepository(DatabaseContext databaseContext)
        {
            _products = databaseContext.Set<Product>();
            _databaseContext = databaseContext;
            _subCategories = databaseContext.Set<SubCategory>();
        }

        // Add a subcategory
        public async Task<SubCategory> AddAsync(SubCategory newSubCategory)
        {
            await _subCategories.AddAsync(newSubCategory);
            await _databaseContext.SaveChangesAsync();
            return newSubCategory;
        }

        // Get all subcategories
        public async Task<List<SubCategory>> GetAllAsync()
        {
            return await _subCategories
                .Include(sb => sb.Category)
                .Include(p => p.Products)
                .ToListAsync();
        }

        // Get a subcategory by id
        public async Task<SubCategory> GetByIdAsync(Guid subCategoryId)
        {
            return await _subCategories
                .Include(sb => sb.Category)  
                .Include(sb => sb.Products)  
                .FirstOrDefaultAsync(sb => sb.SubCategoryId == subCategoryId);   
        }

        // Delete a subcategory
        public async Task<bool> DeleteOneAsync(SubCategory subCategory)
        {
            _subCategories.Remove(subCategory);
            await _databaseContext.SaveChangesAsync();
            return true;
        }

        // Update a subcategory
        public async Task<bool> UpdateOneAsync(SubCategory updateSubCategory)
        {
            _subCategories.Update(updateSubCategory);
            await _databaseContext.SaveChangesAsync();
            return true;
        }

        // Get subcategories by using the search 
        public async Task<List<SubCategory>> GetAllResults(PaginationOptions paginationOptions) //this method will apply the basic search functionality with the pagination only
        {
            var result = _subCategories
            .Include(sc => sc.Category) 
            .Include(sc => sc.Products) 
            .Where(sc =>sc.Name.ToLower().Contains(paginationOptions.Search.ToLower())
            );
            return await result
                .Skip(paginationOptions.Offset)
                .Take(paginationOptions.Limit)
                .ToListAsync();
        }
    }
}
