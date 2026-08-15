namespace src.DTO
{
    public class ReviewDTO
    {
        public class CreateReviewDto
        {

            public Guid ProductId { get; set; }
            public Guid UserId { get; set; }
            public int Rating { get; set; }
            public string? Comment { get; set; }
        }

        public class UpdateReviewDto
        {
            public int Rating { get; set; }
            public string? Comment { get; set; }
        }

        public class ReadReviewDto
        {
            public Guid ReviewId { get; set; }
            public Guid ProductId { get; set; }
            public Guid UserId { get; set; }
            public int Rating { get; set; }
            public string? Comment { get; set; }
        }
    }
}