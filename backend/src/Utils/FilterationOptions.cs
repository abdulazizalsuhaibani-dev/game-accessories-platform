namespace src.Utils
{
    public class FilterationOptions
    {
        /*Criteria : name, color ,price range 
        -------------------------------------
        Criteria might be added: 
        Subcategory
        */
        public string? Name { get; set; }
        public string? Color { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }

        //public string Subcategory {get;set;} : to filter products based on the subcategory, do I need it


        /* If I want to implement the pagination here,
         public int? Page { get; set; }
        public int? PageSize { get; set; }

        public int Offset {get;set;} =0;
        public int Limit {get;set;} =0;

        */
    }
}
