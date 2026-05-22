using Account.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;

namespace Account;

public class AccountDbContext(DbContextOptions<AccountDbContext> options, ITenant? tenant)
    : TenancyDbContext(options, tenant)
{
    public DbSet<AccountProfile> Profiles => Set<AccountProfile>();
    public DbSet<AccountAddress> Addresses => Set<AccountAddress>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AccountProfile>()
            .HasIndex(x => new { x.TenantId, x.IdentityUserId })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");

        modelBuilder.Entity<AccountProfile>()
            .HasMany(x => x.Addresses)
            .WithOne(x => x.Profile)
            .HasForeignKey(x => x.AccountProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AccountAddress>(builder =>
        {
            builder.OwnsOne(x => x.Address, address =>
            {
                address.Property(x => x.OwnerName).HasColumnName("OwnerName").HasMaxLength(200);
                address.Property(x => x.Type).HasColumnName("Type").HasMaxLength(100);
                address.Property(x => x.PhoneNumber).HasColumnName("PhoneNumber").HasMaxLength(50);
                address.Property(x => x.Email).HasColumnName("Email").HasMaxLength(200);
                address.Property(x => x.Country).HasColumnName("Country").HasConversion<string>().HasMaxLength(2);
                address.Property(x => x.AdministrativeArea).HasColumnName("AdministrativeArea").HasMaxLength(100);
                address.Property(x => x.Locality).HasColumnName("Locality").HasMaxLength(100);
                address.Property(x => x.SubLocality).HasColumnName("SubLocality").HasMaxLength(100);
                address.Property(x => x.PostalCode).HasColumnName("PostalCode").HasMaxLength(20);
                address.Property(x => x.Line1).HasColumnName("Line1").HasMaxLength(500);
                address.Property(x => x.Line2).HasColumnName("Line2").HasMaxLength(500);
            });
        });

        modelBuilder.Entity<Notification>(builder =>
        {
            builder.Property(x => x.RecipientUserId).HasMaxLength(450);
            builder.Property(x => x.RecipientRole).HasMaxLength(100);
            builder.Property(x => x.Type).HasMaxLength(100);
            builder.Property(x => x.Title).HasMaxLength(200);
            builder.Property(x => x.Message).HasMaxLength(1000);
            builder.Property(x => x.EntityType).HasMaxLength(100);
            builder.Property(x => x.EntityId).HasMaxLength(100);
            builder.Property(x => x.PayloadJson).HasColumnType("jsonb");
            builder.Property(x => x.ReadByUserId).HasMaxLength(450);
            builder.HasIndex(x => new { x.TenantId, x.IsRead, x.Created });
            builder.HasIndex(x => new { x.TenantId, x.EntityType, x.EntityId });
        });
    }
}
