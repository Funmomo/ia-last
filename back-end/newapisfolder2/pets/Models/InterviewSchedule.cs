using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealtimeAPI.Models
{
    public class InterviewSchedule
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int AdoptionRequestId { get; set; }
        public AdoptionRequest? AdoptionRequest { get; set; }
        
        [Required]
        public DateTime InterviewDate { get; set; }
        
        [Required]
        public int Status { get; set; }
        
        public string? Notes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public enum InterviewStatus
    {
        Scheduled = 0,
        Completed = 1,
        Cancelled = 2,
        Rescheduled = 3
    }
} 