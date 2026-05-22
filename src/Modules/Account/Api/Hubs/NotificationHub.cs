using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SharedKernel.Abstractions.Services;
using SharedKernel.Authorization;

namespace Account.Api.Hubs;

[Authorize(Policy = Policies.TenantAdminUp)]
public class NotificationHub(ITenant tenant) : Hub
{
    public override async Task OnConnectedAsync()
    {
        if (Context.User?.IsInRole(Roles.SystemAdmin) == true ||
            Context.User?.IsInRole(Roles.TenantAdmin) == true)
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                NotificationRealtimeGroups.TenantAdminUp(tenant.Id),
                Context.ConnectionAborted);
        }

        await base.OnConnectedAsync();
    }
}

public static class NotificationRealtimeGroups
{
    public static string TenantAdminUp(int tenantId) => $"tenant:{tenantId}:notifications:admin-up";
}
