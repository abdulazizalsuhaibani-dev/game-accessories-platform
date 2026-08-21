using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using src.Repository;
using src.Controllers;
using static src.DTO.UserDTO;
using src.Entity;
using src.Utils;
using static src.Entity.User;
using src.DTO;
using Microsoft.AspNetCore.Identity;


namespace src.Services.user
{
    public class UserService : IUserService
    {
        // The special characters a password may satisfy its third rule with.
        // RegistrationForm.js validates against this exact set.
        private static readonly char[] PasswordSpecialCharacters = "!@#$%^&*()_[]".ToCharArray();

        protected readonly UserRepository _userRepo;
        protected readonly IMapper _mapper;
        protected readonly IConfiguration _config;
        public UserService(UserRepository userRepo, IMapper mapper, IConfiguration config)
        {
            _userRepo = userRepo;
            _mapper = mapper;
            _config = config;
        }
        public async Task<UserReadDto> CreateOneAsync(UserCreateDto createDto)
        {
            var user = _mapper.Map<UserCreateDto, User>(createDto);
            var userTable = await _userRepo.GetAllAsync();
            if (userTable.Any(x => x.Email == user.Email))
            {
                throw CustomException.BadRequest("Email already registered please try another one");
            }
            if (userTable.Any(x => x.PhoneNumber == user.PhoneNumber))
            {
                throw CustomException.BadRequest("Phone number already registered please try another one");
            }
            if (userTable.Any(x => x.Username == user.Username))
            {
                throw CustomException.BadRequest("Username already registered please try another one");
            }
            if (user.Email == null)
            {
                throw CustomException.BadRequest("You cant leave Email empty");
            }
            // everybody who signs up is a customer. the role is never taken from
            // the email or from the request body, otherwise anyone could hand
            // themselves an admin account. an existing admin promotes people
            // through PUT api/v1/Users/{userId}/role
            user.Role = UserRole.Customer;
            if (user.PhoneNumber == null)
            {
                throw CustomException.BadRequest("You cant leave phone number empty");
            }
            if (user.Username == null)
            {
                throw CustomException.BadRequest("You cant leave Username empty");
            }
            if (user.FirstName == null)
            {
                throw CustomException.BadRequest("You cant leave First name empty");
            }
            if (user.LastName == null)
            {
                throw CustomException.BadRequest("You cant leave Last name empty");
            }
            if (user.BirthDate.Equals(DateOnly.Parse("0001-01-01")))
            {
                throw CustomException.BadRequest("You cant leave birthdate empty");
            }
            if (user.Password == null)
            {
                throw CustomException.BadRequest("You cant leave Password empty");
            }
            else
            {
                // These three rules are the same ones RegistrationForm.js
                // validates before it posts. Keep the two ends in step: a rule
                // only one of them enforces makes registration impossible
                // rather than merely strict.
                if (user.Password.Length < 8)
                {
                    throw CustomException.BadRequest("password should be at least 8 characters");
                }
                else if (!user.Password.Any(char.IsLetter))
                {
                    throw CustomException.BadRequest("password should contain at least one letter");
                }
                else if (!user.Password.Any(char.IsDigit))
                {
                    throw CustomException.BadRequest("password should contain at least one number");
                }
                else if (user.Password.IndexOfAny(PasswordSpecialCharacters) < 0)
                {
                    throw CustomException.BadRequest($"password should contain at least one special character ({string.Join(" ", PasswordSpecialCharacters)})");
                }
            }
            PasswordUtils.HashPassword(createDto.Password, out string hashedPassword, out byte[] salt);
            user.CartId = Guid.NewGuid();
            user.Password = hashedPassword;
            user.Salt = salt;
            var savedUser = await _userRepo.CreateOneAsync(user);
            return _mapper.Map<User, UserReadDto>(savedUser);
        }

        //sign in
        public async Task<string> SignInAsync(UserCreateDto createDto)
        {
            // logic
            // find user by Email
            var foundUser = await _userRepo.FindByEmailAsync(createDto.Email);
            // no user with that email, answer exactly like a wrong password
            // so nobody can use sign in to find out which emails are registered
            if (foundUser == null)
                throw CustomException.UnAuthorized("Invalid email or password");

            // an empty password, or a stored row with no credential, used to
            // reach VerifyPassword and throw on the null. that turned a missing
            // password field into a 500 for real emails and a 401 for the rest,
            // which is the same enumeration oracle the check above closes
            if (string.IsNullOrEmpty(createDto.Password)
                || string.IsNullOrEmpty(foundUser.Password)
                || foundUser.Salt == null)
                throw CustomException.UnAuthorized("Invalid email or password");

            // check password
            var isMatched = PasswordUtils.VerifyPassword(createDto.Password, foundUser.Password, foundUser.Salt);
            if (isMatched)
            {
                // create token
                var tokenUtil = new TokenUtils(_config);
                return tokenUtil.GenerateToken(foundUser);
            }
            // string
            throw CustomException.UnAuthorized("Invalid email or password");
        }
        // get by id
        public async Task<UserReadDto> GetByIdAsync(Guid id)
        {
            var foundUser = await _userRepo.GetByIdAsync(id);
            return _mapper.Map<User, UserReadDto>(foundUser);
        }
        // get by id
        public async Task<UserReadUsernameDto> GetUsernameByIdAsync(Guid id)
        {
            var foundUser = await _userRepo.GetByIdAsync(id);
            return _mapper.Map<User, UserReadUsernameDto>(foundUser);
        }
        // delete 
        public async Task<bool> DeleteOneAsync(Guid id)
        {
            var foundUser = await _userRepo.GetByIdAsync(id);
            bool isDeleted = await _userRepo.DeleteOneAsync(foundUser);
            if (isDeleted)
            {
                return true;
            }
            return false;
        }
        // update
        public async Task<bool> UpdateOneAsync(Guid id, UserUpdateDto updateDto)
        {
            var foundUser = await _userRepo.GetByIdAsync(id);
            // has to come before foundUser is read below, otherwise a missing
            // user crashes here instead of returning a clean error
            if (foundUser == null)
            {
                throw CustomException.BadRequest($"user with {id}  doesnt exist");
            }

            var userTable = await _userRepo.GetAllAsync();
            var duplicatEmail = userTable.Any(x => x.Email == updateDto.Email && x.UserId != foundUser.UserId);
            var duplicatUsername = userTable.Any(x => x.Username == updateDto.Username && x.UserId != foundUser.UserId);
            var duplicatPhone = userTable.Any(x => x.PhoneNumber == updateDto.PhoneNumber && x.UserId != foundUser.UserId);
            if (duplicatEmail)
            {
                throw CustomException.BadRequest($"email already exist try another one");
            }
            if (duplicatUsername)
            {
                throw CustomException.BadRequest($"Username already exist try another one");
            }
            if (duplicatPhone)
            {
                throw CustomException.BadRequest($"phone number already exist try another one");
            }
            else
            {
                if (updateDto.Email == null)
                {
                    updateDto.Email = foundUser.Email;
                }
                if (updateDto.Username == null)
                {
                    updateDto.Username = foundUser.Username;
                }
                if (updateDto.FirstName == null)
                {
                    updateDto.FirstName = foundUser.FirstName;
                }
                if (updateDto.LastName == null)
                {
                    updateDto.LastName = foundUser.LastName;
                }
                if (updateDto.PhoneNumber == null)
                {
                    updateDto.PhoneNumber = foundUser.PhoneNumber;
                }
                // remember whether the caller actually sent a new password. the
                // null branch below copies the stored hash into the dto, and
                // hashing that a second time would leave a credential nobody
                // can sign in with and no way to reset it
                bool passwordChanged = updateDto.Password != null;
                if (updateDto.Password == null)
                {
                    updateDto.Password = foundUser.Password;
                }
                else
                {
                    if (updateDto.Password.Length < 8)
                    {
                        throw CustomException.BadRequest("password should be at least 8 characters");
                    }
                    else if ((!updateDto.Password.Contains("1")) && (!updateDto.Password.Contains("2")) && (!updateDto.Password.Contains("3")) && (!updateDto.Password.Contains("4")) && (!updateDto.Password.Contains("5")) && (!updateDto.Password.Contains("6")) && (!updateDto.Password.Contains("7")) && (!updateDto.Password.Contains("8")) && (!updateDto.Password.Contains("9")) && (!updateDto.Password.Contains("0")))
                    {
                        throw CustomException.BadRequest("password should contains at least one number");
                    }
                    else if ((!updateDto.Password.Contains("!")) && (!updateDto.Password.Contains("@")) && (!updateDto.Password.Contains("#")) && (!updateDto.Password.Contains("$")) && (!updateDto.Password.Contains("%")) && (!updateDto.Password.Contains("^")) && (!updateDto.Password.Contains("&")) && (!updateDto.Password.Contains("*")) && (!updateDto.Password.Contains("(")) && (!updateDto.Password.Contains(")")) && (!updateDto.Password.Contains("_")) && (!updateDto.Password.Contains("[")) && (!updateDto.Password.Contains("]")))
                    {
                        throw CustomException.BadRequest("password should contains at least one special charachter (! - @ - # - $ - % - & - * - ( - ) - _ - [ - ])");
                    }
                }
                if (updateDto.CartId == null)
                {
                    updateDto.CartId = foundUser.CartId;
                }
                // keep whatever role the user already has. deriving it from the
                // email let a customer promote themselves just by editing their
                // email to something containing "@admin.com"
                updateDto.Role = foundUser.Role ?? UserRole.Customer;
                if (updateDto.BirthDate.Equals(DateOnly.Parse("0001-01-01")))
                {
                    updateDto.BirthDate = foundUser.BirthDate;
                }
                _mapper.Map(updateDto, foundUser);
                if (passwordChanged)
                {
                    PasswordUtils.HashPassword(updateDto.Password!, out string hashedPassword, out byte[] salt);
                    foundUser.Password = hashedPassword;
                    foundUser.Salt = salt;
                }
                return await _userRepo.UpdateOneAsync(foundUser);
            }

        }
        // change a role. the controller keeps this admin only
        public async Task<bool> UpdateRoleAsync(Guid id, UserRole role)
        {
            var foundUser = await _userRepo.GetByIdAsync(id);
            if (foundUser == null)
            {
                throw CustomException.NotFound($"user with {id} doesnt exist");
            }

            // signing up can only ever create a customer, so demoting the last
            // admin leaves nobody able to reach an admin endpoint and the only
            // way back is editing the row in postgres by hand
            if (foundUser.Role == UserRole.Admin && role != UserRole.Admin)
            {
                var admins = await _userRepo.GetAllAsync();
                if (admins.Count(x => x.Role == UserRole.Admin) <= 1)
                    throw CustomException.BadRequest("Cannot demote the last remaining admin");
            }

            foundUser.Role = role;
            return await _userRepo.UpdateOneAsync(foundUser);
        }
        public async Task<List<UserReadDto>> GetAllAsync()
        {
            var UserList = await _userRepo.GetAllAsync();
            return _mapper.Map<List<User>, List<UserReadDto>>(UserList);
        }
    }
}