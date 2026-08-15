namespace src.Entity
{
    public class CartDetails
    {
        public Guid CartDetailsId { get; set; }
        public Product Product { get; set; }
        public Guid CartId { get; set; }
        private int quantity;

        public int Quantity
        {
            get { return quantity; }
            set
            {
                quantity = value;
                Subtotal = Product != null ? Product.ProductPrice * quantity : 0;
            }
        }
        public decimal Subtotal { get; private set; }
    }
}
