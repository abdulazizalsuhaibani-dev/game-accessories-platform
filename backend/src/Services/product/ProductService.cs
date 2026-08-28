using AutoMapper;
using Microsoft.EntityFrameworkCore;
using src.Entity;
using src.Repository;
using src.Utils;
using static src.DTO.ProductDTO;

namespace src.Services.product
{
    public class ProductService : IProductService
    {
        private readonly ProductRepository _productRepository;
        private readonly SubCategoryRepository _subCategories;
        private readonly IMapper _mapper;

        public ProductService(
            ProductRepository productRepository,
            SubCategoryRepository subCategoryRepository,
            IMapper mapper
        )
        {
            _productRepository = productRepository;
            _subCategories = subCategoryRepository;
            _mapper = mapper;
        }

        // the image is a client-supplied string written straight onto the entity, so an
        // admin typo - or a javascript: url - used to reach the catalogue unchecked.
        // blank means "no image" and is normalised to null, which on update leaves the
        // existing one alone the same way a null does. anything else has to be an
        // absolute https url of a sane length.
        private const int ProductImageMaxLength = 2048;

        private static string? ValidateProductImage(string? productImage)
        {
            if (string.IsNullOrWhiteSpace(productImage))
                return null;

            var trimmed = productImage.Trim();

            if (trimmed.Length > ProductImageMaxLength)
                throw CustomException.BadRequest(
                    $"Product image url cannot be longer than {ProductImageMaxLength} characters"
                );

            if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps)
                throw CustomException.BadRequest("Product image must be an absolute https url");

            return trimmed;
        }

        //Raghad
        public async Task<GetProductDto> CreateProductAsync(CreateProductDto createProductDto)
        {
            var productImage = ValidateProductImage(createProductDto.ProductImage);

            var subCategory = await _subCategories.GetByIdAsync(createProductDto.SubCategoryId);

            // a well-formed guid for a subcategory that does not exist used to NRE on the
            // read below and surface as a 500
            if (subCategory is null)
                throw CustomException.NotFound($"Sub-category with id {createProductDto.SubCategoryId} not found");

            // Create a new Product entity
            var product = new Product
            {
                ProductId = Guid.NewGuid(),
                ProductName = createProductDto.ProductName,
                ProductImage = productImage,
                ProductColor = createProductDto.ProductColor,
                Description = createProductDto.Description,
                SKU = createProductDto.SKU,
                ProductPrice = createProductDto.ProductPrice,
                SubCategoryId = subCategory.SubCategoryId,
                SubCategoryName = subCategory.Name // Link to the correct subcategory

            };

            // Save the product using the repository
            var newProduct = await _productRepository.AddProductAsync(product);
            // var subCategory = await _subCategories.GetByIdAsync(newProduct.SubCategoryId);
            // Save the product using the repository
            // var newProduct = await _productRepository.AddProductAsync(product);
            // var subCategory = await _subCategories.GetByIdAsync(newProduct.SubCategoryId);

            return new GetProductDto
            {
                ProductId = newProduct.ProductId,
                ProductName = newProduct.ProductName,
                ProductImage = newProduct.ProductImage,
                ProductColor = newProduct.ProductColor,
                Description = newProduct.Description,
                SKU = newProduct.SKU,
                ProductPrice = newProduct.ProductPrice,
                SubCategoryName = newProduct.SubCategoryName,
                SubCategoryId = newProduct.SubCategoryId,
            };
        }

        //get all products
        public async Task<List<GetProductDto>> GetAllProductsAsync()
        {
            var productsList = await _productRepository.GetAllProductsAsync();
            return _mapper.Map<List<Product>, List<GetProductDto>>(productsList);
        }

        // Get products count
        public async Task<int> CountProductsAsync()
        {
            return await _productRepository.CountProductsAsync();
        }

        // Get the count of the products matching a search and its filters
        public async Task<int> CountProductsAsync(SearchProcess to_search, Guid? SubCategoryId = null)
        {
            return await _productRepository.CountProductsAsync(to_search, SubCategoryId);
        }

        //get all products in specific subcategory
        public async Task<List<GetProductDto>> GetProductsBySubCategoryIdAsync(Guid subCategoryId)
        {
            var products = await _productRepository.GetProductsBySubCategoryIdAsync(subCategoryId);

            return products
                .Select(product => new GetProductDto
                {
                    ProductId = product.ProductId,
                    ProductName = product.ProductName,
                    ProductColor = product.ProductColor,
                    Description = product.Description,
                    SKU = product.SKU,
                    ProductPrice = product.ProductPrice,
                    SubCategoryName = product.SubCategoryName, // Access the SubCategory name here
                    SubCategoryId = product.SubCategoryId,
                })
                .ToList();
        }

        //get all products by using the search by name & pagination
        public async Task<List<GetProductDto>> GetAllBySearchAsync(
            PaginationOptions paginationOptions
        )
        {
            var productsList = await _productRepository.GetAllResults(paginationOptions);
            if (productsList.Count == 0)
            {
                throw CustomException.NotFound($"No results found");
            }
            return _mapper.Map<List<Product>, List<GetProductDto>>(productsList);
        }

        //get all products by using filter feature
        public async Task<List<GetProductDto>> GetAllByFilterationAsync(FilterationOptions productf)
        {
            var productsList = await _productRepository.GetAllByFilteringAsync(productf);

            return _mapper.Map<List<Product>, List<GetProductDto>>(productsList);
        }

        //get all products by using sort feature
        public async Task<List<GetProductDto>> GetAllBySortAsync(SortOptions sortOption)
        {
            var productsList = await _productRepository.GetAllBySortAsync(sortOption);
            return _mapper.Map<List<Product>, List<GetProductDto>>(productsList);
        }

        //get all products by using the search by name & pagination & filer & sort
        public async Task<List<GetProductDto>> GetAllAsync(SearchProcess to_search, Guid? SubCategoryId = null)
        {
            var productsList = await _productRepository.GetAllAsync(to_search, SubCategoryId);
            return _mapper.Map<List<Product>, List<GetProductDto>>(productsList);
        }

        //get product by id
        public async Task<GetProductDto> GetProductByIdAsync(Guid id)
        {
            var isFound = await _productRepository.GetProductByIdAsync(id);
            if (isFound is null)
            {
                throw CustomException.NotFound($"Product with id {id} not found");
            }
            return _mapper.Map<Product, GetProductDto>(isFound);
        }

        //update product info
        public async Task<GetProductDto> UpdateProductInfoAsync(
            Guid id,
            UpdateProductInfoDto product
        )
        {
            var isFound = await _productRepository.GetProductByIdAsync(id);

            if (isFound is null)
            {
                throw CustomException.NotFound($"Product with id {id} not found");
            }

            // validated before the map, so a rejected url never reaches the entity
            product.ProductImage = ValidateProductImage(product.ProductImage);

            _mapper.Map(product, isFound);

            // Moving a product between subcategories was impossible: the DTO carried no
            // subcategory, so the admin grid stripped the field before sending. Name and id
            // have to move together - SubCategoryName is denormalised onto the row, and a
            // stale one hides the product under a category it no longer belongs to.
            if (product.SubCategoryId is Guid subCategoryId)
            {
                var subCategory = await _subCategories.GetByIdAsync(subCategoryId);
                if (subCategory is null)
                    throw CustomException.NotFound($"Sub-category with id {subCategoryId} not found");

                isFound.SubCategoryId = subCategory.SubCategoryId;
                isFound.SubCategoryName = subCategory.Name;
            }

            var updatedProduct = await _productRepository.UpdateProductInfoAsync(isFound);
            return _mapper.Map<Product, GetProductDto>(updatedProduct);
        }

        //delete product by id
        public async Task<bool> DeleteProductByIdAsync(Guid id)
        {
            var isFound = await _productRepository.GetProductByIdAsync(id);

            if (isFound is null)
            {
                throw CustomException.NotFound($"Product with id {id} not found");
            }

            await _productRepository.DeleteProductAsync(isFound);
            return true;
        }
    }
}
