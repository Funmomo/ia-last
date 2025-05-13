using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealtimeAPI.Models;

namespace RealtimeAPI.Data.Configurations
{
    public class ShelterConfiguration : IEntityTypeConfiguration<Shelter>
    {
        public void Configure(EntityTypeBuilder<Shelter> builder)
        {
            builder.HasKey(s => s.Id);

            builder.Property(s => s.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(s => s.Address)
                .HasMaxLength(200);

            builder.Property(s => s.Phone)
                .HasMaxLength(20);

            builder.Property(s => s.Email)
                .HasMaxLength(100);

            builder.Property(s => s.Status)
                .IsRequired();

            builder.Property(s => s.CreatedAt)
                .IsRequired();

            builder.Property(s => s.UpdatedAt)
                .IsRequired();

            // Create unique index for Email
            builder.HasIndex(s => s.Email)
                .IsUnique();

            // Relationships
            builder.HasMany(s => s.Pets)
                .WithOne(p => p.Shelter)
                .HasForeignKey(p => p.ShelterId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(s => s.AdoptionRequests)
                .WithOne(ar => ar.Shelter)
                .HasForeignKey(ar => ar.ShelterId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 