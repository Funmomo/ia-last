using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using RealtimeAPI.Data;
using RealtimeAPI.Models;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace RealtimeAPI.Controllers
{
    /// <summary>
    /// Controller for managing user profile operations
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProfileController> _logger;

        public ProfileController(ApplicationDbContext context, ILogger<ProfileController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Public test endpoint that doesn't require authentication
        /// </summary>
        [HttpGet("test")]
        [AllowAnonymous]
        public IActionResult Test()
        {
            return Ok(new { message = "Public endpoint is working", timestamp = DateTime.UtcNow });
        }

        /// <summary>
        /// Protected test endpoint that requires authentication
        /// </summary>
        [HttpGet("authtest")]
        [Authorize]
        public IActionResult AuthTest()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();

            return Ok(new
            {
                message = "Authentication successful",
                userId,
                username,
                claims,
                timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Get the current user's profile
        /// </summary>
        /// <returns>The user's profile details</returns>
        /// <response code="200">Returns the user's profile</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="404">If the user's profile is not found</response>
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("User ID claim not found in token");
                return Unauthorized(new { message = "Invalid token" });
            }

            try
            {
                var profile = await _context.Users
                    .Where(u => u.Id == userId)
                    .Select(u => new
                    {
                        u.Id,
                        u.Username,
                        u.Email,
                        Role = (UserRole)u.Role,
                        u.ShelterId,
                        u.Status,
                        LastUpdated = DateTime.UtcNow
                    })
                    .FirstOrDefaultAsync();

                if (profile == null)
                {
                    _logger.LogWarning($"Profile not found for user ID: {userId}");
                    return NotFound(new { message = "Profile not found" });
                }

                _logger.LogInformation($"Profile retrieved successfully for user: {profile.Username}");
                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving profile for user ID: {userId}");
                return StatusCode(500, new { message = "An error occurred while retrieving the profile" });
            }
        }

        /// <summary>
        /// Update the current user's profile
        /// </summary>
        /// <param name="updateDto">The updated profile information</param>
        /// <returns>The updated profile details</returns>
        /// <response code="200">Returns the updated profile</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="404">If the user's profile is not found</response>
        /// <response code="400">If the update request is invalid</response>
        [HttpPut("me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            try
            {
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                // Validate and update email
                if (!string.IsNullOrEmpty(updateDto.Email))
                {
                    var emailExists = await _context.Users
                        .AnyAsync(u => u.Email == updateDto.Email && u.Id != userId);
                    
                    if (emailExists)
                    {
                        return BadRequest(new { message = "Email is already in use" });
                    }
                    user.Email = updateDto.Email;
                }

                // Validate and update username
                if (!string.IsNullOrEmpty(updateDto.Username))
                {
                    var usernameExists = await _context.Users
                        .AnyAsync(u => u.Username == updateDto.Username && u.Id != userId);
                    
                    if (usernameExists)
                    {
                        return BadRequest(new { message = "Username is already in use" });
                    }
                    user.Username = updateDto.Username;
                }

                // Update password if provided
                if (!string.IsNullOrEmpty(updateDto.NewPassword))
                {
                    if (string.IsNullOrEmpty(updateDto.CurrentPassword))
                    {
                        return BadRequest(new { message = "Current password is required to set a new password" });
                    }

                    if (!BCrypt.Net.BCrypt.Verify(updateDto.CurrentPassword, user.PasswordHash))
                    {
                        _logger.LogWarning($"Invalid current password provided for user: {userId}");
                        return BadRequest(new { message = "Current password is incorrect" });
                    }

                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateDto.NewPassword);
                    _logger.LogInformation($"Password updated successfully for user: {userId}");
                }

                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Profile updated successfully for user: {userId}");
                
                return Ok(new
                {
                    message = "Profile updated successfully",
                    user = new
                    {
                        user.Id,
                        user.Username,
                        user.Email,
                        Role = (UserRole)user.Role,
                        user.ShelterId,
                        user.Status,
                        LastUpdated = DateTime.UtcNow
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating profile for user ID: {userId}");
                return StatusCode(500, new { message = "An error occurred while updating the profile" });
            }
        }
    }

    /// <summary>
    /// Data transfer object for updating user profile
    /// </summary>
    public class UpdateProfileDto
    {
        /// <summary>
        /// The new username for the user
        /// </summary>
        public string? Username { get; set; }

        /// <summary>
        /// The new email address for the user
        /// </summary>
        public string? Email { get; set; }

        /// <summary>
        /// The current password (required when changing password)
        /// </summary>
        public string? CurrentPassword { get; set; }

        /// <summary>
        /// The new password for the user
        /// </summary>
        public string? NewPassword { get; set; }
    }
} 