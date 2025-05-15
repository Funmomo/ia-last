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
    public class ShelterController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ApplicationDbContext _context;

        public ShelterController(IHubContext<ChatHub> hubContext, ApplicationDbContext context)
        {
            _hubContext = hubContext;
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Shelter>>> GetShelters()
        {
            return await _context.Shelters.ToListAsync();
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Shelter>> GetShelter(int id)
        {
            var shelter = await _context.Shelters.FindAsync(id);
            if (shelter == null)
            {
                return NotFound();
            }
            return shelter;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Shelter>> CreateShelter(Shelter shelter)
        {
            shelter.CreatedAt = DateTime.UtcNow;
            shelter.UpdatedAt = DateTime.UtcNow;

            await _context.Shelters.AddAsync(shelter);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ShelterCreated", shelter);
            return CreatedAtAction(nameof(GetShelter), new { id = shelter.Id }, shelter);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,ShelterStaff")]
        public async Task<IActionResult> UpdateShelter(int id, Shelter shelter)
        {
            if (id != shelter.Id)
            {
                return BadRequest();
            }

            // Verify that the staff member belongs to the shelter
            if (User.IsInRole("ShelterStaff"))
            {
                var shelterId = int.Parse(User.FindFirst("ShelterId")?.Value ?? "0");
                if (shelter.Id != shelterId)
                    return Forbid();
            }

            shelter.UpdatedAt = DateTime.UtcNow;
            _context.Entry(shelter).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ShelterUpdated", shelter);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteShelter(int id)
        {
            var shelter = await _context.Shelters.FindAsync(id);
            if (shelter == null)
            {
                return NotFound();
            }

            _context.Shelters.Remove(shelter);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ShelterDeleted", id);
            return NoContent();
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateShelterStatus(int id, [FromBody] ShelterStatusRequest request)
        {
            var shelter = await _context.Shelters.FindAsync(id);
            if (shelter == null)
                return NotFound();

            shelter.Status = (int)request.Status;
            shelter.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(shelter);
        }

        [HttpGet("{id}/pets")]
        public async Task<ActionResult<IEnumerable<Pet>>> GetShelterPets(int id)
        {
            return await _context.Pets
                .Where(p => p.ShelterId == id)
                .Include(p => p.Category)
                .ToListAsync();
        }

        [HttpGet("{id}/requests")]
        public async Task<ActionResult<IEnumerable<AdoptionRequest>>> GetShelterRequests(int id)
        {
            return await _context.AdoptionRequests
                .Where(ar => ar.ShelterId == id)
                .Include(ar => ar.Pet)
                .Include(ar => ar.Adopter)
                .ToListAsync();
        }
    }

    public class ShelterRequest
    {
        public required string Name { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public required string Email { get; set; }
    }

    public class ShelterStatusRequest
    {
        public required ShelterStatus Status { get; set; }
    }
} 