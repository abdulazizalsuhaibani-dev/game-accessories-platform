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

        //Raghad
        public async Task<GetProductDto> CreateProductAsync(CreateProductDto createProductDto)
        {
            var subCategory = await _subCategories.GetByIdAsync(createProductDto.SubCategoryId);

            // Create a new Product entity
            var product = new Product
            {
                ProductId = Guid.NewGuid(),
                ProductName = createProductDto.ProductName,
                ProductImage = createProductDto.ProductImage,
                ProductColor = createProductDto.ProductColor,
                Description = createProductDto.Description,
                SKU = createProductDto.SKU,
                ProductPrice = createProductDto.ProductPrice,
                Weight = createProductDto.Weight,
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
                Weight = newProduct.Weight,
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
                    Weight = product.Weight,
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
            _mapper.Map(product, isFound);
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
