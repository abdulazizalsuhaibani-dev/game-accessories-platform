using System.Net;
using src.Services.Email;

namespace src.Utils
{
    /// <summary>
    /// The three messages this platform sends, in English and Arabic.
    ///
    /// Templates live here rather than in the service so that adding a language is one
    /// file, and so the unsubscribe footer is appended in a single place - every
    /// message that leaves the system carries one, which is both legally expected and
    /// far cheaper to build in now than to retrofit across three templates later.
    ///
    /// Values are HTML-escaped on the way in: a product name is catalogue data typed
    /// by an admin, and it lands inside markup.
    /// </summary>
    public static class EmailTemplates
    {
        private static bool IsArabic(string? locale) =>
            string.Equals(locale, "ar", StringComparison.OrdinalIgnoreCase);

        private static string E(string? value) => WebUtility.HtmlEncode(value ?? string.Empty);

        public static EmailMessage Confirm(string email, string? locale, string confirmUrl, string unsubscribeUrl)
        {
            if (IsArabic(locale))
            {
                return Build(
                    email,
                    "أكّد اشتراكك",
                    "أكّد اشتراكك",
                    "اضغط الزر أدناه لتأكيد اشتراكك. إن لم تطلب هذا، تجاهل هذه الرسالة ولن نرسل لك شيئًا.",
                    "تأكيد الاشتراك",
                    confirmUrl,
                    unsubscribeUrl,
                    "ar"
                );
            }

            return Build(
                email,
                "Confirm your subscription",
                "Confirm your subscription",
                "Press the button below to confirm. If you did not ask for this, ignore this message and we will not send you anything.",
                "Confirm subscription",
                confirmUrl,
                unsubscribeUrl,
                "en"
            );
        }

        public static EmailMessage Restock(string email, string? locale, string productName, string productUrl, string unsubscribeUrl)
        {
            if (IsArabic(locale))
            {
                return Build(
                    email,
                    $"عاد {productName} إلى المخزون",
                    $"عاد {productName} إلى المخزون",
                    "المنتج الذي طلبت تنبيهك عنه متوفر الآن. الكمية محدودة.",
                    "اعرض المنتج",
                    productUrl,
                    unsubscribeUrl,
                    "ar"
                );
            }

            return Build(
                email,
                $"{productName} is back in stock",
                $"{productName} is back in stock",
                "The product you asked to be told about is available again. Stock is limited.",
                "View the product",
                productUrl,
                unsubscribeUrl,
                "en"
            );
        }

        public static EmailMessage Sale(string email, string? locale, string productName, int percentOff, string productUrl, string unsubscribeUrl)
        {
            if (IsArabic(locale))
            {
                return Build(
                    email,
                    $"تخفيض {percentOff}% على {productName}",
                    $"تخفيض {percentOff}%",
                    $"{productName} معروض الآن بخصم {percentOff}%.",
                    "تسوّق العرض",
                    productUrl,
                    unsubscribeUrl,
                    "ar"
                );
            }

            return Build(
                email,
                $"{percentOff}% off {productName}",
                $"{percentOff}% off",
                $"{productName} is now {percentOff}% off.",
                "Shop the sale",
                productUrl,
                unsubscribeUrl,
                "en"
            );
        }

        private static EmailMessage Build(
            string to,
            string subject,
            string heading,
            string body,
            string buttonLabel,
            string buttonUrl,
            string unsubscribeUrl,
            string locale
        )
        {
            var dir = locale == "ar" ? "rtl" : "ltr";
            var unsubscribeLabel = locale == "ar" ? "إلغاء الاشتراك" : "Unsubscribe";

            var html = $@"<!doctype html>
<html lang=""{locale}"" dir=""{dir}"">
  <body style=""margin:0;padding:24px;background:#0f0f0f;color:#e8e8e8;font-family:Arial,Helvetica,sans-serif"">
    <div style=""max-width:520px;margin:0 auto;background:#171717;padding:28px"">
      <h1 style=""margin:0 0 16px;font-size:22px;color:#ffffff"">{E(heading)}</h1>
      <p style=""margin:0 0 24px;font-size:15px;line-height:1.6"">{E(body)}</p>
      <a href=""{E(buttonUrl)}"" style=""display:inline-block;padding:12px 20px;background:#c3f53c;color:#0f0f0f;font-weight:bold;text-decoration:none"">{E(buttonLabel)}</a>
      <p style=""margin:28px 0 0;font-size:12px;color:#8a8a8a"">
        <a href=""{E(unsubscribeUrl)}"" style=""color:#8a8a8a"">{E(unsubscribeLabel)}</a>
      </p>
    </div>
  </body>
</html>";

            var text = $"{heading}\n\n{body}\n\n{buttonLabel}: {buttonUrl}\n\n{unsubscribeLabel}: {unsubscribeUrl}\n";

            return new EmailMessage(to, subject, html, text);
        }
    }
}
