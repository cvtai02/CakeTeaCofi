using Microsoft.EntityFrameworkCore;
using TenantManagement.Core.Entities;

namespace TenantManagement;

public class TenantManagementDbContext(DbContextOptions<TenantManagementDbContext> options) : DbContext(options)
{
    public DbSet<TenantRecord> Tenants => Set<TenantRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TenantRecord>(builder =>
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).HasMaxLength(200);
            builder.Property(x => x.Signature).HasMaxLength(100);
            builder.Property(x => x.Domain).HasMaxLength(255);
            builder.Property(x => x.CdnBaseUrl).HasMaxLength(500);
            builder.Property(x => x.LogoKey).HasMaxLength(1000);
            builder.Property(x => x.AdminDashboardUrl).HasMaxLength(1000);
            builder.Property(x => x.CountryCode).HasConversion<string>().HasMaxLength(2);
            builder.HasIndex(x => x.Signature).IsUnique();
            builder.HasIndex(x => x.Domain).IsUnique();
        });
    }
}
