using Microsoft.EntityFrameworkCore;
using Npgsql;
using src.Utils;
namespace src.Middlewares
{
    public class ErrorHandlerMiddleware
    {
        protected readonly RequestDelegate _next;
        protected readonly ILogger<ErrorHandlerMiddleware> _logger;
        public ErrorHandlerMiddleware(RequestDelegate next, ILogger<ErrorHandlerMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (CustomException ex)
            {
                // touching the status code after the body started streaming
                // throws from inside the catch, which escapes InvokeAsync and
                // kills the connection without a single log line
                if (context.Response.HasStarted)
                    throw;

                context.Response.StatusCode = ex.StatusCode;
                context.Response.ContentType = "application/json";
                var response = new { ex.StatusCode, ex.Message };
                await context.Response.WriteAsJsonAsync(response);
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: "23505" })
            {
                // a unique constraint that a service-level pre-check lost the race to.
                // without this arm it falls through to the handler below and becomes an
                // opaque 500, which is worse than the clean 400 the pre-check gives
                _logger.LogWarning(ex, "Unique constraint violated on {Method} {Path}", context.Request.Method, context.Request.Path);

                if (context.Response.HasStarted)
                    throw;

                context.Response.StatusCode = 409;
                context.Response.ContentType = "application/json";
                var response = new { StatusCode = 409, Message = "That value is already registered" };
                await context.Response.WriteAsJsonAsync(response);
            }
            catch (Exception ex)
            {
                // anything we did not throw on purpose is logged for us but never
                // described to the caller, so no stack traces leave the server
                _logger.LogError(ex, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);

                if (context.Response.HasStarted)
                    throw;

                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/json";
                var response = new { StatusCode = 500, Message = "Internal server error" };
                await context.Response.WriteAsJsonAsync(response);
            }
        }
    }
}
