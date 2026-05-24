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
import type { IShippingClient } from "../contracts/shipping";
import type { Fetch } from "./shared";

export class ShippingClient implements IShippingClient {
  private readonly fetch: Fetch;
  private readonly apiBaseUrl: string;

  constructor(fetch: Fetch, apiBaseUrl: string) {
    this.fetch = fetch;
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, "");
  }

  async listShippingCountries(): Promise<ShippingCountriesResponse> {
    const response = await this.fetch(`${this.apiBaseUrl}/api/Shipping/addresses/countries`);
    if (!response.ok) throw await this.readError(response);
    return await response.json();
  }

  async listShippingAdministrativeAreas(query?: ListShippingAdministrativeAreasQuery): Promise<ShippingAdministrativeAreasResponse> {
    const response = await this.fetch(`${this.apiBaseUrl}/api/Shipping/addresses/administrative-areas${this.toQueryString(query)}`);
    if (!response.ok) throw await this.readError(response);
    return await response.json();
  }

  async listShippingLocalities(query: ListShippingLocalitiesQuery): Promise<ShippingLocalitiesResponse> {
    const response = await this.fetch(`${this.apiBaseUrl}/api/Shipping/addresses/localities${this.toQueryString(query)}`);
    if (!response.ok) throw await this.readError(response);
    return await response.json();
  }

  async listShippingSubLocalities(query: ListShippingSubLocalitiesQuery): Promise<ShippingSubLocalitiesResponse> {
    const response = await this.fetch(`${this.apiBaseUrl}/api/Shipping/addresses/sublocalities${this.toQueryString(query)}`);
    if (!response.ok) throw await this.readError(response);
    return await response.json();
  }

  async listShippingAddresses(query?: ListShippingAddressesQuery): Promise<ShippingAddressCatalogResponse> {
    const response = await this.fetch(`${this.apiBaseUrl}/api/Shipping/addresses${this.toQueryString(query)}`);
    if (!response.ok) throw await this.readError(response);
    return await response.json();
  }

  async getProductShipping(productId: string): Promise<ProductShippingResponse> {
    const response = await this.fetch(`${this.apiBaseUrl}/api/Shipping/products/${encodeURIComponent(productId)}`);
    if (!response.ok) throw await this.readError(response);
    return await response.json();
  }

  async createShippingQuote(input: CreateShippingQuoteRequest): Promise<CreateShippingQuoteResponse> {
    const response = await this.fetch(`${this.apiBaseUrl}/api/Shipping/quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw await this.readError(response);
    return await response.json();
  }

  private toQueryString(query?: object): string {
    if (!query) {
      return "";
    }

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    }

    const value = params.toString();
    return value ? `?${value}` : "";
  }

  private async readError(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return await response.json();
    }

    return new Error(await response.text());
  }
}
