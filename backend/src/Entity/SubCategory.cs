using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
namespace src.Entity
{
    public class SubCategory
    {
        public Guid SubCategoryId  { get; set; } // SubCategory primary id 
        public Guid CategoryId { get; set; } // Category forigen key 
        public string Name { get; set; }
        public Category? Category { get; set; }  // Navigation property
        public List<Product>? Products { get; set; }
    }
}    
