using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using src.Database;
using src.Repository;
using src.Services.Email;
using src.Services.Subscriptions;
using src.Utils;

namespace src.Services.Notifications
{
    /// <summary>
    /// Announces sales that have become active.
    ///
    /// A sale has no event to hook: the effective price is derived at read time from a
    /// percentage and a window, which is what lets a sale expire without a job. The
    /// flip side is that a sale *starting* - especially a future-dated one - happens
    /// with nobody watching, so something has to look.
    ///
    /// SaleAnnouncedAt on the product is what makes this safe to run on a timer: it is
    /// stamped in the same save that queues the mail, so a restart cannot announce the
    /// same sale twice. Clearing the discount clears the stamp (see ProductService), so
    /// the next sale on that product announces again.
    /// </summary>
    public class SaleAnnouncerBackgroundService : BackgroundService
    {
        private static readonly TimeSpan Interval = TimeSpan.FromMinutes(10);

        private readonly IServiceProvider _services;
        private readonly ILogger<SaleAnnouncerBackgroundService> _logger;

        public SaleAnnouncerBackgroundService(
            IServiceProvider services,
            ILogger<SaleAnnouncerBackgroundService> logger
        )
        {
            _services = services;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using var timer = new PeriodicTimer(Interval);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await AnnounceAsync(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception exception)
                {
                    // a failed scan must not take the loop down - the next tick retries
                    _logger.LogError(exception, "Sale announcement scan failed");
                }

                if (!await timer.WaitForNextTickAsync(stoppingToken)) break;
            }
        }

        private async Task AnnounceAsync(CancellationToken cancellationToken)
        {
            // BackgroundService is a singleton and the repositories are scoped, so each
            // pass gets its own scope rather than capturing a disposed context
            using var scope = _services.CreateScope();
            var database = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
            var subscriptions = scope.ServiceProvider.GetRequiredService<SubscriptionRepository>();
            var queue = scope.ServiceProvider.GetRequiredService<EmailQueue>();
            var storefront = scope.ServiceProvider.GetRequiredService<StorefrontOptions>();

            var nowUtc = DateTime.UtcNow;

            var candidates = await database.Product
                .Where(product =>
                    product.DiscountPercentage > 0
                    && product.SaleAnnouncedAt == null
                    && (product.SaleStartsAt == null || product.SaleStartsAt <= nowUtc)
                    && (product.SaleEndsAt == null || product.SaleEndsAt > nowUtc)
                )
                .ToListAsync(cancellationToken);

            if (candidates.Count == 0) return;

            var subscribers = await subscriptions.GetConfirmedSalesSubscribersAsync();

            foreach (var product in candidates)
            {
                foreach (var subscriber in subscribers)
                {
                    var message = EmailTemplates.Sale(
                        subscriber.Email,
                        subscriber.Locale,
                        product.ProductName ?? "A product",
                        (int)Math.Round(PricingUtils.ClampPercentage(product.DiscountPercentage)),
                        $"{storefront.BaseUrl.TrimEnd('/')}/products/{product.ProductId}",
                        $"{storefront.BaseUrl.TrimEnd('/')}/subscriptions/unsubscribe?token={subscriber.UnsubscribeToken}"
                    );

                    if (!queue.TryEnqueue(message))
                        _logger.LogError("Outbound email queue is full - dropped a sale alert to {To}", subscriber.Email);
                }

                // Stamped even when nobody is subscribed: the sale has been considered,
                // and a subscriber who signs up tomorrow should not be mailed about a
                // sale that started last week.
                product.SaleAnnouncedAt = nowUtc;
            }

            await database.SaveChangesAsync(cancellationToken);
            _logger.LogInformation(
                "Announced {SaleCount} sale(s) to {SubscriberCount} subscriber(s)",
                candidates.Count,
                subscribers.Count
            );
        }
    }
}
