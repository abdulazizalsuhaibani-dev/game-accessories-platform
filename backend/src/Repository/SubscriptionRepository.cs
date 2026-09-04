using Microsoft.EntityFrameworkCore;
using src.Database;
using src.Entity;

namespace src.Repository
{
    public class SubscriptionRepository
    {
        protected readonly DbSet<Subscription> _subscriptions;
        protected readonly DatabaseContext _databaseContext;

        public SubscriptionRepository(DatabaseContext databaseContext)
        {
            _databaseContext = databaseContext;
            _subscriptions = databaseContext.Set<Subscription>();
        }

        public async Task<Subscription?> FindAsync(string email, SubscriptionType type, Guid? productId)
        {
            // The null case is written out rather than left to `ProductId == productId`.
            // A store-wide Sales subscription has ProductId NULL, and SQL equality
            // against NULL is never true - relying on the provider to rewrite the
            // comparison into IS NULL is the kind of thing that silently stops working
            // and shows up as duplicate subscriptions.
            if (productId is null)
            {
                return await _subscriptions.FirstOrDefaultAsync(subscription =>
                    subscription.Email == email
                    && subscription.Type == type
                    && subscription.ProductId == null
                );
            }

            return await _subscriptions.FirstOrDefaultAsync(subscription =>
                subscription.Email == email
                && subscription.Type == type
                && subscription.ProductId == productId
            );
        }

        public async Task<Subscription?> FindByConfirmTokenAsync(Guid token) =>
            await _subscriptions.FirstOrDefaultAsync(subscription => subscription.ConfirmToken == token);

        public async Task<Subscription?> FindByUnsubscribeTokenAsync(Guid token) =>
            await _subscriptions.FirstOrDefaultAsync(subscription => subscription.UnsubscribeToken == token);

        // Only confirmed rows are ever returned to the notification paths, so an
        // unconfirmed address cannot be reached even if something else goes wrong.
        public async Task<List<Subscription>> GetConfirmedForProductAsync(Guid productId)
        {
            return await _subscriptions
                .Where(subscription =>
                    subscription.Type == SubscriptionType.Restock
                    && subscription.ProductId == productId
                    && subscription.ConfirmedAt != null
                )
                .ToListAsync();
        }

        public async Task<List<Subscription>> GetConfirmedSalesSubscribersAsync()
        {
            return await _subscriptions
                .Where(subscription =>
                    subscription.Type == SubscriptionType.Sales && subscription.ConfirmedAt != null
                )
                .ToListAsync();
        }

        public async Task<Subscription> CreateAsync(Subscription subscription)
        {
            await _subscriptions.AddAsync(subscription);
            await _databaseContext.SaveChangesAsync();
            return subscription;
        }

        public async Task SaveAsync() => await _databaseContext.SaveChangesAsync();

        public async Task DeleteRangeAsync(IEnumerable<Subscription> subscriptions)
        {
            _subscriptions.RemoveRange(subscriptions);
            await _databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(Subscription subscription)
        {
            _subscriptions.Remove(subscription);
            await _databaseContext.SaveChangesAsync();
        }
    }
}
