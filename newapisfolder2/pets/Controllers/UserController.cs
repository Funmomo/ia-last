using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using RealtimeAPI.Hubs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using RealtimeAPI.Data;
using System.Collections.Concurrent;
using System.Security.Claims;
using RealtimeAPI.Models;

namespace RealtimeAPI.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private static readonly ConcurrentDictionary<string, UserInfo> _connectedUsers = new();
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UserController> _logger;

        public UserController(IHubContext<ChatHub> hubContext, ApplicationDbContext context, ILogger<UserController> logger)
        {
            _hubContext = hubContext;
            _context = context;
            _logger = logger;
        }

        // Basic user endpoints
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                _logger.LogInformation("Getting all users");
                var users = await _context.Users
                    .Select(u => new
                    {
                        u.Id,
                        u.Username,
                        u.Email,
                        u.Role,
                        u.ShelterId,
                        u.Status
                    })
                    .ToListAsync();

                _logger.LogInformation($"Found {users.Count} users");
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all users");
                return StatusCode(500, "An error occurred while fetching users");
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetUserById(string id)
        {
            try
            {
                _logger.LogInformation($"Getting user profile for ID: {id}");
                var user = await _context.Users
                    .Where(u => u.Id == id)
                    .Select(u => new
                    {
                        u.Id,
                        u.Username,
                        u.Email,
                        u.Role,
                        u.ShelterId,
                        u.Status
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    _logger.LogWarning($"User not found with ID: {id}");
                    return NotFound("User not found");
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting user profile for ID: {id}");
                return StatusCode(500, "An error occurred while fetching the user profile");
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserProfileDto updateDto)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    _logger.LogWarning($"User not found with ID: {id}");
                    return NotFound("User not found");
                }

                // Only allow users to update their own profile unless they're an admin
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId != id && !User.IsInRole("Admin"))
                {
                    _logger.LogWarning($"User {userId} attempted to update profile of user {id}");
                    return Forbid();
                }

                // Update fields
                if (!string.IsNullOrEmpty(updateDto.Username))
                    user.Username = updateDto.Username;
                
                if (!string.IsNullOrEmpty(updateDto.Email))
                    user.Email = updateDto.Email;
                
                if (!string.IsNullOrEmpty(updateDto.Status))
                    user.Status = updateDto.Status;

                await _context.SaveChangesAsync();
                _logger.LogInformation($"User profile updated successfully for ID: {id}");

                return Ok(new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.Role,
                    user.ShelterId,
                    user.Status
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating user profile for ID: {id}");
                return StatusCode(500, "An error occurred while updating the user profile");
            }
        }

        // Online status management
        [HttpGet("online")]
        [Authorize]
        public IActionResult GetOnlineUsers()
        {
            return Ok(_connectedUsers.Values);
        }

        [HttpPost("connect")]
        [Authorize]
        public async Task<IActionResult> Connect([FromBody] UserInfo userInfo)
        {
            _connectedUsers.AddOrUpdate(userInfo.ConnectionId, 
                userInfo, // Add value
                (key, existingValue) => userInfo); // Update value
            await _hubContext.Clients.All.SendAsync("UserConnected", userInfo);
            return Ok();
        }

        [HttpPost("disconnect")]
        [Authorize]
        public async Task<IActionResult> Disconnect([FromBody] string connectionId)
        {
            if (_connectedUsers.TryRemove(connectionId, out var userInfo))
            {
                await _hubContext.Clients.All.SendAsync("UserDisconnected", userInfo);
            }
            return Ok();
        }

        [HttpPut("status")]
        [Authorize]
        public async Task<IActionResult> UpdateStatus([FromBody] UserStatusUpdate statusUpdate)
        {
            if (_connectedUsers.TryGetValue(statusUpdate.ConnectionId, out var userInfo))
            {
                userInfo.Status = statusUpdate.Status;
                await _hubContext.Clients.All.SendAsync("UserStatusChanged", userInfo);
            }
            return Ok();
        }

        // Role-based user retrieval
        [HttpGet("role/{roleId}")]
        [Authorize]
        public async Task<IActionResult> GetUsersByRole(int roleId)
        {
            try
            {
                _logger.LogInformation($"Getting users with role: {roleId}");
                var users = await _context.Users
                    .Where(u => u.Role == roleId)
                    .Select(u => new
                    {
                        u.Id,
                        u.Username,
                        u.Email,
                        u.Role,
                        u.ShelterId,
                        u.Status
                    })
                    .ToListAsync();

                _logger.LogInformation($"Found {users.Count} users with role {roleId}");
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting users with role {roleId}");
                return StatusCode(500, "An error occurred while fetching users");
            }
        }

        [HttpGet("all")]
        [Authorize]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                _logger.LogInformation("Getting all users");
                var users = await _context.Users
                    .Select(u => new
                    {
                        u.Id,
                        u.Username,
                        u.Email,
                        u.Role,
                        u.ShelterId,
                        u.Status
                    })
                    .ToListAsync();

                _logger.LogInformation($"Found {users.Count} users");
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all users");
                return StatusCode(500, "An error occurred while fetching users");
            }
        }
    }

    public class UserInfo
    {
        public string ConnectionId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Status { get; set; } = "Online";
        public DateTime LastSeen { get; set; } = DateTime.UtcNow;
    }

    public class UserStatusUpdate
    {
        public string ConnectionId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    public class UpdateUserProfileDto
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Status { get; set; }
    }
} 