using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealtimeAPI.Models;

namespace RealtimeAPI.Data.Configurations
{
    public class InterviewScheduleConfiguration : IEntityTypeConfiguration<InterviewSchedule>
    {
        public void Configure(EntityTypeBuilder<InterviewSchedule> builder)
        {
            builder.HasKey(i => i.Id);

            builder.Property(i => i.InterviewDate)
                .IsRequired();

            builder.Property(i => i.Status)
                .IsRequired();

            builder.Property(i => i.Notes)
                .HasColumnType("nvarchar(1000)");

            builder.Property(i => i.CreatedAt)
                .IsRequired();

            builder.Property(i => i.UpdatedAt)
                .IsRequired();

            // Relationships
            builder.HasOne(i => i.AdoptionRequest)
                .WithMany(ar => ar.InterviewSchedules)
                .HasForeignKey(i => i.AdoptionRequestId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 