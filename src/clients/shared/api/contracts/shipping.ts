import type {
  ListShippingAdministrativeAreasQuery,
  ListShippingAddressesQuery,
  ListShippingLocalitiesQuery,
  ListShippingSubLocalitiesQuery,
  ProductShippingResponse,
  ShippingAdministrativeAreasResponse,
  ShippingAddressCatalogResponse,
  ShippingCountriesResponse,
  ShippingLocalitiesResponse,
} from "../types/shipping";

export * from "../types/shipping";

export interface IShippingClient {
  // Contract method: listShippingCountries - public country list from SharedKernel CountryCode with next endpoint metadata.
  // Response: src/Modules/Shipping/DTOs/Addresses/ShippingAddressCatalogResponse.cs
  listShippingCountries(): Promise<ShippingCountriesResponse>;

  // Contract method: listShippingAdministrativeAreas - public administrative areas by country.
  // Query: src/Modules/Shipping/DTOs/Addresses/ListShippingAddressesRequest.cs
  // Response: src/Modules/Shipping/DTOs/Addresses/ShippingAddressCatalogResponse.cs
  listShippingAdministrativeAreas(query?: ListShippingAdministrativeAreasQuery): Promise<ShippingAdministrativeAreasResponse>;

  // Contract method: listShippingLocalities - public localities by country and administrative area.
  // Query: src/Modules/Shipping/DTOs/Addresses/ListShippingAddressesRequest.cs
  // Response: src/Modules/Shipping/DTOs/Addresses/ShippingAddressCatalogResponse.cs
  listShippingLocalities(query: ListShippingLocalitiesQuery): Promise<ShippingLocalitiesResponse>;

  // Contract method: listShippingSubLocalities - currently returns 501 Not Implemented.
  // Query: src/Modules/Shipping/DTOs/Addresses/ListShippingAddressesRequest.cs
  listShippingSubLocalities(query: ListShippingSubLocalitiesQuery): Promise<never>;

  // Contract method: listShippingAddresses - public shipping address catalog by country.
  // Query: src/Modules/Shipping/DTOs/Addresses/ListShippingAddressesRequest.cs
  // Response: src/Modules/Shipping/DTOs/Addresses/ShippingAddressCatalogResponse.cs
  listShippingAddresses(query?: ListShippingAddressesQuery): Promise<ShippingAddressCatalogResponse>;

  // Contract method: getProductShipping - read-only product shipping detail for edit prefill.
  // Auth: TenantModeratorUp.
  // Response: src/Modules/Shipping/DTOs/ProductShipping/ProductShippingResponse.cs
  getProductShipping(productId: string): Promise<ProductShippingResponse>;
}
