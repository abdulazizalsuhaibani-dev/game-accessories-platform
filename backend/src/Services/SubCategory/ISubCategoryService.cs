using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using src.Services;
using src.Utils;
using static src.DTO.SubCategoryDTO;

namespace src.Services.SubCategory
{
    public interface ISubCategoryService
    {
        Task<SubCategoryReadDto> CreateOneAsync(SubCategoryCreateDto newSubCategory);
        Task<List<SubCategoryReadDto>> GetAllAsync();
        Task<List<SubCategoryReadDto>>GetAllBySearchAsync(PaginationOptions paginationOptions);
        Task<SubCategoryReadDto?> GetSubCategoryByIdAsync(Guid subCategoryId);
        Task<bool> DeleteOneAsync(Guid subCategoryId);
        Task<bool> UpdateOneAsync(Guid subCategoryId, SubCategoryUpdateDto updateDto);

    }
}