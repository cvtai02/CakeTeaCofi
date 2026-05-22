using Account.DTOs.AccountAddresses;
using Account.Core.Entities;
using SharedKernel.EnumsConstants;
using SharedKernel.Exceptions;
using SharedKernel.ValueObjects;

namespace Account.Core.Usecases;

public static class AccountAddressWriter
{
    public static void Apply(AccountAddress address, SaveAccountAddressRequest request)
    {
        Validate(request);

        address.Address = NormalizeAddress(request.Address);
        address.IsDefaultShipping = request.IsDefaultShipping;
        address.IsDefaultBilling = request.IsDefaultBilling;
    }

    private static void Validate(SaveAccountAddressRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (request is null)
        {
            errors["request"] = ["Request body is required."];
        }
        else
        {
            if (request.Address is null)
            {
                errors[nameof(request.Address)] = ["Address is required."];
            }
            else
            {
                if (string.IsNullOrWhiteSpace(request.Address.OwnerName))
                    errors[$"{nameof(request.Address)}.{nameof(Address.OwnerName)}"] = ["Owner name is required."];

                if (string.IsNullOrWhiteSpace(request.Address.PhoneNumber))
                    errors[$"{nameof(request.Address)}.{nameof(Address.PhoneNumber)}"] = ["Phone number is required."];

                if (!Enum.IsDefined(request.Address.Country))
                    errors[$"{nameof(request.Address)}.{nameof(Address.Country)}"] = ["Country is invalid."];

                if (string.IsNullOrWhiteSpace(request.Address.Line1))
                    errors[$"{nameof(request.Address)}.{nameof(Address.Line1)}"] = ["Address line 1 is required."];
            }
        }

        if (errors.Count > 0)
        {
            throw new ValidationException("Validation failed", errors);
        }
    }

    private static Address NormalizeAddress(Address address) => new()
    {
        OwnerName = Normalize(address.OwnerName),
        Type = Normalize(address.Type),
        PhoneNumber = Normalize(address.PhoneNumber),
        Email = Normalize(address.Email),
        Country = Enum.IsDefined(address.Country) ? address.Country : CountryCode.VN,
        AdministrativeArea = NormalizeNullable(address.AdministrativeArea),
        Locality = NormalizeNullable(address.Locality),
        SubLocality = NormalizeNullable(address.SubLocality),
        PostalCode = NormalizeNullable(address.PostalCode),
        Line1 = Normalize(address.Line1),
        Line2 = NormalizeNullable(address.Line2)
    };

    private static string Normalize(string? value) => value?.Trim() ?? string.Empty;
    private static string? NormalizeNullable(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
