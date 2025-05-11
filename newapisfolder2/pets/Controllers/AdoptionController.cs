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
    public class AdoptionController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ApplicationDbContext _context;

        public AdoptionController(IHubContext<ChatHub> hubContext, ApplicationDbContext context)
        {
            _hubContext = hubContext;
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,ShelterStaff")]
        public async Task<ActionResult<IEnumerable<AdoptionRequest>>> GetAdoptionRequests()
        {
            return await _context.AdoptionRequests
                .Include(ar => ar.Pet)
                .Include(ar => ar.Adopter)
                .Include(ar => ar.Shelter)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AdoptionRequest>> GetAdoptionRequest(int id)
        {
            var request = await _context.AdoptionRequests
                .Include(ar => ar.Pet)
                .Include(ar => ar.Adopter)
                .Include(ar => ar.Shelter)
                .FirstOrDefaultAsync(ar => ar.Id == id);

            if (request == null)
            {
                return NotFound();
            }
            return request;
        }

        [HttpPost]
        public async Task<ActionResult<AdoptionRequest>> CreateAdoptionRequest(AdoptionRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            request.AdopterId = userId;
            request.RequestDate = DateTime.UtcNow;
            request.UpdatedAt = DateTime.UtcNow;

            _context.AdoptionRequests.Add(request);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAdoptionRequest), new { id = request.Id }, request);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAdoptionRequest(int id, AdoptionRequest request)
        {
            if (id != request.Id)
            {
                return BadRequest();
            }

            request.UpdatedAt = DateTime.UtcNow;
            _context.Entry(request).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAdoptionRequest(int id)
        {
            var request = await _context.AdoptionRequests.FindAsync(id);
            if (request == null)
            {
                return NotFound();
            }

            _context.AdoptionRequests.Remove(request);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<AdoptionRequest>>> GetUserAdoptionRequests(string userId)
        {
            return await _context.AdoptionRequests
                .Where(ar => ar.AdopterId == userId)
                .Include(ar => ar.Pet)
                .Include(ar => ar.Shelter)
                .ToListAsync();
        }

        [HttpGet("shelter/{shelterId}")]
        public async Task<ActionResult<IEnumerable<AdoptionRequest>>> GetShelterAdoptionRequests(int shelterId)
        {
            return await _context.AdoptionRequests
                .Where(ar => ar.ShelterId == shelterId)
                .Include(ar => ar.Pet)
                .Include(ar => ar.Adopter)
                .ToListAsync();
        }
    }
} 