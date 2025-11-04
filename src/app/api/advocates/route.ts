/**
 * API Route for Advocates endpoints.
 * Thin HTTP layer that delegates to repositories and converts models to DTOs.
 * Uses Zod schemas for response validation.
 */

import { z } from 'zod';
import { advocateRepository } from '@/server/advocates/repositories/repository';
import {
  getAdvocatesResponseSchema,
  advocateResponseSchema,
} from '@/server/advocates/dto/dto';
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
 * Uses the repository pattern and converts models to DTOs.
 * Validates response with Zod schema.
 */
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
