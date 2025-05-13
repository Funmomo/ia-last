using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using RealtimeAPI.Hubs;
using RealtimeAPI.Models;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using RealtimeAPI.Data;

namespace RealtimeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SupportIssueController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ApplicationDbContext _context;

        public SupportIssueController(IHubContext<ChatHub> hubContext, ApplicationDbContext context)
        {
            _hubContext = hubContext;
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,ShelterStaff")]
        public async Task<IActionResult> GetAllIssues()
        {
            var issues = await _context.SupportIssue
                .Include(s => s.Reporter)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
            return Ok(issues);
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetUserIssues()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var issues = await _context.SupportIssue
                .Where(s => s.ReportID == userId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
            return Ok(issues);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetIssue(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var issue = await _context.SupportIssue
                .Include(s => s.Reporter)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (issue == null)
                return NotFound();

            // Check if user has permission to view this issue
            if (!User.IsInRole("Admin") && !User.IsInRole("ShelterStaff") && issue.ReportID != userId)
                return Forbid();

            return Ok(issue);
        }

        [HttpPost]
        public async Task<IActionResult> CreateIssue([FromBody] SupportIssueRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var issue = new SupportIssue
            {
                ReportID = userId,
                Title = request.Title,
                Description = request.Description,
                Status = "open",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.SupportIssue.AddAsync(issue);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("SupportIssueCreated", issue);
            return CreatedAtAction(nameof(GetIssue), new { id = issue.Id }, issue);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,ShelterStaff")]
        public async Task<IActionResult> UpdateIssueStatus(int id, [FromBody] SupportIssueStatusRequest request)
        {
            var issue = await _context.SupportIssue.FindAsync(id);
            if (issue == null)
                return NotFound();

            if (!IsValidStatus(request.Status))
                return BadRequest("Invalid status value");

            issue.Status = request.Status;
            issue.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("SupportIssueStatusUpdated", issue);
            return Ok(issue);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateIssue(int id, [FromBody] SupportIssueRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var issue = await _context.SupportIssue.FindAsync(id);

            if (issue == null)
                return NotFound();

            // Check if user has permission to update this issue
            if (!User.IsInRole("Admin") && !User.IsInRole("ShelterStaff") && issue.ReportID != userId)
                return Forbid();

            issue.Title = request.Title;
            issue.Description = request.Description;
            issue.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("SupportIssueUpdated", issue);
            return Ok(issue);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIssue(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var issue = await _context.SupportIssue.FindAsync(id);

            if (issue == null)
                return NotFound();

            // Check if user has permission to delete this issue
            if (!User.IsInRole("Admin") && !User.IsInRole("ShelterStaff") && issue.ReportID != userId)
                return Forbid();

            _context.SupportIssue.Remove(issue);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("SupportIssueDeleted", id);
            return NoContent();
        }

        private bool IsValidStatus(string status)
        {
            return status == "open" || status == "in progress" || status == "closed";
        }
    }

    public class SupportIssueRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class SupportIssueStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
} 