using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealtimeAPI.Models
{
    public class Message
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string SenderId { get; set; } = string.Empty;
        public User? Sender { get; set; }
        
        [Required]
        public string ReceiverId { get; set; } = string.Empty;
        public User? Receiver { get; set; }
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        [Required]
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        public bool IsDelivered { get; set; }
        
        public DateTime? DeliveredAt { get; set; }
        
        [Required]
        public int ConversationId { get; set; }
        public Conversation? Conversation { get; set; }
    }
} 