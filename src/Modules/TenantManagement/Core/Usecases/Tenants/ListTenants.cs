using Microsoft.EntityFrameworkCore;
using SharedKernel.DTOs;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class ListTenants(TenantManagementDbContext db)
{
    public async Task<PaginatedList<TenantResponse>> ExecuteAsync(ListTenantsRequest request, CancellationToken ct)
    {
        var query = db.Tenants.AsNoTracking().AsQueryable();

        if (!request.IncludeArchived)
            query = query.Where(x => !x.IsArchived);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLowerInvariant();
            query = query.Where(x =>
                x.Name.ToLower().Contains(search) ||
                x.Signature.ToLower().Contains(search) ||
                (x.Domain != null && x.Domain.ToLower().Contains(search)));
        }

        if (request.IsActive.HasValue)
            query = query.Where(x => x.IsActive == request.IsActive.Value);

        var totalCount = await query.CountAsync(ct);
        var tenants = await query
            .OrderBy(x => x.Name)
            .ThenBy(x => x.Id)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);
        var items = tenants.Select(TenantMapper.ToResponse).ToList();

        return new PaginatedList<TenantResponse>(items, totalCount, request.PageNumber, request.PageSize);
    }
}
