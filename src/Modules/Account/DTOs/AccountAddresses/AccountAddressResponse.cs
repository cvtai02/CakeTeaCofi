using SharedKernel.ValueObjects;

namespace Account.DTOs.AccountAddresses;

public class AccountAddressResponse
{
    public int Id { get; set; }
    public int AccountProfileId { get; set; }
    public Address Address { get; set; } = new();
    public bool IsDefaultShipping { get; set; }
    public bool IsDefaultBilling { get; set; }
}
