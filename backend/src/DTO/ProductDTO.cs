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
            public decimal ProductPrice { get; set; }
            public decimal? AverageRating { get; set; }
        }

        // One row per brand the catalogue actually stocks, for the home page chips.
        public class BrandSummaryDto
        {
            public string Brand { get; set; } = string.Empty;
            public int ProductCount { get; set; }
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
            // null leaves the product where it is; supplying it re-derives SubCategoryName
            // from the looked-up subcategory, the same way creation does
            public Guid? SubCategoryId { get; set; }
        }
    }
}
