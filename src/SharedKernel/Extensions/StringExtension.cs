using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace SharedKernel.Extensions;

public static partial class StringExtension
{
    public static string ToSlug(this string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        var normalized = value.Trim()
            .ToLowerInvariant()
            .Replace('đ', 'd')
            .Replace('Đ', 'd')
            .Normalize(NormalizationForm.FormD);

        var builder = new StringBuilder(normalized.Length);
        foreach (var ch in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(ch) != UnicodeCategory.NonSpacingMark)
                builder.Append(ch);
        }

        var ascii = builder.ToString().Normalize(NormalizationForm.FormC);
        var slug = Regex.Replace(ascii, @"[^a-z0-9]+", "-");
        return Regex.Replace(slug, "-{2,}", "-").Trim('-');
    }
}
