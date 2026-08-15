using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using src.Entity;
using static src.DTO.ProductDTO;

namespace src.DTO
{
    public class SubCategoryDTO
    {
        public class SubCategoryCreateDto
        {
            public string Name { get ; set;}
            public Guid CategoryId { get ; set;}
            public List <Product>? Products { get; set; }
        }
  
        public class SubCategoryReadDto
        {
            public Guid SubCategoryId { get; set; }
            public string Name { get; set; }
            public Guid CategoryId{ get; set; }
            public string? CategoryName { get; set; }
            public List<GetProductDto>? Products { get; set; }
        }

        public class SubCategoryUpdateDto
        {
            public string Name{ get; set; }
            public List<UpdateProductInfoDto>? Products { get; set; }

        }
    }
}