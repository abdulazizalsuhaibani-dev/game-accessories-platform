using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using src.Entity;
using static src.DTO.SubCategoryDTO;

namespace src.DTO
{
    public class CategoryDTO
    {
        public class CategoryCreateDto
        {
            public string CategoryName { get ; set;}
        }
        
        public class CategoryReadDto
        {
            public Guid Id { get; set; }
            public string CategoryName { get; set; }        
            public List<SubCategoryReadDto>? SubCategory { get; set; }
        }

        public class CategoryUpdateDto
        {
            public string CategoryName { get; set; }        
        }
    }
}