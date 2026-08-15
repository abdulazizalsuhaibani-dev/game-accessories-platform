using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using src.Services.review;
using src.Utils;
using static src.DTO.ReviewDTO;
namespace src.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class ReviewsController : ControllerBase
    {
        protected IReviewService _reviewService;
        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }
        // get all reviews: GET api/v1/review
        [HttpGet]
        public async Task<ActionResult<List<ReadReviewDto>>> GetAllReviews()
        {
            var reviews = await _reviewService.GetAllReviewsAsync();
            return Ok(reviews);
        }
        // get review by id: GET api/v1/review/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ReadReviewDto>> GetReviewById(Guid id)
        {
            var review = await _reviewService.GetReviewByIdAsync(id);
            return Ok(review);
        }
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<ReadReviewDto>> GetReviewsByProductId(Guid productId)
        {
            var reviews = await _reviewService.GetReviewsByProductIdAsync(productId);
            return Ok(reviews);
        }
        // create new review: POST api/v1/review
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<ReadReviewDto>> CreateReview(CreateReviewDto createDto)
        {
            // stops a customer from posting a review under somebody else's name
            AuthorizationUtils.EnsureOwnerOrAdmin(User, createDto.UserId);

            var review = await _reviewService.CreateReviewAsync(createDto);
            return CreatedAtAction(nameof(GetReviewById), new { id = review.ReviewId }, review);
        }

        // update review: PUT api/v1/review/{id}
        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<ReadReviewDto>> UpdateReview(Guid id, UpdateReviewDto updateDto)
        {
            var foundReview = await _reviewService.GetReviewByIdAsync(id);
            AuthorizationUtils.EnsureOwnerOrAdmin(User, foundReview.UserId);

            var review = await _reviewService.UpdateReviewAsync(id, updateDto);
            return Ok(review);
        }
        // delete review: DELETE api/v1/review/{id}
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> DeleteReview(Guid id)
        {
            var foundReview = await _reviewService.GetReviewByIdAsync(id);
            AuthorizationUtils.EnsureOwnerOrAdmin(User, foundReview.UserId);

            var isDeleted = await _reviewService.DeleteReviewAsync(id);
            return Ok(isDeleted);
        }
    }
}