using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealtimeAPI.Models;

namespace RealtimeAPI.Data.Configurations
{
    public class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
    {
        public void Configure(EntityTypeBuilder<Conversation> builder)
        {
            builder.HasKey(c => c.Id);

            builder.Property(c => c.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            builder.Property(c => c.Participant1Id)
                .IsRequired()
                .HasMaxLength(450);

            builder.Property(c => c.Participant2Id)
                .IsRequired()
                .HasMaxLength(450);

            // Relationships
            builder.HasOne(c => c.Participant1)
                .WithMany()
                .HasForeignKey(c => c.Participant1Id)
                .OnDelete(DeleteBehavior.NoAction)
                .IsRequired();

            builder.HasOne(c => c.Participant2)
                .WithMany()
                .HasForeignKey(c => c.Participant2Id)
                .OnDelete(DeleteBehavior.NoAction)
                .IsRequired();

            // Configure the Messages relationship
            builder.HasMany(c => c.Messages)
                .WithOne(m => m.Conversation)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Set the table name
            builder.ToTable("Conversations");
        }
    }
}
