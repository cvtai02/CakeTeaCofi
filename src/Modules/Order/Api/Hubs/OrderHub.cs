using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Authorization;

namespace Order.Api.Hubs;

public class OrderHub(OrderDbContext db) : Hub
{
    [Authorize]
    public async Task JoinOrder(string orderCode)
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(orderCode) || string.IsNullOrWhiteSpace(userId))
        {
            throw new HubException("Order is not available.");
        }

        var normalizedCode = orderCode.Trim();
        var canAccessOrder = IsTenantModeratorUp()
            ? await db.Orders
                .AsNoTracking()
                .AnyAsync(x => x.Code == normalizedCode, Context.ConnectionAborted)
            : await db.Orders
                .AsNoTracking()
                .AnyAsync(x => x.Code == normalizedCode && x.CustomerId == userId, Context.ConnectionAborted);

        if (!canAccessOrder)
        {
            throw new HubException("Order is not available.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, OrderRealtimeGroups.Order(normalizedCode), Context.ConnectionAborted);
    }

    public async Task JoinGuestOrder(string orderCode, string email)
    {
        if (string.IsNullOrWhiteSpace(orderCode) || string.IsNullOrWhiteSpace(email))
        {
            throw new HubException("Order is not available.");
        }

        var normalizedCode = orderCode.Trim();
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var canAccessOrder = await db.Orders
            .AsNoTracking()
            .AnyAsync(x => x.Code == normalizedCode
                && x.CustomerId == null
                && x.ShippingAddress != null
                && x.ShippingAddress.Email.ToLower() == normalizedEmail,
                Context.ConnectionAborted);

        if (!canAccessOrder)
        {
            throw new HubException("Order is not available.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, OrderRealtimeGroups.Order(normalizedCode), Context.ConnectionAborted);
    }

    public Task LeaveOrder(string orderCode)
        => Groups.RemoveFromGroupAsync(Context.ConnectionId, OrderRealtimeGroups.Order(orderCode.Trim()), Context.ConnectionAborted);

    [Authorize]
    public Task JoinMyOrders()
    {
        var userId = GetAuthenticatedUserId();
        return Groups.AddToGroupAsync(Context.ConnectionId, OrderRealtimeGroups.Customer(userId), Context.ConnectionAborted);
    }

    [Authorize]
    public Task LeaveMyOrders()
    {
        var userId = GetAuthenticatedUserId();
        return Groups.RemoveFromGroupAsync(Context.ConnectionId, OrderRealtimeGroups.Customer(userId), Context.ConnectionAborted);
    }

    private string GetAuthenticatedUserId()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new HubException("Order notifications are not available.");
        }

        return userId;
    }

    private bool IsTenantModeratorUp()
        => Context.User?.IsInRole(Roles.SystemAdmin) == true
            || Context.User?.IsInRole(Roles.TenantAdmin) == true
            || Context.User?.IsInRole(Roles.TenantModerator) == true;
}
