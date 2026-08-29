namespace src.Repository
{
    // A read model rather than an entity: brands are a column on Product, not a table
    // of their own, so "which brands does the store stock" is a grouping over the
    // catalogue rather than a row anyone can look up.
    public class BrandSummary
    {
        public string Brand { get; set; } = string.Empty;
        public int ProductCount { get; set; }
    }
}
