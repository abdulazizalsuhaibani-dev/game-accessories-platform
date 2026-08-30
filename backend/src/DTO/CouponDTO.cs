using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using src.Entity;

namespace src.DTO
{
    public class CouponDTO
    {
        public class CouponCreateDto
        {
            public string CouponCode { get; set; }

            // a whole percent, the same convention product sales use. it was previously
            // read as a fraction when applied, so a coupon stored as 20 produced a
            // negative payment total; the range guard stops the ambiguous values
            // reaching the table at all
            [Range(0, 100)]
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