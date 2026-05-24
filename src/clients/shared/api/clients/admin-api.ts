import type { IAdminApiClient } from "../contracts/admin";
import { AccountClient } from "./account";
import { ContentClient } from "./content";
import { IdentityClient } from "./identity";
import { InventoryClient } from "./inventory";
import { OrderClient } from "./order";
import { PaymentClient } from "./payment";
import { ProductCatalogClient } from "./productcatalog";
import type { Fetch } from "./shared";
import { ShippingClient } from "./shipping";
import { SystemClient } from "./system";
import { TenantManagementClient } from "./tenantmanagement";

export class AdminApiClient implements IAdminApiClient {
  readonly account: AccountClient;
  readonly content: ContentClient;
  readonly identity: IdentityClient;
  readonly inventory: InventoryClient;
  readonly order: OrderClient;
  readonly payment: PaymentClient;
  readonly productCatalog: ProductCatalogClient;
  readonly shipping: ShippingClient;
  readonly system: SystemClient;
  readonly tenantManagement: TenantManagementClient;

  constructor(fetch: Fetch, apiBaseUrl: string) {
    this.account = new AccountClient(fetch, apiBaseUrl);
    this.content = new ContentClient(fetch, apiBaseUrl);
    this.identity = new IdentityClient(fetch, apiBaseUrl);
    this.inventory = new InventoryClient(fetch, apiBaseUrl);
    this.order = new OrderClient(fetch, apiBaseUrl);
    this.payment = new PaymentClient(fetch, apiBaseUrl);
    this.productCatalog = new ProductCatalogClient(fetch, apiBaseUrl);
    this.shipping = new ShippingClient(fetch, apiBaseUrl);
    this.system = new SystemClient(fetch, apiBaseUrl);
    this.tenantManagement = new TenantManagementClient(fetch, apiBaseUrl);
  }
}
