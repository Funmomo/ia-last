using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealtimeAPI.Models
{
    public class Communication
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int AdoptionRequestId { get; set; }
        public AdoptionRequest? AdoptionRequest { get; set; }
        
        [Required]
        public string SenderId { get; set; } = string.Empty;
        public User? Sender { get; set; }
        
        [Required]
        public string ReceiverId { get; set; } = string.Empty;
        public User? Receiver { get; set; }
        
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
} 