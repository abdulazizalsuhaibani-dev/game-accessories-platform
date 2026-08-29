using Microsoft.AspNetCore.Http;

namespace src.Services.Media
{
    public interface IImageUploadService
    {
        // Validates type and size, uploads to Cloudinary, and returns the resulting
        // secure url - the same shape ProductImage already stores today.
        Task<string> UploadProductImageAsync(IFormFile file);

        // Best-effort delete of a previously uploaded image. A url this service did
        // not upload (a pasted external link, or null) is left alone rather than
        // treated as an error - it was never ours to delete.
        Task DeleteIfManagedAsync(string? imageUrl);
    }
}
