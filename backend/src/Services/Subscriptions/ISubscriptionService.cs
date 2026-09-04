using src.Entity;

namespace src.Services.Subscriptions
{
    public interface ISubscriptionService
    {
        Task SubscribeAsync(string email, SubscriptionType type, Guid? productId, string? locale);
        Task<bool> ConfirmAsync(Guid token);
        Task<bool> UnsubscribeAsync(Guid token);

        /// <summary>
        /// Called from every path that moves a product's stock. Fires only on the
        /// 0 -> positive edge.
        /// </summary>
        Task OnStockChangedAsync(Guid productId, int previousSku, int newSku);
    }
}
