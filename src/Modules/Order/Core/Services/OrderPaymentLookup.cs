using Intermediary.Ordering;
using Microsoft.EntityFrameworkCore;
using Order.Core.Entities;

namespace Order.Core.Services;

public class OrderPaymentLookup(OrderDbContext db) : IOrderPaymentLookup
{
    public async Task<OrderPaymentInfo?> GetOrderForCheckoutAsync(
        string orderCode,
        CancellationToken cancellationToken = default)
    {
        var order = await db.Orders
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Code == orderCode && !x.IsDeleted, cancellationToken);

        return order is null
            ? null
            : new OrderPaymentInfo(
                order.Code,
                order.CustomerId,
                order.Status == OrderStatus.PendingPayment,
                order.TotalAmount,
                order.CurrencyCode,
                order.PaymentProvider);
    }
}
