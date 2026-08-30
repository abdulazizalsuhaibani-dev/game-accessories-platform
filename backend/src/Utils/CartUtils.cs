using src.Entity;

namespace src.Utils
{
    public static class CartUtils
    {
        public static string ThereIsLowStockProduct(Cart cart)
        {
            var lowStockProduct = cart.CartDetails.FirstOrDefault(p => p.Product.SKU < p.Quantity);
            if (lowStockProduct != null)
            {
                return lowStockProduct.Product.ProductName;
            }
            return "";
        }
        public static void CalculateCartFields(Cart cart)//must be called after adding or removing products
        {
            // Line subtotals are recomputed here too, from the UnitPrice captured when
            // the line was built. They used to be a side effect of CartDetails.Quantity's
            // setter, which made every subtotal depend on the order of an object
            // initializer; doing all three sums in the one place the repository already
            // calls on each write removes that trap.
            foreach (var cartDetail in cart.CartDetails)
            {
                cartDetail.Subtotal = cartDetail.UnitPrice * cartDetail.Quantity;
            }
            cart.CartQuantity = cart.CartDetails.Sum(cd => cd.Quantity);
            cart.TotalPrice = cart.CartDetails.Sum(cd => cd.Subtotal);
        }
    }
}