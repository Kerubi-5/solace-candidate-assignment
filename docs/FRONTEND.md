# Frontend Architecture Guide

This document outlines the frontend architecture, conventions, and best practices for this Next.js application.

## Table of Contents

- [Overview](#overview)
- [Component Structure](#component-structure)
- [Components](#components)
- [Pages](#pages)
- [Hooks](#hooks)
- [Data-Access Layer](#data-access-layer)
- [Types](#types)
- [Best Practices](#best-practices)

---

## Overview

The frontend architecture handles all UI components, state management, and user interactions. It is organized in `src/` with clear separation between UI, data fetching, and utilities.

**Key Components:**

- **Components (`src/components/`)**: Reusable UI components
- **Pages (`src/app/`)**: Next.js App Router pages
- **Hooks (`src/hooks/`)**: Custom React hooks with React Query
- **Data-Access (`src/data-access/`)**: API client layer
- **Types (`src/types/`)**: Frontend TypeScript types

---

## Component Structure

The frontend is organized in `src/` with the following structure:

```
src/
├── app/           # Next.js App Router pages
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── data-access/   # API client and data fetching logic
├── lib/           # Utility libraries (React Query, etc.)
└── types/         # Frontend TypeScript types
```

**Benefits of Frontend Structure:**

- Clear separation between UI, data fetching, and utilities
- Reusable components and hooks
- Centralized data access layer
- Type safety throughout

---

## Components

**Location:** `src/components/`

**Purpose:** Reusable UI components that can be shared across pages.

**Conventions:**

- Use PascalCase for component names (e.g., `AdvocateCard.tsx`)
- Create subdirectories for complex components with related files
- Keep components focused and single-purpose
- Accept props with proper TypeScript types
- Use Tailwind CSS for styling

**Example:**

```typescript
// src/components/AdvocateCard.tsx
import type { Advocate } from '@/types/advocate';

interface AdvocateCardProps {
  advocate: Advocate;
  onSelect?: (advocate: Advocate) => void;
}

export function AdvocateCard({ advocate, onSelect }: AdvocateCardProps) {
  return (
    <div className="border rounded p-4">
      <h3 className="font-bold">{advocate.firstName} {advocate.lastName}</h3>
      <p>{advocate.city}</p>
      {onSelect && (
        <button onClick={() => onSelect(advocate)}>Select</button>
      )}
    </div>
  );
}
```

**When to use:**

- Create reusable UI elements
- Extract common patterns from pages
- Build component libraries

---

## Pages

**Location:** `src/app/`

**Purpose:** Next.js App Router pages that represent routes in the application.

**Conventions:**

- Follow Next.js App Router file conventions (`page.tsx`, `layout.tsx`)
- Pages should be thin - delegate logic to hooks and components
- Use `'use client'` directive for client components
- Keep pages focused on composition and routing
- Handle loading and error states

**Example:**

```typescript
// src/app/page.tsx
'use client';

import { useAdvocates } from '@/hooks/useAdvocates';

export default function Home() {
  const { data: advocates, isLoading, error } = useAdvocates();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Advocates</h1>
      {advocates?.map((advocate) => (
        <div key={advocate.id}>{advocate.firstName}</div>
      ))}
    </div>
  );
}
```

**When to use:**

- Define application routes
- Compose components and hooks
- Handle page-level state

---

## Hooks

**Location:** `src/hooks/`

**Purpose:** Custom React hooks for state management, data fetching, and business logic. Uses React Query for data fetching.

**Conventions:**

- Name hooks with `use` prefix (e.g., `useAdvocates.ts`)
- Hooks should be focused on a single concern
- Use React Query for data fetching
- Use the data-access layer for API calls
- Return consistent interfaces (data, loading, error states)
- Define query keys for cache management

**Example:**

```typescript
// src/hooks/useAdvocates.ts
import { useQuery } from '@tanstack/react-query';
import { advocatesApi } from '@/data-access/advocates.api';

export const advocatesQueryKeys = {
  all: ['advocates'] as const,
  lists: () => [...advocatesQueryKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...advocatesQueryKeys.lists(), filters] as const,
  details: () => [...advocatesQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...advocatesQueryKeys.details(), id] as const,
};

export function useAdvocates() {
  return useQuery({
    queryKey: advocatesQueryKeys.lists(),
    queryFn: () => advocatesApi.getAll(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**When to use:**

- Encapsulate data fetching logic
- Manage component state
- Create reusable stateful logic

---

## Data-Access Layer

**Location:** `src/data-access/`

**Purpose:** API client layer that handles all communication with the backend. Abstracts HTTP requests and provides typed interfaces.

**Conventions:**

- Name files with `.api.ts` suffix (e.g., `advocates.api.ts`)
- Use `Api` suffix for classes/objects (e.g., `advocatesApi`)
- Export functions or objects with resource-specific methods
- Handle errors consistently
- Return typed responses matching DTOs
- Never call `fetch` directly from components or hooks

**Example:**

```typescript
// src/data-access/advocates.api.ts
import type { GetAdvocatesResponseDto } from '@/server/advocates/dto/dto';
import type { Advocate } from '@/types/advocate';

class AdvocatesApi {
  private readonly baseUrl = '/api/advocates';

  async getAll(): Promise<Advocate[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch advocates: ${response.statusText}`);
      }

      const data: GetAdvocatesResponseDto = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching advocates:', error);
      throw error instanceof Error
        ? error
        : new Error('Failed to fetch advocates');
    }
  }
}

export const advocatesApi = new AdvocatesApi();
```

**When to use:**

- All API calls should go through the data-access layer
- Never call `fetch` directly from components or hooks
- Keep API methods focused on HTTP communication

---

## Types

**Location:** `src/types/`

**Purpose:** Frontend TypeScript types that represent data structures used in the UI.

**Conventions:**

- Name files with `.ts` suffix (e.g., `advocate.ts`)
- Types should match the shape of data used in components
- Can be derived from DTOs but may have frontend-specific additions
- Keep types focused on UI needs

**Example:**

```typescript
// src/types/advocate.ts
export interface Advocate {
  id?: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt?: Date | string;
}
```

**When to use:**

- Define types for component props
- Type data used in hooks and components
- Ensure type safety across the frontend

---

## Best Practices

1. **Never call API routes directly** - Always use the data-access layer
2. **Use React Query for data fetching** - Automatic caching, loading states, and error handling
3. **Use hooks for data fetching** - Keep components focused on rendering
4. **Type everything** - Use TypeScript types throughout
5. **Keep components small** - Extract reusable logic to hooks
6. **Handle loading and error states** - Always provide user feedback
7. **Use Tailwind CSS for styling** - Consistent, utility-first styling
8. **Memoize expensive computations** - Use `useMemo` and `useCallback` appropriately
9. **Organize query keys** - Use consistent query key patterns for React Query
10. **Document complex logic** - Add comments for non-obvious code

---

## Data Flow

The data flow follows this pattern:

```
Frontend                           Backend
┌─────────────┐                   ┌─────────────┐
│  Component  │                   │  API Route  │
│             │                   │             │
│     ↓       │                   │      ↓      │
│   Hook      │  ──HTTP Request──> │  Repository │
│ (React Query)│                   │             │
│     ↓       │                   │      ↓      │
│ Data-Access │  <─JSON Response─ │    Model    │
└─────────────┘                   └─────────────┘
     │                                      │
     │                                      │
     ▼                                      ▼
   Types                               DTOs
```

**Flow Steps:**

1. **Component** triggers an action (e.g., user interaction)
2. **Hook** (React Query) calls the data-access layer
3. **Data-Access** makes HTTP request to API route
4. **API Route** validates request (if applicable) and calls repository
5. **Repository** queries database and returns Models
6. **API Route** converts Models to DTOs, validates with Zod, and returns JSON
7. **Data-Access** receives DTOs and converts to Types
8. **Hook** (React Query) updates cache and state with Types
9. **Component** re-renders with new data from React Query cache

---

## File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Pages
│   └── layout.tsx
│
├── components/             # Reusable UI components
│   └── .gitignore
│
├── hooks/                  # Custom React hooks (React Query)
│   └── useAdvocates.ts
│
├── data-access/            # API client layer
│   └── advocates.api.ts
│
├── lib/                    # Utility libraries
│   └── react-query.tsx     # React Query provider
│
└── types/                  # Frontend TypeScript types
    └── advocate.ts
```

---

## Questions?

If you have questions about these conventions or need to add new patterns, please refer to this document and update it as needed.
