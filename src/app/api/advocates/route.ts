/**
 * API Route for Advocates endpoints.
 * Thin HTTP layer that delegates to repositories and converts models to DTOs.
 * Uses Zod schemas for response validation.
 */

import { advocateRepository } from '@/server/advocates/repositories/repository';
import {
  getAdvocatesResponseSchema,
  advocateResponseSchema,
  filterAdvocatesSchema,
} from '@/server/advocates/dto/dto';
import { handleApiError } from '@/server/lib/error-handler';
import type { AdvocateModel } from '@/server/advocates/models/model';

/**
 * Convert AdvocateModel to AdvocateResponseDto.
 * Transforms domain model to API response format and validates with Zod.
 */
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

/**
 * GET /api/advocates
 * Returns a list of advocates from the repository.
 * Supports optional query parameters for filtering: city, degree, specialty, minYearsOfExperience
 * Uses the repository pattern and converts models to DTOs.
 * Validates response with Zod schema.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    // Parse query parameters from URL
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Parse and validate query parameters with Zod
    // If no params provided, returns empty object (all fields undefined)
    // Zod will handle type coercion (e.g., string to number)
    const parseResult = filterAdvocatesSchema.safeParse(queryParams);

    if (!parseResult.success) {
      // Validation errors are handled by handleApiError
      throw parseResult.error;
    }

    // Extract validated filter with pagination
    const validatedFilter = parseResult.data;
    const limit = validatedFilter.limit ?? 10;
    const offset = validatedFilter.offset ?? 0;

    // Get paginated results from repository
    const result = await advocateRepository.findAll(validatedFilter);

    // Convert models to DTOs
    const dtos = result.data.map(toAdvocateResponseDto);

    // Build pagination metadata
    const hasMore = offset + result.data.length < result.total;

    const response = {
      data: dtos,
      pagination: {
        limit,
        offset,
        total: result.total,
        hasMore,
      },
    };

    // Validate response with Zod schema
    const validatedResponse = getAdvocatesResponseSchema.parse(response);

    return Response.json(validatedResponse, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
