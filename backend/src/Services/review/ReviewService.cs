using AutoMapper;
using src.DTO;
using src.Entity;
using src.Repository;
using src.Utils;
using static src.DTO.ReviewDTO;

namespace src.Services.review
{
    public class ReviewService : IReviewService
    {
        protected readonly ReviewRepository _reviewRepo;
        protected readonly IMapper _mapper;
        public ReviewService(ReviewRepository reviewRepo, IMapper mapper)
        {
            _reviewRepo = reviewRepo;
            _mapper = mapper;
        }
        public async Task<ReadReviewDto> CreateReviewAsync(CreateReviewDto createDto)
        {
            //TODO: Create only if user order the product
            var review = _mapper.Map<Review>(createDto);

            if (review.Rating < 0 || review.Rating > 5)
                throw CustomException.BadRequest("Rating must be between 0 and 5");

            /*
            var reviews = await _reviewRepo.GetAllReviewsAsync();
            if (reviews.Any(r => r.ProductId == review.ProductId) && reviews.Any(r => r.UserId == review.UserId))
                throw CustomException.BadRequest("You have already reviewed this product");*/


            var reviewCreated = await _reviewRepo.CreateReviewAsync(review);
            await _reviewRepo.UpdateProductReviewAsync(review.ProductId);
            return _mapper.Map<Review, ReadReviewDto>(reviewCreated);
        }

        public async Task<bool> DeleteReviewAsync(Guid id)
        {
            var foundReview = await _reviewRepo.GetReviewByIdAsync(id);

            if (foundReview == null)
                throw CustomException.NotFound($"Review with ID {id} not found");

            bool isDeleted = await _reviewRepo.DeleteReviewAsync(foundReview);
            return isDeleted;

        }

        public async Task<List<ReadReviewDto>> GetAllReviewsAsync()
        {
            var reviews = await _reviewRepo.GetAllReviewsAsync();
            return _mapper.Map<List<Review>, List<ReadReviewDto>>(reviews);
        }

        public async Task<ReadReviewDto> GetReviewByIdAsync(Guid id)
        {
            var foundReview = await _reviewRepo.GetReviewByIdAsync(id);

            if (foundReview == null)
                throw CustomException.NotFound($"Review with ID {id} not found");

            return _mapper.Map<Review, ReadReviewDto>(foundReview);
        }
        public async Task<List<ReadReviewDto>> GetReviewsByProductIdAsync(Guid productId)
        {
            var foundProduct = await _reviewRepo.GetProductByIdForReviewsAsync(productId);
            if (foundProduct == null)
                throw CustomException.NotFound($"Product with ID {productId} not found");

            var foundReviews = await _reviewRepo.GetReviewsByProductIdAsync(productId);
            return _mapper.Map<List<Review>, List<ReadReviewDto>>(foundReviews);
        }

        public async Task<ReadReviewDto> UpdateReviewAsync(Guid id, UpdateReviewDto updateDto)// must enter both comment and rating
        {
            var foundReview = await _reviewRepo.GetReviewByIdAsync(id);

            if (foundReview == null)
                throw CustomException.NotFound("Review not found");

            //if rating is not updated
            // you can enter zero for rating or don't write rating in json request body
            if (updateDto.Rating == 0)
                updateDto.Rating = foundReview.Rating;

            /*if you do not want to update comment in json request body,use this code
            {
                "rating": 5,
                "comment": ""
            }
            otherwise if you don't use "comment": "" this will cause error
            if you want to update comment in json request body type whatever you want in "comment": "here" 
            */
            // if (updateDto.Comment == "")
            //     updateDto.Comment = foundReview.Comment;

            _mapper.Map(updateDto, foundReview);

            if (updateDto.Rating < 1 || updateDto.Rating > 5)
                throw CustomException.BadRequest($"Rating must be between 0 and 5 {foundReview.Rating}");

            var reviewUpdated = await _reviewRepo.UpdateReviewAsync(foundReview);
            await _reviewRepo.UpdateProductReviewAsync(foundReview.ProductId);
            return _mapper.Map<Review, ReadReviewDto>(reviewUpdated);
        }
    }
}