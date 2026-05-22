# Shipping Address Catalog

1. Client requests countries.
2. API returns country codes from SharedKernel and marks which countries are supported for shipping address lookup.
3. Client selects a supported country and calls the returned administrative-area endpoint.
4. API returns administrative areas for the country and includes the locality endpoint template.
5. Client selects an administrative area and calls the locality endpoint.
6. API returns localities and includes the sublocality endpoint template.
7. Sublocality lookup exists as an endpoint but currently returns not implemented.
