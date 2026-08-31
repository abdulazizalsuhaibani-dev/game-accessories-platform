using System.Text.Json.Serialization;

namespace src.Entity
{
    // Bound from and rendered as "Restock" / "Sales" rather than 0 / 1. The converter
    // is on the enum rather than registered globally: a global JsonStringEnumConverter
    // would change how UserRole serialises on every existing endpoint, which is not
    // this feature's call to make.
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum SubscriptionType
    {
        // "tell me when this is back in stock" - always carries a ProductId, and is
        // one-shot: the row is spent once the alert goes out
        Restock,

        // "tell me about sales" - store-wide, no product, and lives until unsubscribed
        Sales
    }

    public class Subscription
    {
        public Guid Id { get; set; }

        public string Email { get; set; } = string.Empty;

        public SubscriptionType Type { get; set; }

        // set for Restock, null for Sales. Nullable rather than two tables because the
        // confirm and unsubscribe flows are identical for both and would otherwise be
        // written twice
        public Guid? ProductId { get; set; }

        // which language to send in. Captured at subscribe time from the storefront,
        // because there is no account to read a preference from - a subscriber need
        // not be a registered customer
        public string Locale { get; set; } = "en";

        // Double opt-in: nothing is ever sent to an address that has not clicked
        // through, so the list cannot fill up with addresses that never asked.
        public DateTime? ConfirmedAt { get; set; }

        public Guid ConfirmToken { get; set; }

        // Separate from ConfirmToken so that a forwarded confirmation email cannot be
        // used to unsubscribe someone, and so the unsubscribe link stays valid for the
        // life of the subscription.
        public Guid UnsubscribeToken { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? LastNotifiedAt { get; set; }
    }
}
