using SharedKernel.ValueObjects;

namespace Account.DTOs.AccountAddresses;

public class SaveAccountAddressRequest
{
    public Address Address { get; set; } = new();
    public bool IsDefaultShipping { get; set; }
    public bool IsDefaultBilling { get; set; }
}
