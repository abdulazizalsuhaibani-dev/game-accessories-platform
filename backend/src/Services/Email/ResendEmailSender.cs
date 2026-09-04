using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace src.Services.Email
{
    public class ResendOptions
    {
        public string? ApiKey { get; set; }

        // must be an address on a domain verified with Resend, or the provider rejects
        // the send - this is the usual first thing to go wrong in a new environment
        public string? From { get; set; }
    }

    /// <summary>
    /// Resend's REST API over a plain HttpClient. One endpoint and a bearer token is
    /// the whole integration, so there is no SDK dependency to carry.
    /// </summary>
    public class ResendEmailSender : IEmailSender
    {
        private const string SendEndpoint = "https://api.resend.com/emails";

        private readonly HttpClient _httpClient;
        private readonly ResendOptions _options;
        private readonly ILogger<ResendEmailSender> _logger;

        public ResendEmailSender(HttpClient httpClient, ResendOptions options, ILogger<ResendEmailSender> logger)
        {
            _httpClient = httpClient;
            _options = options;
            _logger = logger;
        }

        public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
        {
            var payload = JsonSerializer.Serialize(new
            {
                from = _options.From,
                to = new[] { message.To },
                subject = message.Subject,
                html = message.HtmlBody,
                text = message.TextBody
            });

            using var request = new HttpRequestMessage(HttpMethod.Post, SendEndpoint)
            {
                Content = new StringContent(payload, Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);

            var response = await _httpClient.SendAsync(request, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                // Thrown rather than swallowed so the dispatcher can log it against the
                // specific job. Nothing upstream is waiting on this - sending happens on
                // the background queue - so a provider outage cannot fail a customer's
                // request or an admin's product edit.
                throw new InvalidOperationException(
                    $"Resend rejected the message with {(int)response.StatusCode}: {body}"
                );
            }

            _logger.LogInformation("Sent {Subject} to {To}", message.Subject, message.To);
        }
    }
}
