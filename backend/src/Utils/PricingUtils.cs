using src.Entity;

namespace src.Utils
{
    /// <summary>
    /// Every discount in the system goes through here, so that a sale and a coupon
    /// cannot disagree about what a percentage means.
    ///
    /// The convention is a whole percent, 0-100. PaymentService used to read
    /// Coupon.DiscountPercentage as a fraction - total * (1 - 20) for a 20% coupon,
    /// which is a negative total - and nothing clamped it. ApplyPercentage is the
    /// single answer to "what does this number do to that amount".
    /// </summary>
    public static class PricingUtils
    {
        public static decimal ClampPercentage(decimal percent)
        {
            if (percent < 0m) return 0m;
            if (percent > 100m) return 100m;
            return percent;
        }

        public static decimal ApplyPercentage(decimal amount, decimal percent)
        {
            var discounted = amount * (1m - ClampPercentage(percent) / 100m);
            return decimal.Round(discounted, 2, MidpointRounding.AwayFromZero);
        }

        /// <summary>
        /// A null bound is open-ended: no start means the sale is already running,
        /// no end means it runs until the percentage is set back to zero.
        /// </summary>
        public static bool IsOnSale(decimal percent, DateTime? startsAt, DateTime? endsAt, DateTime nowUtc)
        {
            if (ClampPercentage(percent) <= 0m) return false;
            if (startsAt.HasValue && startsAt.Value > nowUtc) return false;
            if (endsAt.HasValue && endsAt.Value <= nowUtc) return false;
            return true;
        }

        public static bool IsOnSale(Product product, DateTime nowUtc) =>
            IsOnSale(product.DiscountPercentage, product.SaleStartsAt, product.SaleEndsAt, nowUtc);

        /// <summary>
        /// What the customer is actually charged for one unit right now. Cart lines
        /// capture this at creation so a finished order does not re-price itself when
        /// the sale ends.
        /// </summary>
        public static decimal EffectiveUnitPrice(Product product, DateTime nowUtc) =>
            IsOnSale(product, nowUtc)
                ? ApplyPercentage(product.ProductPrice, product.DiscountPercentage)
                : product.ProductPrice;

        /// <summary>
        /// The sale price to advertise, or null when there is nothing to advertise.
        /// Returning null rather than a copy of the list price is what lets the
        /// storefront decide whether to draw a struck-through original without
        /// repeating the date arithmetic - and without the client's clock mattering.
        /// </summary>
        public static decimal? SalePriceOrNull(decimal listPrice, decimal percent, DateTime? startsAt, DateTime? endsAt, DateTime nowUtc)
        {
            if (!IsOnSale(percent, startsAt, endsAt, nowUtc)) return null;
            var sale = ApplyPercentage(listPrice, percent);
            return sale < listPrice ? sale : null;
        }
    }
}
