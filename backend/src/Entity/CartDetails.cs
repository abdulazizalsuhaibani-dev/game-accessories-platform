namespace src.Entity
{
    public class CartDetails
    {
        public Guid CartDetailsId { get; set; }
        public Product Product { get; set; }
        public Guid CartId { get; set; }
        public int Quantity { get; set; }

        // What this line was actually charged at, captured when the cart is built.
        // Stored rather than derived from Product.ProductPrice so that a sale ending
        // - or a price edit - cannot retroactively change what a placed order cost.
        public decimal UnitPrice { get; set; }

        // Subtotal used to be a side effect of the Quantity setter, reading
        // Product.ProductPrice. That only worked because CartService happened to
        // assign Product before Quantity in its object initializer; swapping those
        // two lines silently zeroed every subtotal. It is now computed alongside the
        // cart totals in CartUtils.CalculateCartFields, which the repository already
        // calls on every write, so ordering cannot bite.
        public decimal Subtotal { get; set; }
    }
}
