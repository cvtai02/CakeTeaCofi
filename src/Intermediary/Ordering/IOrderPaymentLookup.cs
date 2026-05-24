namespace Intermediary.Ordering;

public interface IOrderPaymentLookup
{
    Task<OrderPaymentInfo?> GetOrderForCheckoutAsync(
        string orderCode,
        string? guestCheckoutToken = null,
        CancellationToken cancellationToken = default);
}

public sealed record OrderPaymentInfo(
    string Code,
    string? CustomerId,
    bool IsPendingPayment,
    decimal TotalAmount,
    string CurrencyCode,
    string PaymentProvider);
