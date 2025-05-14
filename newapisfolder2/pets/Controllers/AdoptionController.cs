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
        public async Task<ActionResult<IEnumerable<AdoptionRequestDto>>> GetAdoptionRequests()
        {
            var requests = await _context.AdoptionRequests
                .Include(ar => ar.Pet)
                .Include(ar => ar.Adopter)
                .Include(ar => ar.Shelter)
                .ToListAsync();
                
            return requests.Select(r => new AdoptionRequestDto(r)).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AdoptionRequestDto>> GetAdoptionRequest(int id)
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
            
            return new AdoptionRequestDto(request);
        }

        [HttpPost]
        public async Task<ActionResult<AdoptionRequestDto>> CreateAdoptionRequest(CreateAdoptionRequestDto requestDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var adoptionRequest = new AdoptionRequest
            {
                PetId = requestDto.PetId,
                ShelterId = requestDto.ShelterId,
                AdopterId = userId,
                Status = requestDto.Status,
                RequestDate = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.AdoptionRequests.Add(adoptionRequest);
            await _context.SaveChangesAsync();

            // Get the full entity with basic relationships
            var createdRequest = await _context.AdoptionRequests
                .Include(ar => ar.Pet)
                .Include(ar => ar.Shelter)
                .FirstOrDefaultAsync(ar => ar.Id == adoptionRequest.Id);

            return CreatedAtAction(nameof(GetAdoptionRequest), new { id = adoptionRequest.Id }, new AdoptionRequestDto(createdRequest));
        }

        [HttpPost("simple")]
        public async Task<ActionResult<AdoptionRequestDto>> CreateSimpleAdoptionRequest(SimplifiedAdoptionRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var pet = await _context.Pets
                .Include(p => p.Shelter)
                .FirstOrDefaultAsync(p => p.Id == request.PetId);

            if (pet == null)
            {
                return NotFound("Pet not found");
            }

            if (!pet.ShelterId.HasValue)
            {
                return BadRequest("Pet does not have an associated shelter");
            }

            var adoptionRequest = new AdoptionRequest
            {
                PetId = request.PetId,
                AdopterId = userId,
                ShelterId = pet.ShelterId.Value,
                Status = 0,
                RequestDate = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.AdoptionRequests.Add(adoptionRequest);
            await _context.SaveChangesAsync();

            // Get the full entity with basic relationships
            var createdRequest = await _context.AdoptionRequests
                .Include(ar => ar.Pet)
                .Include(ar => ar.Shelter)
                .FirstOrDefaultAsync(ar => ar.Id == adoptionRequest.Id);

            return CreatedAtAction(nameof(GetAdoptionRequest), new { id = adoptionRequest.Id }, new AdoptionRequestDto(createdRequest));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAdoptionRequest(int id, UpdateAdoptionRequestDto requestDto)
        {
            var existingRequest = await _context.AdoptionRequests.FindAsync(id);
            
            if (existingRequest == null)
            {
                return NotFound();
            }

            // Only update the status
            existingRequest.Status = requestDto.Status;
            existingRequest.UpdatedAt = DateTime.UtcNow;
            
            _context.Entry(existingRequest).State = EntityState.Modified;
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
        public async Task<ActionResult<IEnumerable<AdoptionRequestDto>>> GetUserAdoptionRequests(string userId)
        {
            var requests = await _context.AdoptionRequests
                .Where(ar => ar.AdopterId == userId)
                .Include(ar => ar.Pet)
                .Include(ar => ar.Shelter)
                .ToListAsync();
                
            return requests.Select(r => new AdoptionRequestDto(r)).ToList();
        }

        [HttpGet("shelter/{shelterId}")]
        public async Task<ActionResult<IEnumerable<AdoptionRequestDto>>> GetShelterAdoptionRequests(int shelterId)
        {
            var requests = await _context.AdoptionRequests
                .Where(ar => ar.ShelterId == shelterId)
                .Include(ar => ar.Pet)
                .Include(ar => ar.Adopter)
                .ToListAsync();
                
            return requests.Select(r => new AdoptionRequestDto(r)).ToList();
        }
    }

    // Simple DTO for the simplified adoption request
    public class SimplifiedAdoptionRequest
    {
        public int PetId { get; set; }
    }
    
    // Lightweight DTO for returning adoption request data without nested objects
    public class AdoptionRequestDto
    {
        public int Id { get; set; }
        public int PetId { get; set; }
        public string PetName { get; set; }
        public string PetImageUrl { get; set; }
        public string AdopterId { get; set; }
        public string AdopterName { get; set; }
        public int ShelterId { get; set; }
        public string ShelterName { get; set; }
        public int Status { get; set; }
        public DateTime RequestDate { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        public AdoptionRequestDto() { }
        
        public AdoptionRequestDto(AdoptionRequest request)
        {
            Id = request.Id;
            PetId = request.PetId;
            PetName = request.Pet?.Name ?? "Unknown";
            PetImageUrl = request.Pet?.ImageUrl ?? "";
            AdopterId = request.AdopterId;
            AdopterName = request.Adopter?.Username ?? "Unknown";
            ShelterId = request.ShelterId;
            ShelterName = request.Shelter?.Name ?? "Unknown";
            Status = request.Status;
            RequestDate = request.RequestDate;
            UpdatedAt = request.UpdatedAt;
        }
    }

    // DTO for creating a new adoption request
    public class CreateAdoptionRequestDto
    {
        public int PetId { get; set; }
        public int ShelterId { get; set; }
        public int Status { get; set; } = 0; // Default to Pending
    }

    // DTO for updating an adoption request
    public class UpdateAdoptionRequestDto
    {
        public int Status { get; set; }
    }
} 