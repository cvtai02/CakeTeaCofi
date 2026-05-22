# Import And Delete Content Files

1. Admin lists unused object-storage files.
2. Admin imports selected unused keys when they should become managed content files.
3. API reads object metadata from storage and creates missing `Content.Files` rows.
4. Admin can delete registered content files by selected keys.
5. API checks selected registered keys against media usage checkers.
6. If any selected key is referenced, API rejects deletion.
7. API deletes unreferenced registered files from storage and `Content.Files`.
