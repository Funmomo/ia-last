using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealtimeAPI.Models;

namespace RealtimeAPI.Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);

            builder.Property(u => u.Username)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(u => u.PasswordHash)
                .IsRequired();

            builder.Property(u => u.Role)
                .IsRequired();

            builder.Property(u => u.ShelterId)
                .IsRequired(false);

            builder.Property(u => u.ConnectionId)
                .IsRequired(false);

            builder.Property(u => u.Status)
                .IsRequired(false);

            // Create unique indexes
            builder.HasIndex(u => u.Username)
                .IsUnique();

            builder.HasIndex(u => u.Email)
                .IsUnique();

            // Relationships
            builder.HasMany(u => u.AdoptionRequests)
                .WithOne(ar => ar.Adopter)
                .HasForeignKey(ar => ar.AdopterId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(u => u.SentMessages)
                .WithOne(m => m.Sender)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(u => u.ReceivedMessages)
                .WithOne(m => m.Receiver)
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            // Remove the circular references for Communications
            builder.Ignore(u => u.SentCommunications);
            builder.Ignore(u => u.ReceivedCommunications);

            builder.HasMany(u => u.ReportedIssues)
                .WithOne(si => si.Reporter)
                .HasForeignKey(si => si.ReportID)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
