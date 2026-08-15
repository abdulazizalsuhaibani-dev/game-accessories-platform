using Microsoft.EntityFrameworkCore;
using src.Database;
using src.Entity;
using src.Utils;

namespace src.Repository
{
    public class ProductRepository
    {
        protected DbSet<Product> _products;
        protected DatabaseContext _databaseContext;

        public ProductRepository(DatabaseContext databaseContext)
        {
            _databaseContext = databaseContext;
            _products = databaseContext.Set<Product>();
        }

        // add a new product:
        public async Task<Product> AddProductAsync(Product product)
        {
            await _products.AddAsync(product);
            await _databaseContext.SaveChangesAsync();
            return product;
        }

        public async Task<List<Product>> GetAllProductsAsync()
        {
            return await _products
            // .Include(p => p.SubCategoryName)
            .ToListAsync();
        }

        // count products

        public async Task<int> CountProductsAsync()
        {
            return await _products.CountAsync();
        }

        //get all products in specific subcategory
        public async Task<List<Product>> GetProductsBySubCategoryIdAsync(Guid subCategoryId)
        {
            return await _products
                .Where(p => p.SubCategoryId == subCategoryId) // Filter by SubCategoryId
                .ToListAsync();
        }

        //get all products by using the search name & pagination
        public async Task<List<Product>> GetAllResults(PaginationOptions paginationOptions)
        { // check the naming convention
            var result = _products.Where(x =>
                x.ProductName.ToLower().Contains(paginationOptions.Search.ToLower())
            );
            return await result
                .Skip(paginationOptions.Offset)
                .Take(paginationOptions.Limit)
                .ToListAsync();
        }

        //get all products by using filter feature
        public async Task<List<Product>> GetAllByFilteringAsync(FilterationOptions criteria)
        {
            IQueryable<Product> query = _products;
            // var result = await _products.ToListAsync();
            if (!string.IsNullOrEmpty(criteria.Name))
            {
                query = query.Where(x => x.ProductName.ToLower() == criteria.Name.ToLower());
                // result = result.Where(x => x.ProductColor.ToLower() == criteria.Color.ToLower());
            }

            if (!string.IsNullOrEmpty(criteria.Color))
            {
                query = query.Where(x => x.ProductColor.ToLower() == criteria.Color.ToLower());
            }

            if (criteria.MinPrice.HasValue)
            {
                query = query.Where(x => x.ProductPrice >= criteria.MinPrice.Value);
            }

            if (criteria.MaxPrice.HasValue)
            {
                query = query.Where(x => x.ProductPrice <= criteria.MaxPrice.Value);
            }

            return await query.ToListAsync();
        }

        //get all products by using sort feature
        public async Task<List<Product>> GetAllBySortAsync(SortOptions sortOption)
        {
            IQueryable<Product> query = _products;

            if (!string.IsNullOrEmpty(sortOption.SortBy))
            {
                if (sortOption.SortBy.Equals("price", StringComparison.OrdinalIgnoreCase))
                {
                    query =
                        sortOption.SortOrder == SortOrder.Descending
                            ? query.OrderByDescending(x => x.ProductPrice)
                            : query.OrderBy(x => x.ProductPrice);
                }
                else if (sortOption.SortBy.Equals("sku", StringComparison.OrdinalIgnoreCase))
                {
                    query =
                        sortOption.SortOrder == SortOrder.Descending
                            ? query.OrderByDescending(x => x.SKU)
                            : query.OrderBy(x => x.SKU);
                }
                else if (sortOption.SortBy.Equals("rating", StringComparison.OrdinalIgnoreCase))
                {
                    query =
                        sortOption.SortOrder == SortOrder.Descending
                            ? query.OrderByDescending(x => x.AverageRating)
                            : query.OrderBy(x => x.AverageRating);
                }
                else if (sortOption.SortBy.Equals("date", StringComparison.OrdinalIgnoreCase))
                {
                    query =
                        sortOption.SortOrder == SortOrder.Descending
                            ? query.OrderByDescending(x => x.AddedDate)
                            : query.OrderBy(x => x.AddedDate);
                }
            }
            return await query.ToListAsync();
        }

        //get all products by using the search by name & pagination & filer & sort
        public async Task<List<Product>> GetAllAsync(
            SearchProcess toSearch,
            Guid? SubCategoryId = null
        )
        {
            //implement search
            //all products in all subcategories
            var search_result = _products.Where(x =>
                x.ProductName.ToLower().Contains(toSearch.Search.ToLower())
                || x.Description.ToLower().Contains(toSearch.Search.ToLower())
            );

            //or all products in specific subcategory:
            if (SubCategoryId != null)
            {
                search_result = _products.Where(x =>
                    (
                        x.ProductName.ToLower().Contains(toSearch.Search.ToLower())
                        || x.Description.ToLower().Contains(toSearch.Search.ToLower())
                    ) && x.SubCategoryId.Equals(SubCategoryId)
                );
            }

            //implement filter
            IQueryable<Product> query = search_result;

            if (!string.IsNullOrEmpty(toSearch.Name))
            {
                query = query.Where(x => x.ProductName.ToLower() == toSearch.Name.ToLower());
            }

            // if (!string.IsNullOrEmpty(toSearch.Color))
            if (toSearch.Colors != null && toSearch.Colors.Count > 0)
            {
                query = query.Where(x => toSearch.Colors.Any(color => color.ToLower()==x.ProductColor.ToLower()));
            }

            if (toSearch.MinPrice.HasValue && toSearch.MinPrice.Value > 0)
            {
                query = query.Where(x => x.ProductPrice >= toSearch.MinPrice.Value);
            }

            if (toSearch.MaxPrice.HasValue && toSearch.MaxPrice.Value > 0)
            {
                query = query.Where(x => x.ProductPrice <= toSearch.MaxPrice.Value);
            }

            //implement sort
            if (!string.IsNullOrEmpty(toSearch.SortBy))
            {
                if (toSearch.SortBy.Equals("price", StringComparison.OrdinalIgnoreCase))
                {
                    query =
                        toSearch.SortOrder == SortOrder.Descending
                            ? query.OrderByDescending(x => x.ProductPrice)
                            : query.OrderBy(x => x.ProductPrice);
                }
                else if (toSearch.SortBy.Equals("sku", StringComparison.OrdinalIgnoreCase))
                {
                    query =
                        toSearch.SortOrder == SortOrder.Descending
                            ? query.OrderByDescending(x => x.SKU)
                            : query.OrderBy(x => x.SKU);
                }
                else if (toSearch.SortBy.Equals("rating", StringComparison.OrdinalIgnoreCase))
                {
                    query =
                        toSearch.SortOrder == SortOrder.Descending
                            ? query.OrderByDescending(x => x.AverageRating)
                            : query.OrderBy(x => x.AverageRating);
                }
                else if (toSearch.SortBy.Equals("date", StringComparison.OrdinalIgnoreCase))
                {
                    query =
                        toSearch.SortOrder == SortOrder.Descending
                            ? query.OrderByDescending(x => x.AddedDate)
                            : query.OrderBy(x => x.AddedDate);
                }
            }

            //implement pagination

            query = query.Skip(toSearch.Offset).Take(toSearch.Limit);

            return await query.ToListAsync();
        }

        //get product by Id:
        public async Task<Product?> GetProductByIdAsync(Guid productId)
        {
            return await _products
            // .Include(p => p.SubCategoryName) // Eagerly load the SubCategory
            .FirstOrDefaultAsync(p => p.ProductId == productId);
        }

        //update product info
        public async Task<Product?> UpdateProductInfoAsync(Product product)
        {
            _products.Update(product);
            await _databaseContext.SaveChangesAsync();
            return product;
        }

        //delete a product
        public async Task<bool> DeleteProductAsync(Product product)
        {
            _products.Remove(product);
            await _databaseContext.SaveChangesAsync();
            return true;
        }
    }
}
