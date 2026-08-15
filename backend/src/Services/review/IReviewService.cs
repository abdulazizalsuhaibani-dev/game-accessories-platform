using src.Entity;
using static src.DTO.ReviewDTO;
namespace src.Services.review
{
    public interface IReviewService
    {
        //create new review
        Task<ReadReviewDto> CreateReviewAsync(CreateReviewDto createDto);

        //get all Reviews
        Task<List<ReadReviewDto>> GetAllReviewsAsync();

        //get review by id
        Task<ReadReviewDto> GetReviewByIdAsync(Guid id);
        //
        Task<List<ReadReviewDto>> GetReviewsByProductIdAsync(Guid productId);

        //delete review
        Task<bool> DeleteReviewAsync(Guid id);
        //update review
        Task<ReadReviewDto> UpdateReviewAsync(Guid id, UpdateReviewDto updateDto);
    }
}