# Gallery Hero Key

## Goal

Use the corrected public gallery key `hero` for storefront hero gallery display.

## Backend Contract

Public endpoint:

```txt
GET /api/Content/galleries/{key}
```

Use:

```txt
GET /api/Content/galleries/hero
```

Shared client:

```ts
contentClient.getPublicGalleryByKey("hero")
```

## Notes

- The old typo key was `herro`.
- Backend now allows admin gallery update to change `key`.
- Gallery item `displayOrder` is normalized to zero-based contiguous order on create/update.
- `best-seller` gallery had two product links to deleted products; those items should be gone after backend data refresh.
- Move this handoff to `requirements/frontend-handoff/done/` after implementation.

