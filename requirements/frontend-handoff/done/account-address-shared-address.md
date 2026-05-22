# Account Address Shared Address Shape

Claude: update saved account address forms to use the nested shared address object. Move this file to `requirements/frontend-handoff/done/` after implementation.

## API Client

Use `src/clients/shared/api/contracts/account.ts`.

Methods:
- `accountClient.listMyAddresses()`
- `accountClient.createMyAddress(input)`
- `accountClient.updateMyAddress(id, input)`
- `accountClient.deleteMyAddress(id)`

## Request Shape

`SaveAccountAddressRequest` now uses:
- `address: Address`
- `isDefaultShipping: boolean`
- `isDefaultBilling: boolean`

`Address` fields:
- `ownerName: string`
- `type: string`
- `phoneNumber: string`
- `email: string`
- `country: "VN" | "US"`
- `administrativeArea?: string | null`
- `locality?: string | null`
- `subLocality?: string | null`
- `postalCode?: string | null`
- `line1: string`
- `line2?: string | null`

Do not submit old flat fields on the root request:
- `ownerName`
- `phoneNumber`
- `country`
- `state`
- `city`
- `postalCode`
- `line1`
- `line2`

## Response Shape

`AccountAddressResponse` now returns:
- `id: number`
- `accountProfileId: number`
- `address: Address`
- `isDefaultShipping: boolean`
- `isDefaultBilling: boolean`

Read display values from `response.address`.

## Address Mapping

For Vietnamese address selectors:
- province/city-level selected value -> `address.administrativeArea`
- district/city-level selected value -> `address.locality`
- ward/commune-level selected value -> `address.subLocality`

Use the Shipping address catalog client from `src/clients/shared/api/contracts/shipping.ts` for cascading address selectors.
