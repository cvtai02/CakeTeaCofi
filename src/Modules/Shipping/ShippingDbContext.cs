using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;
using Shipping.Core.Entities;

namespace Shipping;

public class ShippingDbContext : TenancyDbContext
{
    public ShippingDbContext(DbContextOptions<ShippingDbContext> options, ITenant? tenant) : base(options, tenant)
    {
    }

    public DbSet<ProductShipping> ProductShippings => Set<ProductShipping>();
    public DbSet<VariantShipping> VariantShippings => Set<VariantShipping>();
}
