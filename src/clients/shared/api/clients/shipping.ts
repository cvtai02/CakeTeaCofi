import type {
  ProductShippingResponse,
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

  async getProductShipping(productId: string): Promise<ProductShippingResponse> {
    const response = await this.fetch(`${this.apiBaseUrl}/api/Shipping/products/${encodeURIComponent(productId)}`);
    if (!response.ok) throw await this.readError(response);
    return await response.json();
  }

  private async readError(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return await response.json();
    }

    return new Error(await response.text());
  }
}
