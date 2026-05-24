using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class HardDeleteTenant(TenantManagementDbContext db)
{
    public async Task<bool> ExecuteAsync(int id, CancellationToken ct)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (tenant is null)
            return false;

        if (!tenant.IsArchived)
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(tenant.IsArchived)] = ["Tenant must be archived before hard delete."]
            });
        }

        db.Tenants.Remove(tenant);
        await db.SaveChangesAsync(ct);

        return true;
    }
}
