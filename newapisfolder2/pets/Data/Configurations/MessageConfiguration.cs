using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealtimeAPI.Models;

namespace RealtimeAPI.Data.Configurations
{
    public class MessageConfiguration : IEntityTypeConfiguration<Message>
    {
        public void Configure(EntityTypeBuilder<Message> builder)
        {
            builder.HasKey(m => m.Id);

            builder.Property(m => m.Content)
                .IsRequired()
                .HasMaxLength(1000);

            builder.Property(m => m.SentAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            builder.Property(m => m.IsDelivered)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(m => m.ConversationId)
                .IsRequired();

            builder.Property(m => m.SenderId)
                .IsRequired()
                .HasMaxLength(450);

            builder.Property(m => m.ReceiverId)
                .IsRequired()
                .HasMaxLength(450);

            // Relationships
            builder.HasOne(m => m.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(m => m.Receiver)
                .WithMany(u => u.ReceivedMessages)
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes
            builder.HasIndex(m => m.ConversationId);
            builder.HasIndex(m => m.SenderId);
            builder.HasIndex(m => m.ReceiverId);
        }
    }
}