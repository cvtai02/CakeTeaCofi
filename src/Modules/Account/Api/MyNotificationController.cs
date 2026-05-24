using Account.Core.Usecases.Notifications;
using Account.DTOs.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Authorization;
using SharedKernel.DTOs;

namespace Account.Api;

[ApiController]
[Authorize(Policy = Policies.AuthenticatedUserUp)]
[Route($"api/{ModuleConstants.Key}/notifications")]
public class MyNotificationController(
    ListMyNotifications listMyNotifications,
    MarkMyNotificationRead markMyNotificationRead,
    MarkAllMyNotificationsRead markAllMyNotificationsRead) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<NotificationResponse>>> GetAll(
        [FromQuery] ListNotificationsRequest request,
        CancellationToken cancellationToken)
        => Ok(await listMyNotifications.ExecuteAsync(request, cancellationToken));

    [HttpPatch("{id:int}/read")]
    public async Task<ActionResult<NotificationResponse>> MarkRead(int id, CancellationToken cancellationToken)
    {
        var result = await markMyNotificationRead.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPatch("read")]
    public async Task<ActionResult<PaginatedList<NotificationResponse>>> MarkAllRead(CancellationToken cancellationToken)
        => Ok(await markAllMyNotificationsRead.ExecuteAsync(cancellationToken));
}
