using System.ComponentModel.DataAnnotations;

namespace Order.DTOs.Orders;

public class CancelOrderRequest
{
    [MaxLength(2000)]
    public string? Reason { get; set; }
}
