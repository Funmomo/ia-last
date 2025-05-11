using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealtimeAPI.Models
{
    public class SupportIssue
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string ReportID { get; set; } = string.Empty;
        public User? Reporter { get; set; }
        
        public string? Title { get; set; }
        
        public string? Description { get; set; }
        
        [Required]
        public string Status { get; set; } = "open";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
} 