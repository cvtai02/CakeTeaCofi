# Customer Product — Expose Shipping Info

Status: resolved by Codex.

## Goal

Add shipping fields to `CustomerProductResponse` so the storefront product detail page can display relevant shipping information.

## Fields to Add

Add the following fields to `CustomerProductResponse` in `src/Modules/ProductCatalog/DTOs/Products/CustomerProductResponse.cs`:

```csharp
public bool PhysicalProduct { get; set; }
public float Weight { get; set; }
public float Width { get; set; }
public float Height { get; set; }
public float Length { get; set; }
```

These already exist on the admin `ProductResponse` — this is just a mapping extension to the customer DTO.

## Frontend Contract

Update `CustomerProductResponse` in `src/clients/shared/api/types/productcatalog.ts`:

```ts
export type CustomerProductResponse = CustomerProductSummaryResponse & {
    description: string;
    compareAtPrice: number;
    physicalProduct: boolean;
    weight: number;
    width: number;
    height: number;
    length: number;
    medias: ProductResponse["medias"];
    options: ProductResponse["options"];
    variants: CustomerVariantResponse[];
};
```

## Notes

- `physicalProduct: false` → digital product, no shipping UI needed.
- If `physicalProduct: true` and weight/dimensions are 0, show generic shipping message without specifics.
- Move this handoff to `requirements/frontend-handoff/done/` after backend ships the fields.
