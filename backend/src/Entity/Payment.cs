using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
namespace src.Entity
{
    public class Payment
    {
        public Guid PaymentId { get; set;}
        public string? PaymentMethod { get; set;}
        public DateTime PaymentDate { get; set;}
        public bool PaymentStatus { get; set;}
        public decimal TotalPrice { get; set;}
        public Guid CartId { get; set; } // Foreign key to Cart
        public Guid OrderId { get; set; } // Foreign key to Order
        public Guid? CouponId { get; set; } // Foreign key to Coupon

    }
}