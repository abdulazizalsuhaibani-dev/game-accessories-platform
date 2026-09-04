using Microsoft.Extensions.Logging;

namespace src.Services.Email
{
    /// <summary>
    /// The no-provider fallback. Writes the whole message to the log instead of
    /// sending it, so local development needs no account and no key - the confirm and
    /// unsubscribe links can be copied straight out of the console.
    ///
    /// It logs at Warning rather than Information so that a deployment which is
    /// missing its Resend key is loud about it, instead of quietly dropping every
    /// notification a customer asked for.
    /// </summary>
    public class LoggingEmailSender : IEmailSender
    {
        private readonly ILogger<LoggingEmailSender> _logger;

        public LoggingEmailSender(ILogger<LoggingEmailSender> logger)
        {
            _logger = logger;
        }

        public Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
        {
            _logger.LogWarning(
                "No email provider configured - not sending. To: {To} | Subject: {Subject}\n{Body}",
                message.To,
                message.Subject,
                message.TextBody
            );
            return Task.CompletedTask;
        }
    }
}
