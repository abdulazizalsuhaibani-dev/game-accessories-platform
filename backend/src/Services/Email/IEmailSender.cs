namespace src.Services.Email
{
    public record EmailMessage(string To, string Subject, string HtmlBody, string TextBody);

    /// <summary>
    /// Outbound email. Two implementations are registered depending on configuration,
    /// the same way image upload degrades without a Cloudinary section: with a
    /// Resend:ApiKey the real sender is used, without one a logging sender takes its
    /// place so a fresh clone runs, and the subscribe flow can be exercised end to end
    /// locally by reading the token out of the log.
    /// </summary>
    public interface IEmailSender
    {
        Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default);
    }
}
