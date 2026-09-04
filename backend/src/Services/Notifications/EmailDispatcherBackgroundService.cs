using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using src.Services.Email;

namespace src.Services.Notifications
{
    /// <summary>
    /// Drains the outbound queue.
    ///
    /// The sender is resolved per message from a scope rather than injected once. A
    /// BackgroundService is a singleton, and the Resend sender is a typed HttpClient,
    /// which is transient by design so its handler can be rotated - holding one for the
    /// lifetime of the process is the captured-dependency problem HttpClientFactory
    /// exists to avoid.
    ///
    /// A failure is logged and the message dropped rather than retried: a retry loop
    /// against a rejecting provider re-sends the same message forever, and a duplicate
    /// restock alert is worse than a missed one.
    /// </summary>
    public class EmailDispatcherBackgroundService : BackgroundService
    {
        private readonly EmailQueue _queue;
        private readonly IServiceProvider _services;
        private readonly ILogger<EmailDispatcherBackgroundService> _logger;

        public EmailDispatcherBackgroundService(
            EmailQueue queue,
            IServiceProvider services,
            ILogger<EmailDispatcherBackgroundService> logger
        )
        {
            _queue = queue;
            _services = services;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await foreach (var message in _queue.ReadAllAsync(stoppingToken))
            {
                try
                {
                    using var scope = _services.CreateScope();
                    var sender = scope.ServiceProvider.GetRequiredService<IEmailSender>();
                    await sender.SendAsync(message, stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    // shutting down; the queue is in-process and goes with it
                    break;
                }
                catch (Exception exception)
                {
                    _logger.LogError(
                        exception,
                        "Could not send {Subject} to {To}",
                        message.Subject,
                        message.To
                    );
                }
            }
        }
    }
}
