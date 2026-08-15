using src.Entity;

namespace src.DTO
{
    public class CartDTO
    {
        //create new cart
        public class CartCreateDto
        {
            public Guid UserId { get; set; }
            public List<CartDetailsDto> CartDetails { get; set; }
        }

        public class CartDetailsDto
        {
            public Guid ProductId { get; set; }
            public int Quantity { get; set; }
        }

        //read cart
        public class CartReadDto
        {
            public Guid Id { get; set; }
            public Guid UserId { get; set; }
            public List<CartDetails> CartDetails { get; set; }
            public int CartQuantity { get; set; }
            public decimal TotalPrice { get; set; }

        }

        //update cart
        public class CartUpdateDto
        {
            public List<CartDetailsDto> CartDetails { get; set; }
            public int CartQuantity { get; set; }
            public decimal TotalPrice { get; set; }
        }
    }
}