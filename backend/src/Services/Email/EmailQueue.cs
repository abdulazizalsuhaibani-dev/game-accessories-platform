using System.Threading.Channels;

namespace src.Services.Email
{
    /// <summary>
    /// A bounded in-process queue of messages waiting to go out.
    ///
    /// Nothing sends inline. An admin editing a product's stock, or a customer
    /// subscribing, should not wait on Resend's API and must not get a 500 because the
    /// provider is having a bad day - so the request enqueues and returns.
    ///
    /// Bounded, and full drops the newest rather than blocking the caller: an unbounded
    /// queue behind a wedged provider is a slow memory leak, and blocking would put the
    /// provider back on the request path, which is the thing being avoided. The drop is
    /// logged by the caller.
    ///
    /// In-process means a restart loses whatever had not been sent. That is the right
    /// trade at this size - the alternative is an outbox table and a claim protocol -
    /// but it is a real limit, and it is why the sale scan below is driven off a
    /// SaleAnnouncedAt stamp rather than off this queue having succeeded.
    /// </summary>
    public class EmailQueue
    {
        private readonly Channel<EmailMessage> _channel = Channel.CreateBounded<EmailMessage>(
            new BoundedChannelOptions(500)
            {
                FullMode = BoundedChannelFullMode.DropWrite,
                SingleReader = true
            }
        );

        public bool TryEnqueue(EmailMessage message) => _channel.Writer.TryWrite(message);

        public IAsyncEnumerable<EmailMessage> ReadAllAsync(CancellationToken cancellationToken) =>
            _channel.Reader.ReadAllAsync(cancellationToken);
    }
}
