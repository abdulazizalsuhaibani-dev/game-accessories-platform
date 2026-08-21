using Microsoft.EntityFrameworkCore;
using src.Entity;
using src.Controller;
using static src.Entity.User;

namespace src.Database
{

    public class DatabaseContext : DbContext
    {
        public DbSet<Cart> Cart { get; set; }
        public DbSet<CartDetails> CartDetails { get; set; }
        public DbSet<Category> Category { get; set; }
        public DbSet<Coupon> Coupon { get; set; }
        public DbSet<Order> Order { get; set; }
        public DbSet<Payment> Payment { get; set; }
        public DbSet<Product> Product { get; set; }
        public DbSet<Review> Review { get; set; }
        public DbSet<SubCategory> SubCategory { get; set; }
        public DbSet<User> User { get; set; }
        public DatabaseContext(DbContextOptions options) : base(options) { }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasPostgresEnum<UserRole>();

            // The uniqueness of an email has to be the database's job. A service-level
            // check is two round trips away from the write, so concurrent signups both
            // pass it — and the loser can never sign in, because FindByEmailAsync takes
            // the first match. Declared here rather than only in a generated migration:
            // backend/Migrations/ is gitignored, so a fresh clone rebuilds the schema
            // from this model and would otherwise get no constraint at all.
            modelBuilder.Entity<User>()
                .HasIndex(user => user.Email)
                .IsUnique();
        }
    }
}
