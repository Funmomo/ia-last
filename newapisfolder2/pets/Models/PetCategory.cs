using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace RealtimeAPI.Models
{
    public class PetCategory
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;

        // Navigation properties
        public ICollection<Pet> Pets { get; set; } = new List<Pet>();
    }
} 