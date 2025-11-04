# Server Architecture Guide

This document outlines the server-side architecture, conventions, and best practices for this Next.js application.

## Table of Contents

- [Overview](#overview)
- [Service-Based Structure](#service-based-structure)
- [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
- [Models](#models)
- [Repositories](#repositories)
- [API Routes](#api-routes)
- [Best Practices](#best-practices)

---

## Overview

The server-side architecture handles all backend logic, data access, and API contracts. It is organized in `src/server/` with a service-based structure that maintains clear separation of concerns.

**Key Components:**

- **Server (`src/server/`)**: Handles data access, business logic, and API contracts
- **API Routes (`src/app/api/`)**: Thin HTTP layer that connects server services to HTTP endpoints

---

## Service-Based Structure

The server is organized in `src/server/` with a **service-based structure**. Each service (domain) has its own folder containing all related code:

```
src/server/
└── advocates/          # Advocate service/domain
    ├── dto/            # Data Transfer Objects (API contracts)
    │   └── dto.ts
    ├── models/          # Domain models (business logic entities)
    │   └── model.ts
    └── repositories/   # Data access layer (database operations)
        └── repository.ts
```

**Benefits of Service-Based Structure:**

- Clear domain boundaries
- Easy to find all related code for a service
- Scalable as new services are added
- Maintains separation of concerns

---

## DTOs (Data Transfer Objects)

**Location:** `src/server/{service}/dto/dto.ts`

**Purpose:** Define the shape of data sent to and received from API endpoints. DTOs represent the API contract between frontend and backend.

**Conventions:**

- Each service has its own `dto/` folder
- Name the file `dto.ts` (no service prefix needed since it's in the service folder)
- Use `RequestDto` suffix for request DTOs (e.g., `CreateAdvocateDto`)
- Use `ResponseDto` suffix for response DTOs (e.g., `AdvocateResponseDto`)
- Export all DTOs from a single file per service
- Use Zod schemas for runtime validation
- Infer TypeScript types from Zod schemas

**Example:**

```typescript
// src/server/advocates/dto/dto.ts
import { z } from 'zod';

// Zod schema for validation
export const advocateResponseSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  city: z.string().min(1, 'City is required'),
  degree: z.string().min(1, 'Degree is required'),
  specialties: z.array(z.string()).default([]),
  yearsOfExperience: z
    .number()
    .int()
    .min(0, 'Years of experience must be non-negative'),
  phoneNumber: z.number().int().positive('Phone number must be positive'),
  createdAt: z.union([z.date(), z.string()]).optional(),
});

export const getAdvocatesResponseSchema = z.object({
  data: z.array(advocateResponseSchema),
});

// Type inferred from Zod schema
export type AdvocateResponseDto = z.infer<typeof advocateResponseSchema>;
export type GetAdvocatesResponseDto = z.infer<
  typeof getAdvocatesResponseSchema
>;
```

**When to use:**

- Define request/response shapes for API endpoints
- Document API contracts
- Validate data structure at runtime using Zod
- Ensure type safety with TypeScript inference from Zod schemas

---

## Models

**Location:** `src/server/{service}/models/model.ts`

**Purpose:** Represent domain entities and business logic. Models are separate from database schemas and DTOs.

**Conventions:**

- Each service has its own `models/` folder
- Name the file `model.ts` (no service prefix needed since it's in the service folder)
- Use `Model` suffix for interfaces (e.g., `AdvocateModel`)
- Include transformation functions (e.g., `toAdvocateModel()`) to convert from database schemas
- Models represent business entities, not database tables

**Example:**

```typescript
// src/server/advocates/models/model.ts
export interface AdvocateModel {
  id?: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt?: Date;
}

export function toAdvocateModel(data: {
  id?: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[] | unknown;
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt?: Date | string;
}): AdvocateModel {
  return {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    city: data.city,
    degree: data.degree,
    specialties: Array.isArray(data.specialties) ? data.specialties : [],
    yearsOfExperience: data.yearsOfExperience,
    phoneNumber: data.phoneNumber,
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
  };
}
```

**When to use:**

- Represent business logic entities
- Transform database schemas to domain models
- Apply business rules and validations

---

## Repositories

**Location:** `src/server/{service}/repositories/repository.ts`

**Purpose:** Abstract database operations and provide a clean interface for data access. Follows the Repository pattern.

**Conventions:**

- Each service has its own `repositories/` folder
- Name the file `repository.ts` (no service prefix needed since it's in the service folder)
- Use `Repository` suffix for classes (e.g., `AdvocateRepository`)
- Export a singleton instance (e.g., `advocateRepository`)
- Methods should be async and return Promises
- Handle errors gracefully and throw meaningful errors
- Convert database results to Models

**Example:**

```typescript
// src/server/advocates/repositories/repository.ts
import type { AdvocateModel } from '../models/model';
import { toAdvocateModel } from '../models/model';
import type { FilterAdvocatesDto } from '../dto/dto';

export class AdvocateRepository {
  async findAll(): Promise<AdvocateModel[]> {
    try {
      // Database operations
      // const results = await db.select().from(advocates);
      // return results.map(toAdvocateModel);

      // Using seed data for now
      return advocateData.map(toAdvocateModel);
    } catch (error) {
      console.error('Error fetching advocates from repository:', error);
      throw new Error('Failed to fetch advocates');
    }
  }

  async findById(id: number): Promise<AdvocateModel | null> {
    // Database operations
  }
}

export const advocateRepository = new AdvocateRepository();
```

**When to use:**

- All database queries should go through repositories
- Repositories convert database results to Models
- Keep repositories focused on data access only

---

## API Routes

**Location:** `src/app/api/`

**Purpose:** Thin HTTP layer that connects backend services to HTTP endpoints. Routes should be minimal and delegate to repositories/services.

**Conventions:**

- Use Next.js App Router conventions (`route.ts` files)
- Keep routes thin - delegate to repositories
- Convert Models to DTOs before sending responses
- Validate responses with Zod schemas
- Handle HTTP status codes appropriately
- Return consistent response formats
- Handle errors gracefully

**Example:**

```typescript
// src/app/api/advocates/route.ts
import { z } from 'zod';
import { advocateRepository } from '@/server/advocates/repositories/repository';
import {
  getAdvocatesResponseSchema,
  advocateResponseSchema,
} from '@/server/advocates/dto/dto';
import type { AdvocateModel } from '@/server/advocates/models/model';

function toAdvocateResponseDto(model: AdvocateModel) {
  const dto = {
    id: model.id,
    firstName: model.firstName,
    lastName: model.lastName,
    city: model.city,
    degree: model.degree,
    specialties: model.specialties,
    yearsOfExperience: model.yearsOfExperience,
    phoneNumber: model.phoneNumber,
    createdAt: model.createdAt,
  };

  // Validate with Zod schema
  return advocateResponseSchema.parse(dto);
}

export async function GET(): Promise<Response> {
  try {
    const models = await advocateRepository.findAll();
    const dtos = models.map(toAdvocateResponseDto);
    const response = { data: dtos };

    // Validate response with Zod schema
    const validatedResponse = getAdvocatesResponseSchema.parse(response);

    return Response.json(validatedResponse, { status: 200 });
  } catch (error) {
    console.error('Error fetching advocates:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error: 'Validation error',
          details: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 500 }
      );
    }

    return Response.json(
      { error: 'Failed to fetch advocates' },
      { status: 500 }
    );
  }
}
```

**When to use:**

- Define HTTP endpoints
- Handle HTTP-specific concerns (status codes, headers)
- Convert Models to DTOs for responses
- Validate responses with Zod schemas before returning

---

## Best Practices

1. **Never expose database schemas directly** - Always use Models and DTOs
2. **Keep repositories focused** - Only handle data access, not business logic
3. **Use Zod schemas for validation** - Ensure runtime type safety and validation
4. **Use DTOs for API contracts** - Ensures consistent API responses
5. **Handle errors gracefully** - Throw meaningful errors from repositories
6. **Keep API routes thin** - Delegate to repositories and services
7. **Validate all responses** - Use Zod schemas to validate before sending responses
8. **Follow service-based structure** - Keep all service code in its own folder
9. **Type everything** - Use TypeScript types throughout
10. **Document complex logic** - Add comments for non-obvious code

---

## File Organization

```
src/
├── app/
│   └── api/                # API routes (thin HTTP layer)
│       └── advocates/
│           └── route.ts
│
└── server/                 # Server-side logic (service-based)
    └── advocates/          # Advocate service/domain
        ├── dto/            # Data Transfer Objects (with Zod schemas)
        │   └── dto.ts
        ├── models/         # Domain models
        │   └── model.ts
        └── repositories/   # Data access layer
            └── repository.ts
```

---

## Questions?

If you have questions about these conventions or need to add new patterns, please refer to this document and update it as needed.
