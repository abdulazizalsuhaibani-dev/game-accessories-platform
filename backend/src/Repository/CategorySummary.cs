namespace src.Repository
{
    // A read model rather than an entity: the per-category numbers the storefront
    // tiles ask for, shaped so the query can be projected in the database instead
    // of walking the Include tree that GetAllAsync builds.
    public class CategorySummary
    {
        public Guid Id { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int ProductCount { get; set; }
        public string? TopProductImage { get; set; }
    }
}
