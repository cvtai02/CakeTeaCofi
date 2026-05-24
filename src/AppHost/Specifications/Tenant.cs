using SharedKernel.Abstractions.Services;
using SharedKernel.EnumsConstants;

namespace AppHost.Specifications;

public class Tenant : ITenant
{
    // Keeps non-HTTP scopes on the legacy tenant until background work is made tenant-aware.
    public int Id { get; private set; } = 1;
    public string Name { get; private set; } = "Thanh";
    public string Signature { get; private set; } = "thanh";
    public string Domain { get; private set; } = "nekomin.com";
    public string CdnBaseUrl { get; private set; } = "https://cdn-thanh.nekomin.com";
    public CountryCode CountryCode { get; private set; } = CountryCode.VN;

    public void Set(
        int id,
        string name,
        string signature,
        string domain,
        string cdnBaseUrl,
        CountryCode countryCode)
    {
        Id = id;
        Name = name;
        Signature = signature;
        Domain = domain;
        CdnBaseUrl = cdnBaseUrl;
        CountryCode = countryCode;
    }
}
