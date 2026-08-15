using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using src.Entity;

namespace src.DTO
{
    public class CouponDTO
    {
        public class CouponCreateDto
        {
            public string CouponCode { get; set; }
            public decimal DiscountPercentage { get; set; }
            public bool IsActive { get; set; }
        }
        
        public class CouponReadDto
        {
            public Guid Id { get; set; }
            public string CouponCode { get; set; }
            public decimal DiscountPercentage { get; set; }
            public bool IsActive { get; set; }
        }

        public class CouponUpdateDto
        {
            public bool IsActive { get; set; }
        }

    }
}