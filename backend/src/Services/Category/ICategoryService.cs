using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static src.DTO.CategoryDTO;

namespace src.Services.Category
{
    public interface ICategoryService
    {
        Task<CategoryReadDto> CreateOneAsync(CategoryCreateDto creaDto);
        Task<List<CategoryReadDto>> GetAllAsync();

        Task<CategoryReadDto> GetByIdAsync(Guid id);
        Task<bool> DeleteOneAsync(Guid id);
        Task<bool> UpdateOneAsync(Guid id,CategoryUpdateDto updateDto);
    }
}