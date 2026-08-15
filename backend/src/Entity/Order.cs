using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace src.Entity
{
    public class Order
    {
        public Guid Id { get; set; }
        [Required]
        public Guid UserId { get; set; }
        [Required]
        public Guid CartId { get; set; }
        [Required]
        public Guid PaymentId { get; set; }
        [Required]
        public DateTime OrderDate { get; set; }
        [Required]
        public DateTime ShipDate { get; set; }
        [Required]
        public string? OrderStatus { get; set; }
        public bool IsDelivered { get; set; }
        [Required]
        [MaxLength(100)]
        public string? Address { get; set; }
        [Required]
        [MaxLength(50), MinLength(2)]
        public string? City { get; set; }
        [Required]
        [MaxLength(50), MinLength(2)]
        public string? State { get; set; }
        [Range(10000, 99999)]
        public int PostalCode { get; set; }
        [Required]
        public double CoordinateX { get; set; }
        [Required]
        public double CoordinateY { get; set; }
    }
}