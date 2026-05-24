using Intermediary.Ordering;
using Microsoft.EntityFrameworkCore;
using Order.Core.Entities;
using Order.Core.Usecases.Orders;
using System.Security.Cryptography;
using System.Text;

namespace Order.Core.Services;

public class OrderPaymentLookup(OrderDbContext db) : IOrderPaymentLookup
{
    public async Task<OrderPaymentInfo?> GetOrderForCheckoutAsync(
        string orderCode,
        string? guestCheckoutToken = null,
        CancellationToken cancellationToken = default)
    {
        var order = await db.Orders
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Code == orderCode && !x.IsDeleted, cancellationToken);

        if (order is null)
            return null;

        if (string.IsNullOrWhiteSpace(order.CustomerId) &&
            !MatchesGuestCheckoutToken(order.GuestCheckoutTokenHash, guestCheckoutToken))
            return null;

        return new OrderPaymentInfo(
                order.Code,
                order.CustomerId,
                order.Status == OrderStatus.PendingPayment,
                order.TotalAmount,
                order.CurrencyCode,
                order.PaymentProvider);
    }

    private static bool MatchesGuestCheckoutToken(string? expectedHash, string? token)
    {
        if (string.IsNullOrWhiteSpace(expectedHash) || string.IsNullOrWhiteSpace(token))
            return false;

        var actualHash = CreateOrder.HashToken(token);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(expectedHash),
            Encoding.UTF8.GetBytes(actualHash));
    }
}
