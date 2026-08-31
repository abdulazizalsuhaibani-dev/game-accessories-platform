using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using src.Services.Subscriptions;
using static src.DTO.SubscriptionDTO;

namespace src.Controller
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class SubscriptionsController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;

        public SubscriptionsController(ISubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        private static readonly SubscriptionAcceptedDto AcceptedBody = new()
        {
            Message = "If that address can be subscribed, a confirmation email is on its way."
        };

        /// <summary>
        /// POST api/v1/Subscriptions - anonymous.
        ///
        /// Always 202 with the same body: a new address, an address already subscribed,
        /// and an address belonging to a registered customer are indistinguishable from
        /// the outside. Anything else makes this an oracle for who has an account here.
        /// </summary>
        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult<SubscriptionAcceptedDto>> Subscribe(SubscriptionCreateDto request)
        {
            // Type is nullable on the DTO so an omitted value is a 400 rather than
            // silently binding to Restock, which is the zero value
            if (request.Type is null)
                return BadRequest(new { message = "Type must be either Restock or Sales" });

            await _subscriptionService.SubscribeAsync(
                request.Email,
                request.Type.Value,
                request.ProductId,
                request.Locale
            );

            return Accepted202(AcceptedBody);
        }

        /// <summary>
        /// GET api/v1/Subscriptions/confirm?token=... - anonymous and idempotent.
        /// A second click, or a mail client prefetching the link, is still a 200.
        /// </summary>
        [AllowAnonymous]
        [HttpGet("confirm")]
        public async Task<IActionResult> Confirm([FromQuery] Guid token)
        {
            var found = await _subscriptionService.ConfirmAsync(token);
            if (!found)
                return NotFound(new { message = "That confirmation link is no longer valid." });

            return Ok(new { message = "Subscription confirmed." });
        }

        /// <summary>
        /// GET api/v1/Subscriptions/unsubscribe?token=... - anonymous and idempotent.
        ///
        /// An unknown token answers 200, not 404: an unsubscribe link that has already
        /// been used should read as "you are unsubscribed", and a 404 here would let
        /// someone probe which tokens exist.
        /// </summary>
        [AllowAnonymous]
        [HttpGet("unsubscribe")]
        public async Task<IActionResult> Unsubscribe([FromQuery] Guid token)
        {
            await _subscriptionService.UnsubscribeAsync(token);
            return Ok(new { message = "You have been unsubscribed." });
        }

        private ActionResult<SubscriptionAcceptedDto> Accepted202(SubscriptionAcceptedDto body) =>
            StatusCode(StatusCodes.Status202Accepted, body);
    }
}
