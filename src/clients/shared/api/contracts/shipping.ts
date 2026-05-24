import type {
  ListShippingAdministrativeAreasQuery,
  ListShippingAddressesQuery,
  ListShippingLocalitiesQuery,
  ListShippingSubLocalitiesQuery,
  ShippingSubLocalitiesResponse,
  CreateShippingQuoteRequest,
  CreateShippingQuoteResponse,
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

  // Contract method: listShippingSubLocalities - public sublocalities by country, administrative area, and locality.
  // Query: src/Modules/Shipping/DTOs/Addresses/ListShippingAddressesRequest.cs
  // Response: src/Modules/Shipping/DTOs/Addresses/ShippingAddressCatalogResponse.cs
  listShippingSubLocalities(query: ListShippingSubLocalitiesQuery): Promise<ShippingSubLocalitiesResponse>;

  // Contract method: listShippingAddresses - public shipping address catalog by country.
  // Query: src/Modules/Shipping/DTOs/Addresses/ListShippingAddressesRequest.cs
  // Response: src/Modules/Shipping/DTOs/Addresses/ShippingAddressCatalogResponse.cs
  listShippingAddresses(query?: ListShippingAddressesQuery): Promise<ShippingAddressCatalogResponse>;

  // Contract method: getProductShipping - read-only product shipping detail for edit prefill.
  // Auth: TenantModeratorUp.
  // Response: src/Modules/Shipping/DTOs/ProductShipping/ProductShippingResponse.cs
  getProductShipping(productId: string): Promise<ProductShippingResponse>;

  // Contract method: createShippingQuote - public package-level quote for selected variants.
  // Request: src/Modules/Shipping/DTOs/Quotes/CreateShippingQuoteRequest.cs
  // Response: src/Modules/Shipping/DTOs/Quotes/ShippingQuoteResponse.cs
  createShippingQuote(input: CreateShippingQuoteRequest): Promise<CreateShippingQuoteResponse>;
}
