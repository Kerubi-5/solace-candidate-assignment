/**
 * API Route for individual Advocate endpoint.
 * Thin HTTP layer that delegates to repositories and converts models to DTOs.
 * Uses Zod schemas for response validation.
 */

import { advocateRepository } from '@/server/advocates/repositories/repository';
import {
  advocateResponseSchema,
  getAdvocateResponseSchema,
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
 * GET /api/advocates/[id]
 * Returns a single advocate by ID from the repository.
 * Uses the repository pattern and converts models to DTOs.
 * Validates response with Zod schema.
 * Returns 404 if advocate not found.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    // Validate ID parameter
    const id = parseInt(params.id, 10);
    if (isNaN(id) || id <= 0) {
      return Response.json(
        {
          error: 'Invalid ID',
          message: 'ID must be a positive integer',
        },
        { status: 400 }
      );
    }

    // Find advocate by ID
    const model = await advocateRepository.findById(id);

    if (!model) {
      return Response.json(
        {
          error: 'Not found',
          message: `Advocate with ID ${id} not found`,
        },
        { status: 404 }
      );
    }

    // Convert to DTO and validate
    const dto = toAdvocateResponseDto(model);
    const responseData = { data: dto };

    // Validate response with Zod schema
    const validatedResponse = getAdvocateResponseSchema.parse(responseData);

    return Response.json(validatedResponse, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
