using System.ComponentModel.DataAnnotations;
using src.Entity;

namespace src.DTO
{
    public class SubscriptionDTO
    {
        public class SubscriptionCreateDto
        {
            [Required]
            [EmailAddress]
            [MaxLength(320)]
            public string Email { get; set; } = string.Empty;

            [Required]
            public SubscriptionType? Type { get; set; }

            // required for Restock, ignored for Sales - checked in the service, because
            // the rule depends on Type and an attribute cannot see a sibling field
            public Guid? ProductId { get; set; }

            // "en" or "ar"; anything else falls back to English rather than being
            // rejected, since a bad locale is not worth failing a signup over
            [MaxLength(5)]
            public string? Locale { get; set; }
        }

        /// <summary>
        /// Deliberately says nothing about what happened.
        ///
        /// A new subscription, an address that was already subscribed, and an address
        /// belonging to a registered customer all produce this same 202 with the same
        /// message. Branching the response - even to be helpful - would turn the
        /// endpoint into an oracle for whether a given email has an account here.
        /// </summary>
        public class SubscriptionAcceptedDto
        {
            public string Message { get; set; } = string.Empty;
        }
    }
}
