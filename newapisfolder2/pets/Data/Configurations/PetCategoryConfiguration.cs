using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealtimeAPI.Models;

namespace RealtimeAPI.Data.Configurations
{
    public class PetCategoryConfiguration : IEntityTypeConfiguration<PetCategory>
    {
        public void Configure(EntityTypeBuilder<PetCategory> builder)
        {
            builder.HasKey(pc => pc.Id);

            builder.Property(pc => pc.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasIndex(pc => pc.Name)
                .IsUnique();
        }
    }
} 