using Microsoft.EntityFrameworkCore;
using SharedKernel.EnumsConstants;

namespace SharedKernel.ValueObjects;

[Owned]
public class Address 
{
    public string OwnerName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Home, Work, etc.
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public CountryCode Country { get; set; } = CountryCode.VN;
    public string? AdministrativeArea { get; set; } // State / Province / Region
    public string? Locality { get; set; }           // City / District
    public string? SubLocality { get; set; }        // Ward / Commune
    public string? PostalCode { get; set; }
    public string Line1 { get; set; } = null!;
    public string? Line2 { get; set; } = string.Empty;
}

