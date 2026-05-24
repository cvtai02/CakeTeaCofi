using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class UpdateTenantLogo(TenantManagementDbContext db)
{
    public async Task<TenantResponse?> ExecuteAsync(int id, UpdateTenantLogoRequest request, CancellationToken ct)
    {
        Validate(request);

        var tenant = await db.Tenants.FirstOrDefaultAsync(x => x.Id == id && !x.IsArchived, ct);
        if (tenant is null)
            return null;

        tenant.LogoKey = request.LogoKey.Trim();
        tenant.LastModified = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        return TenantMapper.ToResponse(tenant);
    }

    private static void Validate(UpdateTenantLogoRequest request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.LogoKey))
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(UpdateTenantLogoRequest.LogoKey)] = ["Tenant logo key is required."]
            });
        }
    }
}
