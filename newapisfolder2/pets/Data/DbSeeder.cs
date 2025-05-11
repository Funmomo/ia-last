using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RealtimeAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using BCrypt.Net;

namespace RealtimeAPI.Data
{
    public static class DbSeeder
    {
        public static async Task SeedData(ApplicationDbContext context)
        {
            if (!await context.Users.AnyAsync())
            {
                // Add admin user
                var admin = new User
                {
                    Id = "1", // Explicitly set ID
                    Username = "admin",
                    Email = "admin@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = (int)UserRole.Admin,
                    Status = "active"
                };
                await context.Users.AddAsync(admin);

                // Add shelter staff
                var staff = new User
                {
                    Id = "2", // Explicitly set ID
                    Username = "staff",
                    Email = "staff@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("staff123"),
                    Role = (int)UserRole.ShelterStaff,
                    Status = "active"
                };
                await context.Users.AddAsync(staff);

                // Add adopter
                var adopter = new User
                {
                    Id = "3", // Explicitly set ID
                    Username = "adopter",
                    Email = "adopter@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("adopter123"),
                    Role = (int)UserRole.Adopter,
                    Status = "active"
                };
                await context.Users.AddAsync(adopter);

                await context.SaveChangesAsync();
            }

            if (!await context.Shelters.AnyAsync())
            {
                var shelter = new Shelter
                {
                    Name = "Happy Paws Shelter",
                    Address = "123 Pet Street",
                    Phone = "555-0123",
                    Email = "info@happypaws.com",
                    Status = (int)ShelterStatus.Active,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await context.Shelters.AddAsync(shelter);
                await context.SaveChangesAsync();
            }

            if (!await context.PetCategories.AnyAsync())
            {
                var categories = new[]
                {
                    new PetCategory
                    {
                        Name = "Dogs"
                    },
                    new PetCategory
                    {
                        Name = "Cats"
                    },
                    new PetCategory
                    {
                        Name = "Birds"
                    }
                };
                await context.PetCategories.AddRangeAsync(categories);
                await context.SaveChangesAsync();
            }

            if (!await context.Pets.AnyAsync())
            {
                var shelter = await context.Shelters.FirstAsync();
                var dogCategory = await context.PetCategories.FirstAsync(c => c.Name == "Dogs");
                var catCategory = await context.PetCategories.FirstAsync(c => c.Name == "Cats");

                var pets = new[]
                {
                    new Pet
                    {
                        Name = "Buddy",
                        ShelterId = shelter.Id,
                        CategoryId = dogCategory.Id,
                        Breed = "Golden Retriever",
                        Age = 2,
                        Description = "Friendly and playful",
                        Status = (int)PetStatus.Available,
                        AddedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Pet
                    {
                        Name = "Luna",
                        ShelterId = shelter.Id,
                        CategoryId = catCategory.Id,
                        Breed = "Siamese",
                        Age = 1,
                        Description = "Elegant and affectionate",
                        Status = (int)PetStatus.Available,
                        AddedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                };
                await context.Pets.AddRangeAsync(pets);
                await context.SaveChangesAsync();
            }
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
} 