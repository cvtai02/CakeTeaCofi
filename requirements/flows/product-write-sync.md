# Product write sync flow

1. Admin creates product through ProductCatalog API with catalog, inventory, and shipping input.
2. ProductCatalog saves catalog data.
3. ProductCatalog publishes `ProductCreated` with inventory and shipping sync data.
4. Inventory creates product/variant inventory from the event.
5. Shipping creates product/variant shipping from the event.
6. Admin updates product through ProductCatalog API with catalog, inventory, and shipping input.
7. ProductCatalog saves catalog data and publishes `ProductUpdated`.
8. Inventory and Shipping update their product/variant records from the event.
9. Admin deletes product through ProductCatalog API.
10. ProductCatalog deletes catalog data and publishes `ProductDeleted`.
11. Inventory and Shipping delete their product/variant records from the event.
