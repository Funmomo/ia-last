using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace RealtimeAPI.Models
{
    public class Pet
    {
        [Key]
        public int Id { get; set; }
        
        public int? ShelterId { get; set; }
        public Shelter? Shelter { get; set; }
        
        public int? CategoryId { get; set; }
        public PetCategory? Category { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public int? Age { get; set; }
        
        public string? Breed { get; set; }
        
        public string? MedicalHistory { get; set; }
        
        public string? Description { get; set; }
        
        [Required]
        public int Status { get; set; }
        
        public string? ImageUrl { get; set; }
        
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<AdoptionRequest> AdoptionRequests { get; set; } = new List<AdoptionRequest>();
    }

    public enum PetStatus
    {
        Available = 0,
        Pending = 1,
        Adopted = 2,
        NotAvailable = 3
    }

    public enum PetGender
    {
        Male = 0,
        Female = 1,
        Unknown = 2
    }
} 