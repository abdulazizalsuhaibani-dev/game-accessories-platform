using System.ComponentModel.DataAnnotations;
using src.Entity;

namespace src.DTO
{
    public class ProductDTO
    {
        //CREATE PRODUCT

        public class CreateProductDto
        {
            public string ProductName { get; set; }
            public string? Brand { get; set; }
            public string? NameAr { get; set; }
            public string ProductColor { get; set; }
            public string? ProductImage { get; set; }
            public string? Description { get; set; }
            public string? DescriptionAr { get; set; }
            public int SKU { get; set; }
            public decimal ProductPrice { get; set; }

            // a whole percent. [ApiController] turns anything outside 0-100 into a 400
            // before the service runs, so the clamp in PricingUtils is a backstop rather
            // than the only guard
            [Range(0, 100)]
            public decimal DiscountPercentage { get; set; }
            public DateTime? SaleStartsAt { get; set; }
            public DateTime? SaleEndsAt { get; set; }
            public Guid SubCategoryId { get; set; }
            public string? SubCategoryName { get; set; }
        }

        //GET ALL RPODUCTS

        public class GetProductDto
        {
            public Guid? SubCategoryId { get; set; }
            public string? SubCategoryName { get; set; }
            public Guid ProductId { get; set; }
            public string ProductName { get; set; }
            public string? Brand { get; set; }

            // null where the catalogue has not been translated yet. the storefront
            // falls back to the English field rather than rendering a blank
            public string? NameAr { get; set; }
            public string? ProductImage { get; set; }
            public DateTime AddedDate { get; set; }
            public string ProductColor { get; set; }
            public string Description { get; set; }
            public string? DescriptionAr { get; set; }
            public int SKU { get; set; }

            // the list price, always - it is not overwritten when a sale is running
            public decimal ProductPrice { get; set; }
            public decimal DiscountPercentage { get; set; }
            public DateTime? SaleStartsAt { get; set; }
            public DateTime? SaleEndsAt { get; set; }

            // What the customer would actually pay right now, or null when nothing is
            // on sale. Computed server-side on every read path so the storefront never
            // repeats the percentage or the date arithmetic - and so a client whose
            // clock is wrong cannot disagree with the price it will be charged.
            public decimal? SalePrice { get; set; }
            public decimal? AverageRating { get; set; }
        }

        // One row per brand the catalogue actually stocks, for the home page chips.
        public class BrandSummaryDto
        {
            public string Brand { get; set; } = string.Empty;
            public int ProductCount { get; set; }
        }

        // The admin form posts a file here first, then puts this url in the same
        // ProductImage field a pasted url would have gone in - create/update never
        // see the file itself.
        public class ProductImageUploadDto
        {
            public string Url { get; set; } = string.Empty;
        }

        public class GetProductListDto
        {
            public List<GetProductDto> Products { get; set; }
            public int ProductsCount { get; set; }
        }

        //UPDATE PRODUCT INFO

        public class UpdateProductInfoDto
        {
            public string ProductName { get; set; }
            public string? Brand { get; set; }
            public string? NameAr { get; set; }
            public string? ProductImage { get; set; }
            public string ProductColor { get; set; }
            public string Description { get; set; }
            public string? DescriptionAr { get; set; }
            public int SKU { get; set; }
            public decimal ProductPrice { get; set; }

            [Range(0, 100)]
            public decimal DiscountPercentage { get; set; }
            public DateTime? SaleStartsAt { get; set; }
            public DateTime? SaleEndsAt { get; set; }
            // null leaves the product where it is; supplying it re-derives SubCategoryName
            // from the looked-up subcategory, the same way creation does
            public Guid? SubCategoryId { get; set; }
        }
    }
}
