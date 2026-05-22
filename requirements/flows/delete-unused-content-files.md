# Delete Unused Content Files

1. Admin lists unused object-storage files.
2. Admin selects unused file keys to delete.
3. API re-checks the selected keys against `Content.Files`.
4. If any selected key is now registered, API returns validation error and deletes nothing.
5. API deletes still-unused keys from object storage.
6. API returns deleted count and deleted keys.
