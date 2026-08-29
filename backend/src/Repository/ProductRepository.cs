using Microsoft.EntityFrameworkCore;
using src.Database;
using src.Entity;
using src.Utils;

namespace src.Repository
{
    public class ProductRepository
    {
        protected DbSet<Product> _products;
        protected DbSet<SubCategory> _subCategories;
        protected DatabaseContext _databaseContext;

        public ProductRepository(DatabaseContext databaseContext)
        {
            _databaseContext = databaseContext;
            _products = databaseContext.Set<Product>();
            _subCategories = databaseContext.Set<SubCategory>();
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

        // the brands the store actually stocks, grouped in the database. a brand with
        // no products in it cannot appear, which is the whole point: the home page used
        // to advertise categories that were never in the catalogue.
        public async Task<List<BrandSummary>> GetBrandsAsync()
        {
            return await _products
                .Where(product => product.Brand != null && product.Brand != "")
                .GroupBy(product => product.Brand!)
                .Select(group => new BrandSummary
                {
                    Brand = group.Key,
                    ProductCount = group.Count(),
                })
                .OrderByDescending(summary => summary.ProductCount)
                .ThenBy(summary => summary.Brand)
                .ToListAsync();
        }

        // how many products the search and filters actually match. counted before
        // Skip/Take, so it is the size of the whole result set rather than of the
        // page - which is what drives the "N results" headline and the pager
        public async Task<int> CountProductsAsync(SearchProcess toSearch, Guid? SubCategoryId = null)
        {
            return await BuildFilteredQuery(toSearch, SubCategoryId).CountAsync();
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

        // the search and filter predicates, with no sort and no paging. both the
        // page of products and its total count are built from this one method, so
        // the two can never disagree about what the result set is
        private IQueryable<Product> BuildFilteredQuery(
            SearchProcess toSearch,
            Guid? SubCategoryId = null
        )
        {
            //implement search
            //all products in all subcategories
            var search = toSearch.Search.ToLower();

            // the Arabic fields are matched too, so a customer reading the store in
            // Arabic can search in Arabic. they are nullable - a half-translated
            // catalogue is expected - and a null never matches, so an untranslated
            // product is still found by its English name
            IQueryable<Product> query = _products.Where(x =>
                x.ProductName.ToLower().Contains(search)
                || x.Description.ToLower().Contains(search)
                || (x.NameAr != null && x.NameAr.ToLower().Contains(search))
                || (x.DescriptionAr != null && x.DescriptionAr.ToLower().Contains(search))
                || (x.Brand != null && x.Brand.ToLower().Contains(search))
            );

            //or all products in specific subcategory:
            if (SubCategoryId != null)
            {
                query = query.Where(x => x.SubCategoryId.Equals(SubCategoryId));
            }

            // or every product under a category. Product carries a denormalised
            // SubCategoryId with no navigation to SubCategory, so the category has to
            // be resolved to the subcategory ids beneath it. Applied here, inside the
            // shared predicate, so the page and its count cannot disagree.
            if (toSearch.CategoryId is Guid categoryId)
            {
                var subCategoryIds = _subCategories
                    .Where(subCategory => subCategory.CategoryId == categoryId)
                    .Select(subCategory => subCategory.SubCategoryId);

                query = query.Where(x => subCategoryIds.Contains(x.SubCategoryId));
            }

            // narrows to one manufacturer. an exact match rather than a Contains, so
            // the brand chips on the home page land on that brand and nothing else
            if (!string.IsNullOrEmpty(toSearch.Brand))
            {
                query = query.Where(x =>
                    x.Brand != null && x.Brand.ToLower() == toSearch.Brand.ToLower()
                );
            }

            //implement filter
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

            // the storefront used to drop out of stock rows from the page it had
            // already fetched, which shrank the page and never reached the count
            if (toSearch.InStockOnly)
            {
                query = query.Where(x => x.SKU > 0);
            }

            return query;
        }

        //get all products by using the search by name & pagination & filer & sort
        public async Task<List<Product>> GetAllAsync(
            SearchProcess toSearch,
            Guid? SubCategoryId = null
        )
        {
            IQueryable<Product> query = BuildFilteredQuery(toSearch, SubCategoryId);

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
                    // a product nobody has rated sorts last either way. postgres puts
                    // NULLs first on a DESC, which would otherwise lead the catalogue
                    // with the products that have no rating at all
                    query =
                        toSearch.SortOrder == SortOrder.Descending
                            ? query.OrderByDescending(x => x.AverageRating.HasValue)
                                .ThenByDescending(x => x.AverageRating)
                            : query.OrderByDescending(x => x.AverageRating.HasValue)
                                .ThenBy(x => x.AverageRating);
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
