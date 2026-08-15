using System.Security.Claims;

namespace src.Utils
{
    public static class AuthorizationUtils
    {
        // read the id of the logged in user from the token
        public static Guid GetUserId(ClaimsPrincipal principal)
        {
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!Guid.TryParse(userIdClaim, out Guid userId))
                throw CustomException.UnAuthorized("Invalid token. Please log in again");

            return userId;
        }

        // only the owner of the resource or an admin may go through
        public static void EnsureOwnerOrAdmin(ClaimsPrincipal principal, Guid ownerId)
        {
            if (principal.IsInRole("Admin"))
                return;

            if (GetUserId(principal) != ownerId)
                throw CustomException.Forbidden("You can only access your own resources");
        }
    }
}
