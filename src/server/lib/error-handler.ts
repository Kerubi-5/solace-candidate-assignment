/**
 * Centralized error handling for API routes.
 */

import { z } from 'zod';

/**
 * Handle errors and return appropriate HTTP response.
 */
export function handleApiError(error: unknown): Response {
  console.error('API Error:', error);

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return Response.json(
      {
        error: 'Validation error',
        details: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      },
      { status: 400 }
    );
  }

  // Handle duplicate key errors
  if (error instanceof Error && error.message.includes('duplicate key value')) {
    return Response.json(
      {
        error: 'Resource already exists',
        message: error.message,
      },
      { status: 409 }
    );
  }

  // Handle database connection errors
  if (
    error instanceof Error &&
    (error.message.includes('connection') || error.message.includes('database'))
  ) {
    return Response.json(
      {
        error: 'Database connection error',
      },
      { status: 503 }
    );
  }

  // Default error response
  return Response.json(
    {
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && error instanceof Error
        ? { details: error.message }
        : {}),
    },
    { status: 500 }
  );
}
