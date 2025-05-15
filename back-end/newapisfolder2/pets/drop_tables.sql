-- Drop foreign key constraints first
DECLARE @sql NVARCHAR(MAX) = N'';

SELECT @sql += N'
ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
    + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + 
    ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
FROM sys.foreign_keys;

EXEC sp_executesql @sql;

-- Drop tables
DROP TABLE IF EXISTS [Messages];
DROP TABLE IF EXISTS [Conversations];
DROP TABLE IF EXISTS [AdoptionRequests];
DROP TABLE IF EXISTS [Pets];
DROP TABLE IF EXISTS [PetCategories];
DROP TABLE IF EXISTS [SupportIssue];
DROP TABLE IF EXISTS [Users];
DROP TABLE IF EXISTS [Shelters];
DROP TABLE IF EXISTS [__EFMigrationsHistory]; 