using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static src.DTO.UserDTO;
using static src.Entity.User;

namespace src.Services.user
{
    public interface IUserService
    {
        Task<UserReadDto> CreateOneAsync(UserCreateDto createDto);
        // get all
        Task<List<UserReadDto>> GetAllAsync();
        // get by id
        Task<UserReadDto> GetByIdAsync(Guid id);
        // delete
        Task<bool> DeleteOneAsync(Guid id);
        // update
        Task<bool> UpdateOneAsync(Guid id, UserUpdateDto updateDto);
        // change a role, admins only
        Task<bool> UpdateRoleAsync(Guid id, UserRole role);
        Task<string> SignInAsync(UserCreateDto createDto);

    }
}