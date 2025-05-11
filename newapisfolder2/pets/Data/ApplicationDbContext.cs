using Microsoft.EntityFrameworkCore;
using RealtimeAPI.Models;
using RealtimeAPI.Data.Configurations;

namespace RealtimeAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<Pet> Pets { get; set; }
        public DbSet<Shelter> Shelters { get; set; }
        public DbSet<PetCategory> PetCategories { get; set; }
        public DbSet<AdoptionRequest> AdoptionRequests { get; set; }
        public DbSet<SupportIssue> SupportIssue { get; set; }
        public DbSet<Communication> Communications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Apply configurations
            modelBuilder.ApplyConfiguration(new UserConfiguration());
            modelBuilder.ApplyConfiguration(new MessageConfiguration());
            modelBuilder.ApplyConfiguration(new ConversationConfiguration());
            modelBuilder.ApplyConfiguration(new PetConfiguration());
            modelBuilder.ApplyConfiguration(new ShelterConfiguration());
            modelBuilder.ApplyConfiguration(new PetCategoryConfiguration());
            modelBuilder.ApplyConfiguration(new AdoptionRequestConfiguration());
            modelBuilder.ApplyConfiguration(new SupportIssueConfiguration());
            modelBuilder.ApplyConfiguration(new CommunicationConfiguration());

            // Set table names
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Message>().ToTable("Messages");
            modelBuilder.Entity<Conversation>().ToTable("Conversations");
            modelBuilder.Entity<Pet>().ToTable("Pets");
            modelBuilder.Entity<Shelter>().ToTable("Shelters");
            modelBuilder.Entity<PetCategory>().ToTable("PetCategories");
            modelBuilder.Entity<AdoptionRequest>().ToTable("AdoptionRequests");
            modelBuilder.Entity<SupportIssue>().ToTable("SupportIssues");
            modelBuilder.Entity<Communication>().ToTable("Communications");
        }
    }
}