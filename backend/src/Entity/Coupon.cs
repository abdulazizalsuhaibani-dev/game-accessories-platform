using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
namespace src.Entity
{
    public class Coupon
    {
        public Guid Id { get; set; } 
        public string CouponCode { get; set; }
        public decimal DiscountPercentage { get; set; }
        public bool IsActive { get; set; }
    }
}