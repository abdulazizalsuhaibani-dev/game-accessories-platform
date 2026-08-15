using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using src.Entity;
using src.Services.Category;
using src.Services.product;
using src.Services.SubCategory;
using src.Utils;
using static src.DTO.ProductDTO;
using static src.DTO.SubCategoryDTO;

// using Microsoft.AspNetCore.Authorization;

namespace src.Controller
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class SubCategoriesController : ControllerBase
    {
        protected readonly ISubCategoryService _subCategoryService;
        protected readonly IProductService _productService;

        public SubCategoriesController(ISubCategoryService service, IProductService productService)
        {
            _subCategoryService = service;
            _productService = productService;
        }

        // Get all subcategories
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<List<SubCategoryCreateDto>>> GetAllAsync()
        {
            var subCategoryList = await _subCategoryService.GetAllAsync();
            return Ok(subCategoryList);
        }

        // Get a specific category by Id
        [AllowAnonymous]
        [HttpGet("{subCategoryId}")]
        public async Task<ActionResult<SubCategoryReadDto>> GetSubCategoryByIdWithProductsAsync([FromRoute] Guid subCategoryId)
        {
            var subCategory = await _subCategoryService.GetSubCategoryByIdAsync(subCategoryId);
            return Ok(subCategory);
        }

        // Add a new subcategory
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<SubCategoryReadDto>> CreateSubCategory([FromBody] SubCategoryCreateDto createDto)
        {
            var subCategoryCreated = await _subCategoryService.CreateOneAsync(createDto);
            return Ok(subCategoryCreated);
        }

        // Update a subcategory using its id
        [Authorize(Roles = "Admin")]
        [HttpPut("{subCategoryId}")]
        public async Task<ActionResult<SubCategoryReadDto>> UpdateSubCategory([FromRoute] Guid subCategoryId, [FromBody] SubCategoryUpdateDto updateDto)
        {
            var updatedSubCategory = await _subCategoryService.UpdateOneAsync(subCategoryId, updateDto);
            return Ok(updatedSubCategory);
        }

        // Delete a subcategory using it id
        [Authorize(Roles = "Admin")]
        [HttpDelete("{subCategoryId}")]
        public async Task<IActionResult> DeleteSubCategory(Guid subCategoryId)
        {
            await _subCategoryService.DeleteOneAsync(subCategoryId);
            return NoContent();
        }

        //  View all the products inside subcategories
        [AllowAnonymous]
        [HttpGet("products")]
        public async Task<ActionResult<List<GetProductDto>>> GetAllProductsAsync([FromQuery] SearchProcess to_search)
        {
            var products = await _productService.GetAllAsync(to_search);
            return Ok(products);
        }

        //veiw all prodcuts inside specific subcategory
        [HttpGet("{subCategoryId}/products")]
        public async Task<ActionResult<List<GetProductDto>>> GetAllProductsInSubcategoryAsync(
            Guid subCategoryId,
            [FromQuery] SearchProcess to_search
        )
        {
            var subCategory = await _subCategoryService.GetSubCategoryByIdAsync(subCategoryId);
            if (subCategory == null)
            {
                throw CustomException.NotFound($"Subcategory with {subCategoryId} not found");
            }

            var products = await _productService.GetAllAsync(to_search, subCategoryId);
            return Ok(products);
        }

        // Get a product by its id inside a subcategory
        [AllowAnonymous]
        [HttpGet("products/{productId}")]
        public async Task<ActionResult<GetProductDto>> GetProductById(Guid productId)
        {
            //var isFound = await _productService.GetProductByIdAsync(productId);
            return Ok(await _productService.GetProductByIdAsync(productId));
        }

        // Add a product under a subcategory
        [Authorize(Roles = "Admin")]
        [HttpPost("{subCategoryId}/products")]
        public async Task<ActionResult<GetProductDto>> CreateProductAsync(Guid subCategoryId, [FromBody] CreateProductDto productDto)
        {
            productDto.SubCategoryId = subCategoryId;
            var newProduct = await _productService.CreateProductAsync(productDto);
            return Ok(newProduct);
        }

        // Update a product under a subcategroy by using prodcut id
        [Authorize(Roles = "Admin")]
        [HttpPut("products/{productId}")]
        public async Task<ActionResult<GetProductDto>> UpdateProductInfo(
            Guid productId,
            UpdateProductInfoDto productInfoDto
        )
        {
            var updatedInfo = await _productService.UpdateProductInfoAsync(
                productId,
                productInfoDto
            );
            return Ok(updatedInfo);
        }

        // Delete a product under a subcategroy by using prodcut id
        [Authorize(Roles = "Admin")]
        [HttpDelete("products/{productId}")]
        public async Task<ActionResult<bool>> DeleteProductByIdAsync(Guid productId)
        {
            var isDeleted = await _productService.DeleteProductByIdAsync(productId);
            return Ok(isDeleted);
        }

        // Get all subcategories that match the search using pagination
        [AllowAnonymous]
        [HttpGet("search")]
        public async Task<ActionResult<List<SubCategoryReadDto>>> GetAllSubCategpryBySearch([FromQuery] PaginationOptions paginationOptions)
        {
            var subCategpryList = await _subCategoryService.GetAllBySearchAsync(paginationOptions);
            return Ok(subCategpryList);
        }
    }
}