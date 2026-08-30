

namespace src.Entity
{
    public class Product
    {

        public Guid SubCategoryId { get; set; }

        public string? SubCategoryName { get; set; }

        public Guid ProductId { get; set; }
        public string? ProductName { get; set; }

        // the manufacturer, as its own column. it cannot be derived from the product
        // name: live first words include "Huntsman" and "DualShock", which are Razer
        // and Sony models rather than brands
        public string? Brand { get; set; }

        // the Arabic catalogue. nullable and falling back to the English text, so a
        // half-translated catalogue renders English rather than blanks
        public string? NameAr { get; set; }

        public string? DescriptionAr { get; set; }

        public DateTime AddedDate { get; set; } = DateTime.UtcNow; // An error will occur in post man if the timestamp not in utc

        public string? ProductImage { get; set; }

        public string? ProductColor { get; set; }

        public string? Description { get; set; }

        public int SKU { get; set; }

        // the list price. it stays the list price when the product is on sale - what
        // a shopper is charged is derived from it by PricingUtils, never stored here,
        // so ending a sale is a matter of the window lapsing rather than an edit that
        // has to remember the original number
        public decimal ProductPrice { get; set; }

        // a whole percent, 0-100. zero means no sale. the window is optional at both
        // ends: no start means "already running", no end means "until switched off".
        // the effective price is computed at read time from these three, so a sale
        // expires on its own - there is no job that has to run for it to stop
        public decimal DiscountPercentage { get; set; }

        public DateTime? SaleStartsAt { get; set; }

        public DateTime? SaleEndsAt { get; set; }

        public decimal? AverageRating { get; set; }
    }
}
