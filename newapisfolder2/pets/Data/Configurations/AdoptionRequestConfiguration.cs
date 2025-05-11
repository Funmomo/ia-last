using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealtimeAPI.Models;

namespace RealtimeAPI.Data.Configurations
{
    public class AdoptionRequestConfiguration : IEntityTypeConfiguration<AdoptionRequest>
    {
        public void Configure(EntityTypeBuilder<AdoptionRequest> builder)
        {
            builder.HasKey(a => a.Id);

            builder.Property(a => a.Status)
                .IsRequired();

            builder.Property(a => a.RequestDate)
                .IsRequired();

            builder.Property(a => a.UpdatedAt)
                .IsRequired();

            // Create index
            builder.HasIndex(a => a.AdopterId);

            // Relationships
            builder.HasOne(a => a.Pet)
                .WithMany(p => p.AdoptionRequests)
                .HasForeignKey(a => a.PetId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.Adopter)
                .WithMany(u => u.AdoptionRequests)
                .HasForeignKey(a => a.AdopterId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.Shelter)
                .WithMany(s => s.AdoptionRequests)
                .HasForeignKey(a => a.ShelterId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 