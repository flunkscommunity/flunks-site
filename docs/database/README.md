# Database Documentation

This directory contains all SQL scripts and database documentation.

## Directory Structure

### 📋 `/tables/` - Table Creation Scripts
Scripts to create database tables from scratch.
- User-related tables
- Game tracking tables
- Transaction tables
- Achievement tables

### 🔄 `/migrations/` - Migration Scripts
Scripts to update existing database schema or data.
- Setup scripts for new features
- Update scripts for schema changes
- Retroactive data migrations
- Schema modifications

### 🔍 `/queries/` - Query Scripts
Verification and reporting queries.
- Verification queries
- Check scripts
- Data inspection queries
- Reporting queries

### 🧪 `/testing/` - Testing Utilities
Scripts for testing and development.
- Clear cooldown scripts
- Remove constraint scripts
- Data cleanup utilities
- Test data generation

## How to Use

### Creating New Tables
1. Find the appropriate script in `/tables/`
2. Review the schema
3. Run in your database tool (Supabase, pgAdmin, etc.)
4. Verify with a query from `/queries/`

### Running Migrations
1. **Backup your data first!**
2. Read the migration script completely
3. Run in a test environment first if possible
4. Execute in production
5. Verify with appropriate queries

### Testing Queries
1. Use scripts from `/queries/` to verify data
2. Run check scripts before and after changes
3. Keep queries for documentation

## Important Notes

⚠️ **These are NOT imported by the application**
- These are manual scripts for database management
- Your app queries the live database via API routes
- Moving these files doesn't affect runtime functionality

📝 **Always Test First**
- Run migrations on test database first
- Verify data integrity after changes
- Keep backups before major changes

## Common Tasks

### Add a new feature table
1. Create script in `/tables/`
2. Add migration script in `/migrations/`
3. Add verification query in `/queries/`
4. Document in feature docs

### Verify data integrity
1. Use queries from `/queries/`
2. Check migration results
3. Compare before/after states

### Clean test data
1. Use scripts from `/testing/`
2. Reset cooldowns, constraints, etc.
3. Never run these in production!
