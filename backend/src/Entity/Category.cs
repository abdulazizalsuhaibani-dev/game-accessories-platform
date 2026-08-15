using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
namespace src.Entity
{
    public class Category
    {
        public Guid Id { get; set; }
        public string CategoryName { get; set; }
        public List<SubCategory>? SubCategory { get; set; }
    }
}
