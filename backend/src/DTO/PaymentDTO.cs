namespace src.DTO
{
    public class PaymentDTO
    {
        // Base class to hold common attributes
        public class PaymentBaseDto
        {
            public string PaymentMethod { get; set; }
            
            public DateTime PaymentDate { get; set; }
            
            public bool PaymentStatus { get; set; }
            public decimal? TotalPrice { get; set; }
            public Guid CartId { get; set; }
            public Guid OrderId { get; set; }
            public Guid? CouponId { get; set; }
        }

        // DTO for creating payments
        public class PaymentCreateDto : PaymentBaseDto { }

        // DTO for reading payments
        public class PaymentReadDto : PaymentBaseDto
        {
            public Guid PaymentId { get; set; }
        }

        // DTO for updating payments
        public class PaymentUpdateDto : PaymentBaseDto { }
    }
}
