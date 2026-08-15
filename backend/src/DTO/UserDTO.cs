using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using src.Entity;
using static src.Entity.User;

namespace src.DTO
{
    public class UserDTO
    {
        public class UserCreateDto
        {
            public string? Username { get; set; }
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string? Email { get; set; }
            public string? PhoneNumber { get; set; }
            public DateOnly? BirthDate { get; set; }
            public string? Password { get; set; }
            public UserRole? Role { get; internal set; }
            public Guid? CartId { get; set; }

            public static implicit operator UserCreateDto(string v)
            {
                throw new NotImplementedException();
            }
        }
        public class UserReadDto
        {
            public Guid UserId { get; set; }
            public string? Username { get; set; }
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string? Email { get; set; }
            public string? PhoneNumber { get; set; }
            public DateOnly BirthDate { get; set; }
            public UserRole Role { get; set; }
            public Guid CartId { get; set; }
        }
        public class UserReadUsernameDto
        {
            public string? Username { get; set; }
        }
        public class UserUpdateDto
        {
            public string? Username { get; set; }
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string? Email { get; set; }
            public string? PhoneNumber { get; set; }
            public DateOnly BirthDate { get; set; }
            // internal so it can never be bound from the request body
            public UserRole Role { get; internal set; }
            public string? Password { get; set; }
            public Guid? CartId { get; set; }
        }

        // only used by the admin only role endpoint
        public class UserRoleUpdateDto
        {
            // nullable on purpose. UserRole.Admin is the zero value, so a plain
            // UserRole would silently read as Admin whenever the caller leaves
            // the field out or misspells it, and quietly promote the target
            [Required(ErrorMessage = "Role is required and must be either Admin or Customer")]
            public UserRole? Role { get; set; }
        }

    }
}