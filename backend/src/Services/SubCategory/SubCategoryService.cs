using System;
using System.Globalization;
using AutoMapper;
using src.Repository;
using src.Utils;
using src.Services;
using static src.DTO.SubCategoryDTO;
using static src.DTO.ProductDTO;
using src.Database;

namespace src.Services.SubCategory
{
    public class SubCategoryService : ISubCategoryService
    {
        private readonly SubCategoryRepository _subCategoryRepo;
        private readonly CategoryRepository _categoryRepo;
        private readonly IMapper _mapper;

        public SubCategoryService(SubCategoryRepository subCategoryRepo, CategoryRepository categoryRepo, IMapper mapper)
        { 
            _subCategoryRepo = subCategoryRepo;
            _categoryRepo = categoryRepo;
            _mapper = mapper;
        }

        // Create a subcategory
        public async Task<SubCategoryReadDto> CreateOneAsync(SubCategoryCreateDto createDto)
        {
            var category = await _categoryRepo.GetByIdAsync(createDto.CategoryId);
            if (category == null)
            {
                throw CustomException.NotFound("Category does not exist."); //TRYING TO USE CUSTOME Ex
            }
            // Create a new SubCategory entity
            var newSubCategory = new src.Entity.SubCategory
            {
                Name = createDto.Name,
                CategoryId = createDto.CategoryId,
                Products= createDto.Products
            };

            var savedSubCategory = await _subCategoryRepo.AddAsync(newSubCategory);
            var subCategoryReadDto = new SubCategoryReadDto
            {
                SubCategoryId = savedSubCategory.SubCategoryId,
                Name = savedSubCategory.Name,
                CategoryId = savedSubCategory.CategoryId,
                CategoryName = category.CategoryName 
            };
            return subCategoryReadDto;
        }

        // Get all subcategories
        public async Task<List<SubCategoryReadDto>> GetAllAsync()
        {
            var subCategoryList = await _subCategoryRepo.GetAllAsync();
            // Map the CategoryName
            var subCategoryReadDtoList = subCategoryList.Select(subCategory => new SubCategoryReadDto
            {
                SubCategoryId = subCategory.SubCategoryId,
                Name = subCategory.Name,
                CategoryId = subCategory.CategoryId,
                CategoryName = subCategory.Category.CategoryName, // Map the Category Name
                Products = subCategory.Products.Select(product => new GetProductDto
                {
                    ProductId = product.ProductId,
                    ProductName = product.ProductName,
                    ProductColor = product.ProductColor,
                    Description = product.Description,
                    SKU = product.SKU,
                    ProductPrice = product.ProductPrice,
                    Weight = product.Weight,
                    AverageRating=product.AverageRating,
                    SubCategoryId = product.SubCategoryId,
                    SubCategoryName= product.SubCategoryName
                }).ToList()
            }).ToList();

            return subCategoryReadDtoList;
        }

        // Get a subcategory by id
        public async Task<SubCategoryReadDto?> GetSubCategoryByIdAsync(Guid subCategoryId)
        {
            var subCategory = await _subCategoryRepo.GetByIdAsync(subCategoryId);
            if (subCategory == null)
            {
                throw CustomException.NotFound($"SubCategory with Id: {subCategoryId} is not found");
            }
            return new SubCategoryReadDto
            {
                SubCategoryId = subCategory.SubCategoryId,
                Name = subCategory.Name,
                CategoryId = subCategory.CategoryId,
                CategoryName = subCategory.Category?.CategoryName, 
                Products = subCategory.Products.Select(p => new GetProductDto
                {
                    ProductId = p.ProductId,
                    ProductName = p.ProductName,
                    ProductColor = p.ProductColor,
                    Description = p.Description,
                    SKU = p.SKU,
                    ProductPrice = p.ProductPrice,
                    Weight = p.Weight,
                    SubCategoryId = p.SubCategoryId,
                    SubCategoryName = p.SubCategoryName
                }).ToList()
            };
        }

        // Get subcategories based on the search
        public async Task<List<SubCategoryReadDto>> GetAllBySearchAsync(PaginationOptions paginationOptions) 
        {
            var subCategoryList = await _subCategoryRepo.GetAllResults(paginationOptions);
            if (subCategoryList.Count == 0)
            {
                throw CustomException.NotFound($"No results found");
            }
            // Mapping to SubCategoryReadDto
            return subCategoryList.Select(sc => new SubCategoryReadDto
            {
                SubCategoryId = sc.SubCategoryId,
                CategoryId = sc.CategoryId,
                Name = sc.Name,
                CategoryName = sc.Category?.CategoryName 
            }).ToList();
        }

        // Update a subcategory by id
        public async Task<bool> UpdateOneAsync(Guid subCategoryId, SubCategoryUpdateDto updateDto)
        {
            // Retrieve the existing subcategory by its ID
            var foundSubCategory = await _subCategoryRepo.GetByIdAsync(subCategoryId);
            if (foundSubCategory == null)
            {
                throw CustomException.NotFound($"SubCategory with Id: {subCategoryId} is not found");
            }
            _mapper.Map(updateDto, foundSubCategory);
            return await _subCategoryRepo.UpdateOneAsync(foundSubCategory); 
        }

        // Delete a subcategory by id
        public async Task<bool> DeleteOneAsync(Guid subCategoryId)
        {
            var foundSubCategory = await _subCategoryRepo.GetByIdAsync(subCategoryId);
            if (foundSubCategory == null)
            {
                throw CustomException.NotFound($"SubCategory with Id: {subCategoryId} is not found");
            }
            return await _subCategoryRepo.DeleteOneAsync(foundSubCategory);
        }
    }
}