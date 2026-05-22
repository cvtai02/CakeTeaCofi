# Address Entity Shape

Claude: update frontend address forms and order checkout payloads to use the new shared address shape. Move this file to `requirements/frontend-handoff/done/` after implementation.

## Changed Shape

Backend order APIs now use `SharedKernel.ValueObjects.Address`.

Use these fields:
- `country: "VN" | "US"`
- `administrativeArea?: string | null`
- `locality?: string | null`
- `subLocality?: string | null`
- `postalCode?: string | null`
- `line1: string`
- `line2?: string | null`
- `ownerName: string`
- `type: string`
- `phoneNumber: string`
- `email: string`

Do not submit old fields:
- `state`
- `city`

## Mapping

For Vietnamese checkout addresses:
- province/city-level selected value -> `administrativeArea`
- district/city-level selected value -> `locality`
- ward/commune-level selected value -> `subLocality`

Use display names for customer-readable address text when useful, but submit stable selected codes or selected names consistently with the current form model.

## Related API

Use `src/clients/shared/api/contracts/shipping.ts`.

Recommended selector flow:
1. `shippingClient.listShippingCountries()`
2. `shippingClient.listShippingAdministrativeAreas({ Country: "VN" })`
3. `shippingClient.listShippingLocalities({ Country: "VN", AdministrativeAreaCode: selectedAdministrativeArea.code })`
4. Skip sublocality for now because `listShippingSubLocalities(...)` returns `501 Not Implemented`.

## Affected Order Contract

`CreateOrderRequest.shippingAddress` and `OrderResponse.shippingAddress` now expose the new address fields through generated shared API types.
