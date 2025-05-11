using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace RealtimeAPI.Models
{
    public class Shelter
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string? Address { get; set; }
        
        public string? Phone { get; set; }
        
        public string? Email { get; set; }
        
        [Required]
        public int Status { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Pet> Pets { get; set; } = new List<Pet>();
        public ICollection<AdoptionRequest> AdoptionRequests { get; set; } = new List<AdoptionRequest>();
    }

    public enum ShelterStatus
    {
        Pending = 0,
        Active = 1,
        Suspended = 2,
        Inactive = 3
    }
} 