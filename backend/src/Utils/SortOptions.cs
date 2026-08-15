namespace src.Utils
{
    public enum SortOrder
    {
        Ascending, //when testing the value on postman , the value will be 0
        Descending, //when testing the value on postman , the value will be 1
    }

    /* 1.The sort options that currently applied
    PRODUCT_PRICE DESC = HIGHEST TO LOWEST PRICE
    PRODUCT_PRICE ASC = LOWEST TO HIGHEST PRICE
    PRODUCT_SKU ASC = RUNNING OUT OF STORAGE SOON
    
    ---------------------------------------------
    2. The Sort options to applied in the future:
    PRODUCT_ADDED_DATE DESC = NEW ARRIVALS => Done
    PRODUCT_REVIEW DESC = HIGH REVIEWS => Done
    */


    public class SortOptions
    {
        public SortOrder SortOrder { get; set; } = SortOrder.Ascending;
        public string SortBy {get;set;} ="price";

        

    }
}
