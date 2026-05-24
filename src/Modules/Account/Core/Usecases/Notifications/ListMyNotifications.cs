using Account.DTOs.Notifications;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;
using SharedKernel.DTOs;

namespace Account.Core.Usecases.Notifications;

[UsecaseInject]
public class ListMyNotifications(AccountDbContext db, IUser user)
{
    public async Task<PaginatedList<NotificationResponse>> ExecuteAsync(
        ListNotificationsRequest request,
        CancellationToken ct)
    {
        request ??= new ListNotificationsRequest();
        var query = db.Notifications
            .AsNoTracking()
            .Where(x => !x.IsDeleted && x.RecipientUserId == user.Id);

        if (request.IsRead.HasValue)
            query = query.Where(x => x.IsRead == request.IsRead.Value);
        if (!string.IsNullOrWhiteSpace(request.Type))
            query = query.Where(x => x.Type == request.Type.Trim());
        if (!string.IsNullOrWhiteSpace(request.EntityType))
            query = query.Where(x => x.EntityType == request.EntityType.Trim());
        if (!string.IsNullOrWhiteSpace(request.EntityId))
            query = query.Where(x => x.EntityId == request.EntityId.Trim());
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLowerInvariant();
            query = query.Where(x =>
                x.Title.ToLower().Contains(search) ||
                (x.Message != null && x.Message.ToLower().Contains(search)) ||
                (x.EntityId != null && x.EntityId.ToLower().Contains(search)));
        }

        query = query.OrderBy(x => x.IsRead).ThenByDescending(x => x.Created);
        var totalCount = await query.CountAsync(ct);
        var notifications = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return new PaginatedList<NotificationResponse>(
            notifications.Select(NotificationMapper.ToResponse).ToList(),
            totalCount,
            request.PageNumber,
            request.PageSize);
    }
}
