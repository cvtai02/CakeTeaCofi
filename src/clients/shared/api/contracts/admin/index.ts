import type { IAccountClient } from "../account";
import type { IContentClient } from "../content";
import type { IIdentityClient } from "../identity";
import type { IInventoryClient } from "../inventory";
import type { IOrderClient } from "../order";
import type { IPaymentClient } from "../payment";
import type { IProductCatalogClient } from "../productcatalog";
import type { IShippingClient } from "../shipping";
import type { ISystemClient } from "../system";
import type { ITenantManagementClient } from "../tenantmanagement";

export interface IAdminApiClient {
  account: IAccountClient;
  content: IContentClient;
  identity: IIdentityClient;
  inventory: IInventoryClient;
  order: IOrderClient;
  payment: IPaymentClient;
  productCatalog: IProductCatalogClient;
  shipping: IShippingClient;
  system: ISystemClient;
  tenantManagement: ITenantManagementClient;
}
