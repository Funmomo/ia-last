using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using RealtimeAPI.Data;
using RealtimeAPI.Models;
using System.Threading.Tasks;

namespace RealtimeAPI.Controllers
{
    /// <summary>
    /// Controller for admin-specific operations
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all users in the system
        /// </summary>
        /// <returns>List of all users with their details</returns>
        /// <response code="200">Returns the list of users</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the user is not an admin</response>
        [HttpGet("users")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAllUsers()
        {
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

            return Ok(users);
        }

        /// <summary>
        /// Get a specific user by their ID
        /// </summary>
        /// <param name="id">The ID of the user to retrieve</param>
        /// <returns>The user's details</returns>
        /// <response code="200">Returns the user</response>
        /// <response code="404">If the user is not found</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the user is not an admin</response>
        [HttpGet("users/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.Role,
                    u.ShelterId,
                    u.Status
                })
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound("User not found");
            }

            return Ok(user);
        }

        /// <summary>
        /// Get a specific user by their username
        /// </summary>
        /// <param name="username">The username of the user to retrieve</param>
        /// <returns>The user's details</returns>
        /// <response code="200">Returns the user</response>
        /// <response code="404">If the user is not found</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the user is not an admin</response>
        [HttpGet("users/username/{username}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetUserByUsername(string username)
        {
            var user = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.Role,
                    u.ShelterId,
                    u.Status
                })
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
            {
                return NotFound("User not found");
            }

            return Ok(user);
        }

        /// <summary>
        /// Get users by role
        /// </summary>
        /// <param name="role">The role of the users to retrieve</param>
        /// <returns>List of users with the specified role</returns>
        /// <response code="200">Returns the list of users</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the user is not an admin</response>
        [HttpGet("users/role/{role}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetUsersByRole(int role)
        {
            var users = await _context.Users
                .Where(u => u.Role == role)
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

            return Ok(users);
        }

        /// <summary>
        /// Update a user's information
        /// </summary>
        /// <param name="id">The ID of the user to update</param>
        /// <param name="updateUserDto">The updated user information</param>
        /// <returns>The updated user details</returns>
        /// <response code="200">Returns the updated user</response>
        /// <response code="404">If the user is not found</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the user is not an admin</response>
        [HttpPut("users/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto updateUserDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("User not found");
            }

            // Update only allowed fields
            if (!string.IsNullOrEmpty(updateUserDto.Email))
                user.Email = updateUserDto.Email;
            
            if (!string.IsNullOrEmpty(updateUserDto.Username))
                user.Username = updateUserDto.Username;
            
            if (updateUserDto.Role.HasValue)
                user.Role = updateUserDto.Role.Value;
            
            if (updateUserDto.ShelterId.HasValue)
                user.ShelterId = updateUserDto.ShelterId;
            
            if (!string.IsNullOrEmpty(updateUserDto.Status))
                user.Status = updateUserDto.Status;

            try
            {
                await _context.SaveChangesAsync();
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
            catch (DbUpdateConcurrencyException)
            {
                if (!await UserExists(id))
                {
                    return NotFound();
                }
                throw;
            }
        }

        /// <summary>
        /// Delete a user from the system
        /// </summary>
        /// <param name="id">The ID of the user to delete</param>
        /// <returns>No content if successful</returns>
        /// <response code="204">If the user was successfully deleted</response>
        /// <response code="404">If the user is not found</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the user is not an admin</response>
        [HttpDelete("users/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("User not found");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<bool> UserExists(string id)
        {
            return await _context.Users.AnyAsync(e => e.Id == id);
        }
    }

    /// <summary>
    /// Data transfer object for updating user information
    /// </summary>
    public class UpdateUserDto
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
        /// The new role for the user (0 = Admin, 1 = ShelterStaff, 2 = Adopter)
        /// </summary>
        public int? Role { get; set; }

        /// <summary>
        /// The ID of the shelter the user belongs to (if applicable)
        /// </summary>
        public int? ShelterId { get; set; }

        /// <summary>
        /// The user's status (e.g., "active", "inactive")
        /// </summary>
        public string? Status { get; set; }
    }
} 