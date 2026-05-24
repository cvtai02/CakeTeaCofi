using Intermediary.Events.Order;
using Microsoft.EntityFrameworkCore;
using Order.Core.Notifications;
using Order.DTOs.Orders;
using SharedKernel.Exceptions;

namespace Order.Core.Usecases.Orders;

[UsecaseInject]
public class CancelOrder(OrderDbContext db, OrderRealtimeNotifier realtimeNotifier)
{
    public async Task<OrderResponse?> ExecuteAsync(
        string code,
        CancelOrderRequest? request,
        CancellationToken ct)
    {
        var order = await db.Orders
            .Include(x => x.Lines)
            .FirstOrDefaultAsync(x => x.Code == code && !x.IsDeleted, ct);

        if (order is null)
            return null;

        if (order.Status is Entities.OrderStatus.Rejected or Entities.OrderStatus.Cancelled or Entities.OrderStatus.Shipped)
            Throw("code", $"Order status {order.Status} cannot be cancelled.");

        order.SetRejectionReason(request?.Reason ?? "Cancelled by admin.");
        order.SetStatus(Entities.OrderStatus.Cancelled);
        order.Events.Add(new OrderCanceled { OrderCode = order.Code });

        await db.SaveChangesAsync(ct);
        await realtimeNotifier.NotifyOrderRejectedAsync(order, ct);
        return OrderMapper.ToResponse(order);
    }

    private static void Throw(string field, string message)
        => throw new ValidationException("Validation failed", new Dictionary<string, string[]> { [field] = [message] });
}
