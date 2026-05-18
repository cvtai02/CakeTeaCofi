# Product write sync frontend handoff

Claude: update add-product/edit-product/delete-product flows to use ProductCatalog as the only write API for product creation, update, and deletion. Move this file to `requirements/frontend-handoff/done/` after implementation.

## Client methods

Use `src/clients/shared/api/contracts/productcatalog.ts`:

- `ProductCatalogClient.createProduct(input)`
- `ProductCatalogClient.updateProduct(id, input)`
- `ProductCatalogClient.deleteProduct(id)`

Do not call Inventory or Shipping write APIs from add/edit/delete product submit flows. Backend now publishes `ProductCreated`, `ProductUpdated`, and `ProductDeleted`; Inventory and Shipping sync themselves from those events.

## Create/update request fields

`CreateProductRequest` / `UpdateProductRequest` now include catalog, inventory, and shipping input in one payload.

Product-level inventory:

```ts
trackInventory?: boolean;
allowBackorder?: boolean;
lowStockThreshold?: number;
stock?: number;
```

Product-level shipping:

```ts
physicalProduct?: boolean;
weight?: number;
width?: number;
height?: number;
length?: number;
```

Variant-level inventory and shipping:

```ts
variants?: Array<{
  id?: string | null;
  useProductPricing?: boolean;
  price?: number | null;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  chargeTax?: boolean | null;
  imageKey?: string | null;
  useProductInventory?: boolean;
  quantity?: number;
  trackInventory?: boolean | null;
  allowBackorder?: boolean | null;
  useProductShipping?: boolean;
  physicalProduct?: boolean | null;
  weight?: number | null;
  width?: number | null;
  height?: number | null;
  length?: number | null;
  optionValues?: Array<{
    optionId?: number | null;
    optionName: string;
    value: string;
  }>;
}>;
```

`packageLevel` is calculated by the backend from shipping dimensions. Do not send it.

## Delete flow

Call only:

```ts
await productCatalogClient.deleteProduct(productId);
```

Do not call `InventoryClient.deleteProductInventory` or `ShippingClient` delete from the product delete flow.

## Reading existing shipping data

If the edit page needs to prefill existing shipping fields and ProductCatalog response does not contain them, read `GET /api/Shipping/products/{productId}` through `ShippingClient.getProductShipping(productId)`. This is read-only; submit still goes through `ProductCatalogClient.updateProduct`.
