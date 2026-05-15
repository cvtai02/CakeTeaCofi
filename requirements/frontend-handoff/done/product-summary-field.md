# Product Summary Field

## Goal

Add a short `summary` field to product create/edit forms and product display surfaces.

## Backend Contract

`summary` is now part of ProductCatalog product contracts.

Create/update request:

```ts
export type CreateProductRequest = JsonRequestBody<CreateProductOperation> & {
    summary?: string | null;
};

export type UpdateProductRequest = CreateProductRequest;
```

Admin product detail response:

```ts
export type ProductResponse = Omit<GeneratedProductResponse, "id" | "variants" | "lowestPrice" | "highestPrice"> & {
    id: string;
    summary: string;
    lowestPrice: number;
    highestPrice: number;
    variants: VariantResponse[];
};
```

Admin product list item:

```ts
export type ProductSummaryResponse = {
    id: string;
    name: string;
    summary: string;
    slug: string;
    imageUrl: string;
    status: ProductResponse["status"];
    categoryId: number;
    categoryName: string;
    price: number;
    lowestPrice: number;
    highestPrice: number;
    currency: ProductResponse["currency"];
    stock: number;
    sold: number;
    created: string;
    lastModified: string;
};
```

Customer product list/detail summary:

```ts
export type CustomerProductSummaryResponse = {
    id: string;
    name: string;
    summary: string;
    slug: string;
    imageUrl: string;
    categoryId: number;
    categoryName: string;
    price: number;
    lowestPrice: number;
    highestPrice: number;
    currency: ProductResponse["currency"];
};
```

`CustomerProductResponse` inherits `summary` from `CustomerProductSummaryResponse`.

## Validation

- Max length: 500 characters.
- Missing/null summary should be treated as empty string in the UI.
- Keep `description` as the long-form body.
- Use `summary` for product cards, list previews, and short intro text near product title.

## Client Files

Use shared types/client from:

```txt
src/clients/shared/api/types/productcatalog.ts
src/clients/shared/api/contracts/productcatalog.ts
src/clients/shared/api/clients/productcatalog.ts
```

## Frontend Notes

- Add a short summary input to add-product and edit-product pages.
- On edit, load and preserve existing `summary`.
- On submit, include `summary` in create/update payloads.
- Product cards can render `summary` instead of trimming `description`.
- Move this handoff to `requirements/frontend-handoff/done/` after implementation.

