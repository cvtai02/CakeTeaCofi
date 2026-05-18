# Shipping Module Flow

1. Admin creates or edits product through ProductCatalog API with shipping input.
2. ProductCatalog publishes product write events with shipping sync data.
3. Shipping module creates or updates product and variant shipping records by product id and variant id.
4. ProductCatalog publishes product delete event.
5. Shipping module deletes product and variant shipping records by product id.
6. A caller asks for shipping price with package level, address from, and address to.
7. Shipping calculator returns a hardcoded shipping price.
