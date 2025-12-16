# Database Migrations

## Quick Start - Add Lawyer Specializations

### Option 1: Run Node.js Script (Recommended)

```bash
cd eylsbackend
node run-migration.js
```

This will:
- ✅ Check if the column already exists
- ✅ Add the `specializations` column if needed
- ✅ Verify the migration was successful
- ✅ Show you the column details

### Option 2: Run SQL Directly

**Using MySQL CLI:**
```bash
mysql -u your_username -p your_database_name < migrations/add_lawyer_specializations.sql
```

**Using MySQL Command Line:**
```sql
USE your_database_name;
source migrations/add_lawyer_specializations.sql;
```

**Using phpMyAdmin:**
1. Open phpMyAdmin
2. Select your database
3. Go to SQL tab
4. Paste the contents of `add_lawyer_specializations.sql`
5. Click "Go"

---

## What This Migration Does

Adds a new column to the `users` table:

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS specializations JSON DEFAULT NULL 
COMMENT 'Array of case type IDs for lawyer specializations';
```

This column stores case type IDs that a lawyer specializes in, for example:
```json
["criminal-case-uuid", "family-law-uuid", "commercial-law-uuid"]
```

---

## After Running Migration

1. **Restart your backend server:**
   ```bash
   npm run dev
   ```

2. **Test the feature:**
   - Open User Management
   - Create/Edit a lawyer
   - Select case type specializations
   - Save and verify

3. **Verify in database:**
   ```sql
   SELECT id, name, role, specializations 
   FROM users 
   WHERE role = 'lawyer';
   ```

---

## Troubleshooting

### "Column already exists" error
✅ This is fine! The migration is safe to run multiple times.

### "Access denied" error
Check your database credentials in `.env` file.

### "Unknown database" error
Verify the database name in your `.env` file matches your actual database.

---

## Migration Files

- `add_client_extended_fields.sql` - Adds extended client fields
- `add_lawyer_specializations.sql` - Adds lawyer specializations (NEW)

---

**Last Updated:** December 12, 2024
