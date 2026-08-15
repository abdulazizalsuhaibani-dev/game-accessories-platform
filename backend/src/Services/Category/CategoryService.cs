 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using src.Repository;
using src.Database;
using src.Entity;
using static src.DTO.CategoryDTO;
using src.Utils;

namespace src.Services.Category
{
    public class CategoryService : ICategoryService
    {
        protected readonly CategoryRepository _categoryRepo;
        protected readonly IMapper _mapper;
        public CategoryService (CategoryRepository categoryRepo, IMapper mapper)
        {
            _categoryRepo = categoryRepo;
            _mapper = mapper;
        }

        // Create a category
        public async Task <CategoryReadDto> CreateOneAsync(CategoryCreateDto createDto)
        {
            var category = _mapper.Map<CategoryCreateDto, src.Entity.Category>(createDto);
            var categoryCreated = await _categoryRepo.CreateOneAsync(category);
            return _mapper.Map<src.Entity.Category,CategoryReadDto>(categoryCreated);
        }

        // Get all categories
        public async Task<List<CategoryReadDto>> GetAllAsync()
        {
            var categoryList= await _categoryRepo.GetAllAsync();
            return _mapper.Map<List<src.Entity.Category>, List<CategoryReadDto>>(categoryList);
        }
        
        // Get a categroy by id
        public async Task<CategoryReadDto> GetByIdAsync(Guid id)
        {
            var foundCategory = await _categoryRepo.GetByIdAsync(id);
            return _mapper.Map<src.Entity.Category, CategoryReadDto> (foundCategory);
        }

        // Update a categroy by id
        public async Task<bool> UpdateOneAsync(Guid id, CategoryUpdateDto updateDto)
        {
            // Retrieves the category by ID from the repository
            var foundCategory = await _categoryRepo.GetByIdAsync(id);

            if (foundCategory == null)
            {
                throw CustomException.NotFound($"Category with Id: {id} is not found");
            }

            // Maps the update DTO fields to the existing category entity
            _mapper.Map(updateDto, foundCategory);

            // Save the updated category in the repository
            return await _categoryRepo.UpdateOneAsync(foundCategory);
        }  

        // Delete a categroy by id
        public async Task<bool> DeleteOneAsync(Guid id)
        {
            var foundCategory = await _categoryRepo.GetByIdAsync(id);
            
            if (foundCategory == null)
            {
                throw CustomException.NotFound($"Category with Id: {id} is not found");
            }
            
            return await _categoryRepo.DeleteOneAsync(foundCategory); // Proceed to delete
        } 
    }
}

