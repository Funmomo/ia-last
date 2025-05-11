using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace RealtimeAPI.Models
{
    public class Conversation
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Participant1Id { get; set; } = string.Empty;
        public User? Participant1 { get; set; }
        
        [Required]
        public string Participant2Id { get; set; } = string.Empty;
        public User? Participant2 { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
} 