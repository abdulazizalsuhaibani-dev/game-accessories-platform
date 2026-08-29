using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using src.Utils;

namespace src.Services.Media
{
    public class ImageUploadService : IImageUploadService
    {
        // Same allowlist a browser <input type="file" accept="..."> already narrows to,
        // enforced again here because the accept attribute is only a hint to the picker.
        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
        };

        private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB
        private const string ProductImageFolder = "products";

        private readonly string? _cloudName;
        private readonly string? _apiKey;
        private readonly string? _apiSecret;
        private Cloudinary? _client;

        // Deliberately does not validate or connect here. This service is a constructor
        // dependency of ProductsController and ProductService, both of which serve plain
        // reads that have nothing to do with uploads - an eager throw here took down
        // GET /Products (and everything else on those controllers) whenever Cloudinary
        // was not yet configured, not just the one endpoint that actually needs it.
        public ImageUploadService(IConfiguration config)
        {
            _cloudName = config["Cloudinary:CloudName"];
            _apiKey = config["Cloudinary:ApiKey"];
            _apiSecret = config["Cloudinary:ApiSecret"];
        }

        private bool IsConfigured =>
            !string.IsNullOrWhiteSpace(_cloudName)
            && !string.IsNullOrWhiteSpace(_apiKey)
            && !string.IsNullOrWhiteSpace(_apiSecret);

        private Cloudinary Client => _client ??= new Cloudinary(new Account(_cloudName, _apiKey, _apiSecret));

        public async Task<string> UploadProductImageAsync(IFormFile file)
        {
            if (!IsConfigured)
                throw CustomException.BadRequest(
                    "Image upload is not configured on this server. Set Cloudinary:CloudName, " +
                    "Cloudinary:ApiKey and Cloudinary:ApiSecret (or the Cloudinary__* environment variables)."
                );

            if (file == null || file.Length == 0)
                throw CustomException.BadRequest("No image file was provided");

            if (file.Length > MaxFileSizeBytes)
                throw CustomException.BadRequest($"Image must be {MaxFileSizeBytes / (1024 * 1024)} MB or smaller");

            if (!AllowedContentTypes.Contains(file.ContentType))
                throw CustomException.BadRequest("Image must be a JPEG, PNG, WEBP or GIF file");

            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = ProductImageFolder,
            };

            var result = await Client.UploadAsync(uploadParams);

            if (result.Error != null)
                throw CustomException.BadRequest($"Image upload failed: {result.Error.Message}");

            return result.SecureUrl.ToString();
        }

        public async Task DeleteIfManagedAsync(string? imageUrl)
        {
            if (!IsConfigured)
                return;

            var publicId = ExtractManagedPublicId(imageUrl);
            if (publicId == null)
                return;

            // Best-effort: a product update or delete has already succeeded by the time
            // this runs, and a Cloudinary hiccup here should not turn that into a failure
            // the caller reports back to the admin. An orphaned asset costs storage, not
            // correctness.
            try
            {
                await Client.DestroyAsync(new DeletionParams(publicId));
            }
            catch
            {
                // swallowed deliberately - see above
            }
        }

        // Reverses the shape UploadProductImageAsync's SecureUrl comes back in:
        // https://res.cloudinary.com/<cloudName>/image/upload/v<version>/products/<id>.<ext>
        // Anything else - a pasted external url, a different Cloudinary account, a url
        // outside the products folder - returns null and is left untouched.
        private string? ExtractManagedPublicId(string? imageUrl)
        {
            if (string.IsNullOrWhiteSpace(imageUrl))
                return null;

            if (!Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri)
                || !uri.Host.Equals("res.cloudinary.com", StringComparison.OrdinalIgnoreCase))
                return null;

            var segments = uri.AbsolutePath.Trim('/').Split('/');
            if (segments.Length == 0 || !segments[0].Equals(_cloudName, StringComparison.Ordinal))
                return null;

            var uploadIndex = Array.IndexOf(segments, "upload");
            if (uploadIndex < 0 || uploadIndex == segments.Length - 1)
                return null;

            var afterUpload = segments.Skip(uploadIndex + 1).ToList();

            // drop a leading version segment such as "v1730000000"
            if (afterUpload.Count > 0
                && afterUpload[0].Length > 1
                && afterUpload[0][0] == 'v'
                && afterUpload[0].Skip(1).All(char.IsDigit))
            {
                afterUpload.RemoveAt(0);
            }

            if (afterUpload.Count == 0)
                return null;

            var last = afterUpload[^1];
            var dotIndex = last.LastIndexOf('.');
            if (dotIndex > 0)
                afterUpload[^1] = last[..dotIndex];

            var publicId = string.Join("/", afterUpload);
            return publicId.StartsWith(ProductImageFolder + "/", StringComparison.Ordinal) ? publicId : null;
        }
    }
}
