using Microsoft.EntityFrameworkCore;
using Payment.DTOs;
using SharedKernel.Abstractions.Services;

namespace Payment.Core.Usecases;

[UsecaseInject]
public class GetPaymentTransactionById(PaymentDbContext db, IUser user)
{
    public Task<PaymentTransactionResponse?> ExecuteAsync(int id, CancellationToken ct)
        => ExecuteAsync(id, customerId: user.Id, ct);

    public Task<PaymentTransactionResponse?> ExecuteAdminAsync(int id, CancellationToken ct)
        => ExecuteAsync(id, customerId: null, ct);

    private async Task<PaymentTransactionResponse?> ExecuteAsync(
        int id,
        string? customerId,
        CancellationToken ct)
    {
        var query = db.PaymentTransactions
            .AsNoTracking()
            .Where(x => x.Id == id && !x.IsDeleted);

        if (customerId is not null)
            query = query.Where(x => x.CustomerId == customerId);

        var transaction = await query.FirstOrDefaultAsync(ct);

        return transaction is null ? null : PaymentMapper.ToResponse(transaction);
    }
}
