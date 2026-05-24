using Microsoft.EntityFrameworkCore;
using Order.DTOs.Orders;
using SharedKernel.Exceptions;

namespace Order.Core.Usecases.Orders;

[UsecaseInject]
public class ShipOrder(OrderDbContext db)
{
    public async Task<OrderResponse?> ExecuteAsync(string code, CancellationToken ct)
    {
        var order = await db.Orders
            .Include(x => x.Lines)
            .FirstOrDefaultAsync(x => x.Code == code && !x.IsDeleted, ct);

        if (order is null)
            return null;

        if (order.Status is not Entities.OrderStatus.Placed and not Entities.OrderStatus.Paid)
            Throw("code", $"Order status {order.Status} cannot be marked shipped.");

        order.SetStatus(Entities.OrderStatus.Shipped);
        await db.SaveChangesAsync(ct);
        return OrderMapper.ToResponse(order);
    }

    private static void Throw(string field, string message)
        => throw new ValidationException("Validation failed", new Dictionary<string, string[]> { [field] = [message] });
}
