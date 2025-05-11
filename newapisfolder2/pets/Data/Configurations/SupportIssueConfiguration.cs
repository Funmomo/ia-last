using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealtimeAPI.Models;

namespace RealtimeAPI.Data.Configurations
{
    public class SupportIssueConfiguration : IEntityTypeConfiguration<SupportIssue>
    {
        public void Configure(EntityTypeBuilder<SupportIssue> builder)
        {
            builder.HasKey(si => si.Id);

            builder.Property(si => si.Title)
                .HasMaxLength(200);

            builder.Property(si => si.Description)
                .HasMaxLength(1000);

            builder.Property(si => si.Status)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(si => si.CreatedAt)
                .IsRequired();

            builder.Property(si => si.UpdatedAt)
                .IsRequired();

            // Relationships
            builder.HasOne(si => si.Reporter)
                .WithMany(u => u.ReportedIssues)
                .HasForeignKey(si => si.ReportID)
                .OnDelete(DeleteBehavior.Restrict);

            // Add check constraint using ToTable
            builder.ToTable("SupportIssue", t => t.HasCheckConstraint("CK_SupportIssue_Status", "Status IN ('open', 'in progress', 'closed')"));
        }
    }
} 