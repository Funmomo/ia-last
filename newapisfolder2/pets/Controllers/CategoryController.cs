using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using RealtimeAPI.Hubs;
using RealtimeAPI.Models;
using Microsoft.EntityFrameworkCore;
using RealtimeAPI.Data;

namespace RealtimeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CategoryController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ApplicationDbContext _context;

        public CategoryController(IHubContext<ChatHub> hubContext, ApplicationDbContext context)
        {
            _hubContext = hubContext;
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<PetCategory>>> GetCategories()
        {
            return await _context.PetCategories.ToListAsync();
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<PetCategory>> GetCategory(int id)
        {
            var category = await _context.PetCategories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }
            return category;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PetCategory>> CreateCategory(PetCategory category)
        {
            _context.PetCategories.Add(category);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("CategoryCreated", category);
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory(int id, PetCategory category)
        {
            if (id != category.Id)
            {
                return BadRequest();
            }

            _context.Entry(category).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("CategoryUpdated", category);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.PetCategories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            _context.PetCategories.Remove(category);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("CategoryDeleted", id);
            return NoContent();
        }
    }
} 