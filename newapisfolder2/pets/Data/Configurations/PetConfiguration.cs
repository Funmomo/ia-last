using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealtimeAPI.Models;

namespace RealtimeAPI.Data.Configurations
{
    public class PetConfiguration : IEntityTypeConfiguration<Pet>
    {
        public void Configure(EntityTypeBuilder<Pet> builder)
        {
            builder.HasKey(p => p.Id);

            builder.Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(p => p.Age)
                .HasColumnType("int");

            builder.Property(p => p.Breed)
                .HasMaxLength(100);

            builder.Property(p => p.MedicalHistory)
                .HasMaxLength(1000);

            builder.Property(p => p.Description)
                .HasMaxLength(500);

            builder.Property(p => p.Status)
                .IsRequired();

            builder.Property(p => p.ImageUrl)
                .HasMaxLength(500);

            builder.Property(p => p.AddedAt)
                .IsRequired();

            builder.Property(p => p.UpdatedAt)
                .IsRequired();

            // Create indexes
            builder.HasIndex(p => p.ShelterId);
            builder.HasIndex(p => p.CategoryId);
            builder.HasIndex(p => p.Status);

            // Relationships
            builder.HasOne(p => p.Shelter)
                .WithMany(s => s.Pets)
                .HasForeignKey(p => p.ShelterId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.Category)
                .WithMany(pc => pc.Pets)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.AdoptionRequests)
                .WithOne(ar => ar.Pet)
                .HasForeignKey(ar => ar.PetId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 