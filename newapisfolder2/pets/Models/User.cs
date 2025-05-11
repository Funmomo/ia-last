using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace RealtimeAPI.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        
        [Required]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        public int Role { get; set; }
        
        public int? ShelterId { get; set; }
        
        public string? ConnectionId { get; set; }
        
        public string? Status { get; set; }

        // Navigation properties
        public ICollection<AdoptionRequest> AdoptionRequests { get; set; } = new List<AdoptionRequest>();
        public ICollection<Message> SentMessages { get; set; } = new List<Message>();
        public ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
        public ICollection<Communication> SentCommunications { get; set; } = new List<Communication>();
        public ICollection<Communication> ReceivedCommunications { get; set; } = new List<Communication>();
        public ICollection<SupportIssue> ReportedIssues { get; set; } = new List<SupportIssue>();
    }

    public enum UserRole
    {
        Admin = 0,
        ShelterStaff = 1,
        Adopter = 2
    }
} 