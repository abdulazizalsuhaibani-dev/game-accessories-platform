using Microsoft.Extensions.Logging;
using src.Entity;
using src.Repository;
using src.Services.Email;
using src.Utils;

namespace src.Services.Subscriptions
{
    public class StorefrontOptions
    {
        // where the confirm and unsubscribe links point. The links go to the
        // storefront, not the API, so the customer lands on a real page - which is also
        // why none of this needs a CORS change: the page then calls the API from an
        // origin that is already on the allowlist.
        public string BaseUrl { get; set; } = "https://game-accessories-store.onrender.com";
    }

    public class SubscriptionService : ISubscriptionService
    {
        private readonly SubscriptionRepository _subscriptions;
        private readonly ProductRepository _products;
        private readonly EmailQueue _queue;
        private readonly StorefrontOptions _storefront;
        private readonly ILogger<SubscriptionService> _logger;

        public SubscriptionService(
            SubscriptionRepository subscriptions,
            ProductRepository products,
            EmailQueue queue,
            StorefrontOptions storefront,
            ILogger<SubscriptionService> logger
        )
        {
            _subscriptions = subscriptions;
            _products = products;
            _queue = queue;
            _storefront = storefront;
            _logger = logger;
        }

        private static string NormaliseEmail(string email) => email.Trim().ToLowerInvariant();

        private static string NormaliseLocale(string? locale) =>
            string.Equals(locale, "ar", StringComparison.OrdinalIgnoreCase) ? "ar" : "en";

        private string ConfirmUrl(Guid token) =>
            $"{_storefront.BaseUrl.TrimEnd('/')}/subscriptions/confirm?token={token}";

        private string UnsubscribeUrl(Guid token) =>
            $"{_storefront.BaseUrl.TrimEnd('/')}/subscriptions/unsubscribe?token={token}";

        private string ProductUrl(Guid productId) =>
            $"{_storefront.BaseUrl.TrimEnd('/')}/products/{productId}";

        /// <summary>
        /// Records the subscription and sends a confirmation.
        ///
        /// Returns nothing on purpose. The controller answers 202 with a fixed body
        /// whatever happens here, so that a caller cannot tell a new address from one
        /// that was already subscribed - and in particular cannot use this endpoint to
        /// find out whether an email has an account on the platform.
        /// </summary>
        public async Task SubscribeAsync(string email, SubscriptionType type, Guid? productId, string? locale)
        {
            var normalisedEmail = NormaliseEmail(email);
            var normalisedLocale = NormaliseLocale(locale);

            // Sales is store-wide, so a product id on it would create a second row that
            // the store-wide query never matches
            if (type == SubscriptionType.Sales) productId = null;

            if (type == SubscriptionType.Restock)
            {
                if (productId is not Guid id)
                    throw CustomException.BadRequest("A restock subscription needs a productId");

                var product = await _products.GetProductByIdAsync(id);
                if (product is null)
                    throw CustomException.NotFound($"Product with id {id} not found");
            }

            var existing = await _subscriptions.FindAsync(normalisedEmail, type, productId);

            if (existing is not null)
            {
                // Already confirmed: do nothing at all. Re-sending a confirmation to a
                // confirmed address is a way to have this endpoint mail anyone on demand.
                if (existing.ConfirmedAt is not null) return;

                // Pending: re-send the same token rather than minting a new one, so that
                // an earlier email the customer is still looking at keeps working.
                existing.Locale = normalisedLocale;
                await _subscriptions.SaveAsync();
                Enqueue(EmailTemplates.Confirm(
                    existing.Email,
                    existing.Locale,
                    ConfirmUrl(existing.ConfirmToken),
                    UnsubscribeUrl(existing.UnsubscribeToken)
                ));
                return;
            }

            var subscription = new Subscription
            {
                Id = Guid.NewGuid(),
                Email = normalisedEmail,
                Type = type,
                ProductId = productId,
                Locale = normalisedLocale,
                ConfirmToken = Guid.NewGuid(),
                UnsubscribeToken = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow
            };

            await _subscriptions.CreateAsync(subscription);

            Enqueue(EmailTemplates.Confirm(
                subscription.Email,
                subscription.Locale,
                ConfirmUrl(subscription.ConfirmToken),
                UnsubscribeUrl(subscription.UnsubscribeToken)
            ));
        }

        public async Task<bool> ConfirmAsync(Guid token)
        {
            var subscription = await _subscriptions.FindByConfirmTokenAsync(token);
            if (subscription is null) return false;

            // idempotent: a customer clicking the link twice, or a mail client
            // prefetching it, must not look like a failure
            if (subscription.ConfirmedAt is null)
            {
                subscription.ConfirmedAt = DateTime.UtcNow;
                await _subscriptions.SaveAsync();
            }

            return true;
        }

        public async Task<bool> UnsubscribeAsync(Guid token)
        {
            var subscription = await _subscriptions.FindByUnsubscribeTokenAsync(token);
            if (subscription is null) return false;

            await _subscriptions.DeleteAsync(subscription);
            return true;
        }

        public async Task OnStockChangedAsync(Guid productId, int previousSku, int newSku)
        {
            // the 0 -> positive edge, and only that. An admin correcting 5 to 7, or an
            // order taking 3 to 2, is not a restock.
            if (previousSku > 0 || newSku <= 0) return;

            var waiting = await _subscriptions.GetConfirmedForProductAsync(productId);
            if (waiting.Count == 0) return;

            var product = await _products.GetProductByIdAsync(productId);
            if (product is null) return;

            foreach (var subscription in waiting)
            {
                Enqueue(EmailTemplates.Restock(
                    subscription.Email,
                    subscription.Locale,
                    product.ProductName ?? "Your product",
                    ProductUrl(productId),
                    UnsubscribeUrl(subscription.UnsubscribeToken)
                ));
            }

            // A restock alert is one-shot by nature: the customer asked to be told the
            // next time it came back, not every time forever. Clearing the rows also
            // means a second restock cannot re-notify the same people.
            await _subscriptions.DeleteRangeAsync(waiting);
        }

        private void Enqueue(EmailMessage message)
        {
            if (!_queue.TryEnqueue(message))
            {
                _logger.LogError(
                    "Outbound email queue is full - dropped {Subject} to {To}",
                    message.Subject,
                    message.To
                );
            }
        }
    }
}
