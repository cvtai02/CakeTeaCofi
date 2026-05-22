# Account Address Uses Shared Address

1. User creates or updates a saved account address.
2. API validates the nested shared address object.
3. Account stores the address as an owned `Address` value object.
4. Existing address data is preserved by renaming `State` to `AdministrativeArea` and `City` to `Locality`.
5. API returns saved addresses with address fields nested under `address`.
