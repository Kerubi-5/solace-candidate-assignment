# Discussion Notes

## PostgreSQL 18+ Migration

The Docker container kept restarting because PostgreSQL 18+ changed how it stores data. Instead of using `/var/lib/postgresql/data`, it now uses version-specific directories like `/var/lib/postgresql/18/data`.

Fixed by:

- Changed the volume mount in `docker-compose.yml` from `/var/lib/postgresql/data` to `/var/lib/postgresql`
- Removed the old volume with `docker compose down -v`
- Restarted the container

## Architecture Decisions

**Zod for DTOs**

Added Zod schemas for runtime validation of API requests/responses. TypeScript types are inferred from Zod schemas, so we get both type safety and runtime validation.

**React Query for data fetching**

Using React Query (TanStack Query) instead of useEffect for data fetching. Handles caching, loading states, and error handling automatically.

**use-debounce for debounce functionality**

Added `use-debounce` library to replace manual debounce implementation. Simplifies the code by removing the dual state pattern (searchTerm and debouncedSearchTerm) and provides a single source of truth with `useDebouncedValue` hook. This reduces complexity and potential bugs from manual timer management.

**Future Optimizations: Database Indexes**

For production with large datasets (hundreds of thousands of records), we should add database indexes on searchable fields:

- **B-tree indexes** on `firstName`, `lastName`, `city`, and `degree` columns for faster ILIKE queries
- **GIN index** on `specialties` JSONB column for efficient JSONB array searches
- **PostgreSQL full-text search** (tsvector) as an alternative to ILIKE for better search performance
