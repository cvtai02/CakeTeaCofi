using SharedKernel.ValueObjects;

namespace Account.Core.Entities;

public class AccountAddress : AuditableEntity
{
    public int Id { get; set; }
    public int AccountProfileId { get; set; }
    public AccountProfile Profile { get; set; } = null!;
    public Address Address { get; set; } = new();
    public bool IsDefaultShipping { get; set; }
    public bool IsDefaultBilling { get; set; }
}
