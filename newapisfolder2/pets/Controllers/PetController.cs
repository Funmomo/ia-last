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
    public class PetController : ControllerBase
    {
        private readonly IHubContext<Hubs.PetHub> _hubContext;
        private readonly ApplicationDbContext _context;

        public PetController(IHubContext<Hubs.PetHub> hubContext, ApplicationDbContext context)
        {
            _hubContext = hubContext;
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Pet>>> GetPets()
        {
            return await _context.Pets
                .Include(p => p.Shelter)
                .Include(p => p.Category)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Pet>> GetPet(int id)
        {
            var pet = await _context.Pets
                .Include(p => p.Shelter)
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pet == null)
            {
                return NotFound();
            }
            return pet;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,ShelterStaff")]
        public async Task<ActionResult<Pet>> CreatePet(Pet pet)
        {
            pet.AddedAt = DateTime.UtcNow;
            pet.UpdatedAt = DateTime.UtcNow;

            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("PetCreated", pet);
            return CreatedAtAction(nameof(GetPet), new { id = pet.Id }, pet);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,ShelterStaff")]
        public async Task<IActionResult> UpdatePet(int id, Pet pet)
        {
            if (id != pet.Id)
            {
                return BadRequest();
            }

            // Verify that the staff member belongs to the shelter
            if (User.IsInRole("ShelterStaff"))
            {
                var shelterId = int.Parse(User.FindFirst("ShelterId")?.Value ?? "0");
                if (pet.ShelterId != shelterId)
                    return Forbid();
            }

            pet.UpdatedAt = DateTime.UtcNow;
            _context.Entry(pet).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("PetUpdated", pet);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,ShelterStaff")]
        public async Task<IActionResult> DeletePet(int id)
        {
            var pet = await _context.Pets.FindAsync(id);
            if (pet == null)
            {
                return NotFound();
            }

            // Verify that the staff member belongs to the shelter
            if (User.IsInRole("ShelterStaff"))
            {
                var shelterId = int.Parse(User.FindFirst("ShelterId")?.Value ?? "0");
                if (pet.ShelterId != shelterId)
                    return Forbid();
            }

            _context.Pets.Remove(pet);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("PetDeleted", id);
            return NoContent();
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,ShelterStaff")]
        public async Task<IActionResult> UpdatePetStatus(int id, [FromBody] PetStatusRequest request)
        {
            var pet = await _context.Pets.FindAsync(id);
            if (pet == null)
                return NotFound();

            // Verify that the staff member belongs to the shelter
            if (User.IsInRole("ShelterStaff"))
            {
                var shelterId = int.Parse(User.FindFirst("ShelterId")?.Value ?? "0");
                if (pet.ShelterId != shelterId)
                    return Forbid();
            }

            pet.Status = (int)request.Status;
            pet.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("PetStatusUpdated", pet);
            return Ok(pet);
        }

        [HttpGet("shelter/{shelterId}")]
        public async Task<ActionResult<IEnumerable<Pet>>> GetPetsByShelter(int shelterId)
        {
            return await _context.Pets
                .Where(p => p.ShelterId == shelterId)
                .Include(p => p.Category)
                .ToListAsync();
        }

        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<Pet>>> GetPetsByCategory(int categoryId)
        {
            return await _context.Pets
                .Where(p => p.CategoryId == categoryId)
                .Include(p => p.Shelter)
                .ToListAsync();
        }

        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<Pet>>> GetAvailablePets()
        {
            return await _context.Pets
                .Where(p => p.Status == (int)PetStatus.Available)
                .Include(p => p.Shelter)
                .Include(p => p.Category)
                .ToListAsync();
        }
    }

    public class PetRequest
    {
        public string Name { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string Breed { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Description { get; set; } = string.Empty;
        public string MedicalHistory { get; set; } = string.Empty;
        public int ShelterId { get; set; }
    }

    public class PetStatusRequest
    {
        public PetStatus Status { get; set; }
    }
} 