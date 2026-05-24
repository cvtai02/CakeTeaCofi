import type { ICustomerApiClient } from "../contracts/customer";
import { AccountClient } from "./account";
import { ContentClient } from "./content";
import { IdentityClient } from "./identity";
import { OrderClient } from "./order";
import { PaymentClient } from "./payment";
import { ProductCatalogClient } from "./productcatalog";
import type { Fetch } from "./shared";
import { ShippingClient } from "./shipping";
import { TenantManagementClient } from "./tenantmanagement";

export class CustomerApiClient implements ICustomerApiClient {
  readonly account: ICustomerApiClient["account"];
  readonly content: ICustomerApiClient["content"];
  readonly identity: ICustomerApiClient["identity"];
  readonly order: ICustomerApiClient["order"];
  readonly payment: ICustomerApiClient["payment"];
  readonly productCatalog: ICustomerApiClient["productCatalog"];
  readonly shipping: ICustomerApiClient["shipping"];
  readonly tenantManagement: ICustomerApiClient["tenantManagement"];

  constructor(fetch: Fetch, apiBaseUrl: string) {
    this.account = new AccountClient(fetch, apiBaseUrl);
    this.content = new ContentClient(fetch, apiBaseUrl);
    this.identity = new IdentityClient(fetch, apiBaseUrl);
    this.order = new OrderClient(fetch, apiBaseUrl);
    this.payment = new PaymentClient(fetch, apiBaseUrl);
    this.productCatalog = new ProductCatalogClient(fetch, apiBaseUrl);
    this.shipping = new ShippingClient(fetch, apiBaseUrl);
    this.tenantManagement = new TenantManagementClient(fetch, apiBaseUrl);
  }
}
