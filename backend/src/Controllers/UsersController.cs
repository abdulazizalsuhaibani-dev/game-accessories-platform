using Microsoft.AspNetCore.Mvc;
using src.Utils;
using src.Services.user;
using static src.DTO.UserDTO;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using static src.Entity.User;

namespace src.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class UsersController : ControllerBase
    {
        protected readonly IUserService _userService;

        public UsersController(IUserService service)
        {
            _userService = service;
        }
        // create user
        [HttpPost]
        public async Task<ActionResult<UserReadDto>> CreateOne(UserCreateDto createDto)
        {
            var userCreated = await _userService.CreateOneAsync(createDto);
            return Ok(userCreated);
        }

        // log in
        [HttpPost("signIn")]
        public async Task<ActionResult<string>> SignInUser([FromBody] UserCreateDto createDto)
        {
            var token = await _userService.SignInAsync(createDto);
            return Ok(token);
        }
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<UserReadDto>>> GetAllUsers()
        {
            var userList = await _userService.GetAllAsync();

            return Ok(userList);

        }
        [HttpGet("{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserReadDto>> GetUserById([FromRoute] Guid userId)
        {
            var foundUser = await _userService.GetByIdAsync(userId);
            if (foundUser == null)
            {
                throw CustomException.BadRequest("User not found");
            }
            return Ok(foundUser);
        }

        [HttpGet("username/{userId}")]
        public async Task<ActionResult<UserReadUsernameDto>> GetUserUsernameById([FromRoute] Guid userId)
        {
            var foundUsername = await _userService.GetUsernameByIdAsync(userId);
            if (foundUsername == null)
            {
                throw CustomException.BadRequest("Username not found");
            }
            return Ok(foundUsername);
        }
        [HttpGet("auth")]
        [Authorize]
        public async Task<ActionResult<UserReadDto>> CheckAuthAsync()
        {
            var authenticatedClaims = HttpContext.User;
            var userId = authenticatedClaims.FindFirst(c => c.Type == ClaimTypes.NameIdentifier)!.Value;
            var userGuid = new Guid(userId);
            var user = await _userService.GetByIdAsync(userGuid);
            // A token outlives the row it points at - deleting your own account
            // leaves a still-valid token in the browser. "Who am I" has to
            // answer 401 in that case; a 200 with an empty body reads to the
            // client as a signed-in user with no fields.
            if (user == null)
                throw CustomException.UnAuthorized("This session is no longer valid. Please log in again");
            return Ok(user);
        }
        [Authorize]
        [HttpDelete("{userId}")]
        public async Task<ActionResult> DeleteUser(Guid userId)
        {
            // a customer may only delete their own account, an admin may delete any
            AuthorizationUtils.EnsureOwnerOrAdmin(User, userId);

            var foundUser = await _userService.GetByIdAsync(userId);
            if (foundUser == null)
                throw CustomException.UnAuthorized($"user with {userId} does not exist");

            var isDeleted = await _userService.DeleteOneAsync(userId);
            return isDeleted ? Ok("user successfully deleted") : StatusCode(500);
        }
        [Authorize]
        [HttpPut("{userId}")]
        public async Task<ActionResult<UserReadDto>> UpdateUser(Guid userId, UserUpdateDto updateDto)
        {
            // a customer may only update their own account, an admin may update any
            AuthorizationUtils.EnsureOwnerOrAdmin(User, userId);

            var userRead = await _userService.UpdateOneAsync(userId, updateDto);
            return Ok($"{userRead} successfully updated");
        }

        // the only way to hand out the Admin role, and only an admin can call it
        [Authorize(Roles = "Admin")]
        [HttpPut("{userId}/role")]
        public async Task<ActionResult> UpdateUserRole(Guid userId, UserRoleUpdateDto updateDto)
        {
            // the enum converter also accepts raw numbers, so {"role": 7} would
            // reach the database as an undefined value and blow up on save
            if (updateDto.Role == null || !Enum.IsDefined(typeof(UserRole), updateDto.Role.Value))
                throw CustomException.BadRequest("Role must be either Admin or Customer");

            var isUpdated = await _userService.UpdateRoleAsync(userId, updateDto.Role.Value);
            return isUpdated ? Ok("user role successfully updated") : StatusCode(500);
        }

    }


}