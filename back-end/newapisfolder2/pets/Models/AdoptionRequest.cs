using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace RealtimeAPI.Models
{
    public class AdoptionRequest
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int PetId { get; set; }
        public Pet? Pet { get; set; }
        
        [Required]
        public string AdopterId { get; set; } = string.Empty;
        public User? Adopter { get; set; }
        
        [Required]
        public int ShelterId { get; set; }
        public Shelter? Shelter { get; set; }
        
        [Required]
        public int Status { get; set; }
        
        public DateTime RequestDate { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Communication> Communications { get; set; } = new List<Communication>();
        public ICollection<InterviewSchedule> InterviewSchedules { get; set; } = new List<InterviewSchedule>();
    }

    public enum AdoptionRequestStatus
    {
        Pending = 0,
        InterviewScheduled = 1,
        Approved = 2,
        Rejected = 3,
        Cancelled = 4
    }
} 