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
        public DbSet<Subscription> Subscription { get; set; }
        public DbSet<User> User { get; set; }
        public DatabaseContext(DbContextOptions options) : base(options) { }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasPostgresEnum<UserRole>();

            // The uniqueness of an email has to be the database's job. A service-level
            // check is two round trips away from the write, so concurrent signups both
            // pass it — and the loser can never sign in, because FindByEmailAsync takes
            // the first match. Declared here rather than only in a generated migration
            // so the model is the single description of the schema, and the migration
            // follows from it. (This comment used to say backend/Migrations/ was
            // gitignored; it is committed, and Program.cs applies pending migrations
            // on startup.)
            modelBuilder.Entity<User>()
                .HasIndex(user => user.Email)
                .IsUnique();

            // Stored as text rather than an int so the table reads as "Restock" and
            // "Sales", and without adding a second Postgres enum type to map.
            modelBuilder.Entity<Subscription>()
                .Property(subscription => subscription.Type)
                .HasConversion<string>()
                .HasMaxLength(16);

            // One subscription per address per thing, so re-subscribing is idempotent - a
            // customer pressing the button twice, or a retried request, must not create a
            // second row that would mail them twice. As with User.Email above, only the
            // database can promise that against concurrent requests.
            //
            // Two filtered indexes rather than one over (Email, Type, ProductId), because
            // Postgres treats NULLs as distinct in a unique index: a store-wide Sales row
            // has ProductId NULL, so a single composite index would happily allow the same
            // address to subscribe to sales any number of times. PG 15 could express this
            // as NULLS NOT DISTINCT, but partial indexes work on any version and the
            // production database is managed elsewhere.
            modelBuilder.Entity<Subscription>()
                .HasIndex(subscription => new { subscription.Email, subscription.Type })
                .HasFilter("\"ProductId\" IS NULL")
                .IsUnique();

            modelBuilder.Entity<Subscription>()
                .HasIndex(subscription => new
                {
                    subscription.Email,
                    subscription.Type,
                    subscription.ProductId
                })
                .HasFilter("\"ProductId\" IS NOT NULL")
                .IsUnique();

            // Looked up on every confirm and unsubscribe click, and both must be
            // unique for the token to identify a single subscription.
            modelBuilder.Entity<Subscription>()
                .HasIndex(subscription => subscription.ConfirmToken)
                .IsUnique();

            modelBuilder.Entity<Subscription>()
                .HasIndex(subscription => subscription.UnsubscribeToken)
                .IsUnique();
        }
    }
}
