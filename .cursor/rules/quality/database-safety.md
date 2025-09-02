# Database Safety Rules

## 🚨 CRITICAL: Never Reset Production Data

### Forbidden Commands

**NEVER** suggest or execute these commands that could reset or destroy database data:

- `npx supabase db reset` - Resets entire database
- `npx supabase db push --force` - Force pushes schema changes
- `DROP DATABASE` - Destroys database
- `TRUNCATE TABLE` - Removes all data from tables
- `DELETE FROM table_name` without WHERE clause - Removes all rows

### Safe Alternatives

When you need to modify database structure or add data, use these safe methods:

#### 1. **Schema Changes**
- Use Prisma migrations: `npx prisma migrate dev`
- Use Supabase migrations: `npx supabase migration new`
- Always test migrations on development first

#### 2. **Adding Seed Data**
- Create SQL scripts with `INSERT` statements
- Use `ON CONFLICT DO NOTHING` to prevent duplicates
- Run scripts through Supabase Dashboard SQL Editor
- Use Node.js scripts with Supabase client

#### 3. **Data Updates**
- Use `UPDATE` with specific `WHERE` clauses
- Always backup before bulk operations
- Test on development environment first

#### 4. **Safe Database Operations**

```sql
-- ✅ SAFE: Insert with conflict handling
INSERT INTO table_name (column1, column2) 
VALUES ('value1', 'value2') 
ON CONFLICT (unique_column) DO NOTHING;

-- ✅ SAFE: Update specific records
UPDATE table_name 
SET column1 = 'new_value' 
WHERE id = 'specific_id';

-- ✅ SAFE: Add new columns
ALTER TABLE table_name 
ADD COLUMN new_column_name data_type;
```

#### 5. **Recommended Workflow**

1. **Development First**: Always test changes on development environment
2. **Backup**: Create database backups before major changes
3. **Migration Scripts**: Use proper migration scripts for schema changes
4. **Supabase Dashboard**: Use the web interface for safe data operations
5. **Incremental Changes**: Make small, incremental changes rather than large operations

### Emergency Procedures

If you accidentally suggest a dangerous command:

1. **Immediately stop** the operation
2. **Check if it was executed** on production
3. **Contact the user** to verify data status
4. **Suggest recovery options** if data was lost
5. **Document the incident** to prevent future occurrences

### Data Integrity Checks

Before suggesting any database operation:

- ✅ Does it preserve existing data?
- ✅ Does it have proper error handling?
- ✅ Is it tested on development first?
- ✅ Does it use safe SQL patterns?
- ✅ Does it include conflict resolution?

### Communication Guidelines

When suggesting database operations:

1. **Always warn** about potential data loss
2. **Explain the impact** of the operation
3. **Provide alternatives** if available
4. **Ask for confirmation** before proceeding
5. **Suggest testing** on development first

Remember: **Data is precious and irreplaceable**. When in doubt, choose the safer option.
