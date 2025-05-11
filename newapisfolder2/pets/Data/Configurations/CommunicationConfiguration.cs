using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealtimeAPI.Models;

namespace RealtimeAPI.Data.Configurations
{
    public class CommunicationConfiguration : IEntityTypeConfiguration<Communication>
    {
        public void Configure(EntityTypeBuilder<Communication> builder)
        {
            builder.HasKey(c => c.Id);

            builder.Property(c => c.SentAt)
                .IsRequired();

            // Relationships
            builder.HasOne(c => c.AdoptionRequest)
                .WithMany(ar => ar.Communications)
                .HasForeignKey(c => c.AdoptionRequestId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(c => c.Sender)
                .WithMany(u => u.SentCommunications)
                .HasForeignKey(c => c.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(c => c.Receiver)
                .WithMany(u => u.ReceivedCommunications)
                .HasForeignKey(c => c.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 