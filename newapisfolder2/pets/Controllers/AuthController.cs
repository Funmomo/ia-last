using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using RealtimeAPI.Hubs;
using RealtimeAPI.Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using RealtimeAPI.Data;

namespace RealtimeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private readonly ApplicationDbContext _context;

        public AuthController(IHubContext<ChatHub> hubContext, IConfiguration configuration, ILogger<AuthController> logger, ApplicationDbContext context)
        {
            _hubContext = hubContext;
            _configuration = configuration;
            _logger = logger;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            try
            {
                _logger.LogInformation($"Attempting to register user with username: {model.Username}, email: {model.Email}");

                // Validate model
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning($"Invalid model state: {string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))}");
                    return BadRequest(ModelState);
                }

                // Check if user exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == model.Username || u.Email == model.Email);

                if (existingUser != null)
                {
                    _logger.LogWarning($"Registration failed: User exists with username: {existingUser.Username}, email: {existingUser.Email}");
                    return BadRequest("User already exists");
                }

                // Create new user
                var user = new User
                {
                    Id = Guid.NewGuid().ToString(), // Generate a unique ID
                    Username = model.Username,
                    Email = model.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password),
                    Role = (int)model.Role,
                    Status = "active"
                };

                _logger.LogInformation("Creating new user in database");
                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"User {user.Username} successfully created");

                // Generate token for immediate login
                var token = GenerateJwtToken(user);

                await _hubContext.Clients.All.SendAsync("UserRegistered", new { user.Id, user.Username, user.Email, user.Role });
                return Ok(new { 
                    message = "User registered successfully",
                    token = token,
                    user = new { 
                        id = user.Id,
                        username = user.Username,
                        email = user.Email,
                        role = user.Role
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration. Details: {Message}", ex.Message);
                if (ex.InnerException != null)
                {
                    _logger.LogError(ex.InnerException, "Inner exception: {Message}", ex.InnerException.Message);
                }
                return StatusCode(500, new { message = "An error occurred during registration", details = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    _logger.LogWarning($"Login failed for email: {request.Email}");
                    return Unauthorized("Invalid credentials");
                }

                var token = GenerateJwtToken(user);
                _logger.LogInformation($"User {user.Username} successfully logged in");
                return Ok(new { 
                    Token = token,
                    UserId = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, "An error occurred during login");
            }
        }

        private string GenerateJwtToken(User user)
        {
            byte[] keyBytes = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured"));
            var securityKey = new SymmetricSecurityKey(keyBytes);
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, ((UserRole)user.Role).ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class RegisterDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public UserRole Role { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}