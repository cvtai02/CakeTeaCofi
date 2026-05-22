# Shipping Address Catalog API

Claude: use these APIs for cascading address selectors. Move this file to `requirements/frontend-handoff/done/` after implementation.

## API Client

Use `src/clients/shared/api/contracts/shipping.ts`.

## Flow

1. Call `shippingClient.listShippingCountries()`.
2. Let the customer select a supported country.
3. Call `shippingClient.listShippingAdministrativeAreas({ Country: "VN" })`.
4. Let the customer select an administrative area.
5. Call `shippingClient.listShippingLocalities({ Country: "VN", AdministrativeAreaCode: selected.code })`.
6. Sublocality has an endpoint but currently returns `501 Not Implemented`; do not require it in UI yet.

## Methods

`listShippingCountries()`

Endpoint: `GET /api/Shipping/addresses/countries`

Response: `ShippingCountriesResponse`

Properties:
- `currentAdministrativeLevel: string`
- `nextAdministrativeLevel: string | null`
- `nextEndpoint: string | null`
- `countries: ShippingCountryResponse[]`

Country item:
- `code: "VN" | "US"`
- `name: string`
- `displayName: string`
- `isSupported: boolean`
- `nextAdministrativeLevel: string | null`
- `nextEndpoint: string | null`

`listShippingAdministrativeAreas(query?)`

Endpoint: `GET /api/Shipping/addresses/administrative-areas`

Query:
- `Country?: "VN" | "US"`

Response: `ShippingAdministrativeAreasResponse`

Properties:
- `country: "VN" | "US"`
- `currentAdministrativeLevel: string`
- `nextAdministrativeLevel: string | null`
- `nextEndpointTemplate: string | null`
- `administrativeAreas: ShippingAdministrativeAreaResponse[]`

Administrative area item:
- `code: string`
- `name: string`
- `type: string`
- `region: string`
- `displayName: string`
- `nextAdministrativeLevel: string | null`
- `nextEndpoint: string | null`

`listShippingLocalities(query)`

Endpoint: `GET /api/Shipping/addresses/localities`

Query:
- `Country?: "VN" | "US"`
- `AdministrativeAreaCode: string`

Response: `ShippingLocalitiesResponse`

Properties:
- `country: "VN" | "US"`
- `administrativeAreaCode: string`
- `currentAdministrativeLevel: string`
- `nextAdministrativeLevel: string | null`
- `nextEndpointTemplate: string | null`
- `localities: ShippingLocalityResponse[]`

Locality item:
- `code: string`
- `name: string`
- `type: string`
- `displayName: string`
- `nextAdministrativeLevel: string | null`
- `nextEndpoint: string | null`

`listShippingSubLocalities(query)`

Endpoint: `GET /api/Shipping/addresses/sublocalities`

Behavior: currently returns `501 Not Implemented`.

## Notes

Only `CountryCode.VN` is supported for address lookup. `US` appears because countries come from SharedKernel `CountryCode`, but `isSupported` is `false`.

The old `shippingClient.listShippingAddresses(query?)` remains as a compatibility alias for the administrative-area/province list.
