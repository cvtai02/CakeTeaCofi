using Account.DTOs.Notifications;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;
using SharedKernel.DTOs;

namespace Account.Core.Usecases.Notifications;

[UsecaseInject]
public class MarkAllMyNotificationsRead(AccountDbContext db, IUser user)
{
    public async Task<PaginatedList<NotificationResponse>> ExecuteAsync(CancellationToken ct)
    {
        var notifications = await db.Notifications
            .Where(x => !x.IsDeleted && !x.IsRead && x.RecipientUserId == user.Id)
            .OrderByDescending(x => x.Created)
            .ToListAsync(ct);

        foreach (var notification in notifications)
            notification.MarkRead(user.Id);

        await db.SaveChangesAsync(ct);
        return new PaginatedList<NotificationResponse>(
            notifications.Select(NotificationMapper.ToResponse).ToList(),
            notifications.Count,
            1,
            notifications.Count == 0 ? 1 : notifications.Count);
    }
}
