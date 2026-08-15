using static src.DTO.OrderDTO;
using src.Utils;

namespace src.Services
{
    public interface IOrderService
    {
        Task<OrderReadDTO> CreateOneAsync(OrderCreateDTO createDTO);
        Task<List<OrderReadDTO>> GetAllAsync(PaginationOptions paginationOptions);
        Task<OrderReadDTO> GetByIdAsync(Guid id);
        Task<List<OrderReadDTO>> GetByUserIdAsync(Guid userId, PaginationOptions paginationOptions);
        Task<List<OrderReadDTO>> GetHistoryByUserIdAsync(Guid userId, PaginationOptions paginationOptions);
        Task<bool> DeleteOneAsync(Guid id);

        Task<bool> UpdateOneAsync(Guid id, OrderUpdateDTO updateDTO);
    }
}