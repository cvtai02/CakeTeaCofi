using Account.DTOs.Notifications;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;
using SharedKernel.Authorization;

namespace Account.Core.Usecases.Notifications;

[UsecaseInject]
public class MarkAdminNotificationRead(AccountDbContext db, IUser user)
{
    public async Task<NotificationResponse?> ExecuteAsync(int id, CancellationToken ct)
    {
        var notification = await db.Notifications
            .FirstOrDefaultAsync(x => x.Id == id
                && !x.IsDeleted
                && x.RecipientUserId == null
                && (x.RecipientRole == null
                    || x.RecipientRole == Roles.TenantAdmin
                    || x.RecipientRole == Roles.SystemAdmin), ct);

        if (notification is null)
            return null;

        notification.MarkRead(user.Id);
        await db.SaveChangesAsync(ct);

        return NotificationMapper.ToResponse(notification);
    }
}
