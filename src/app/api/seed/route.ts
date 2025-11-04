import { db } from '@/db';
import { advocates } from '@/server/advocates/models/model';
import { advocateData } from '@/db/seed/advocates';

export async function POST() {
  try {
    const records = await db.insert(advocates).values(advocateData).returning();

    return Response.json(
      {
        message: 'Database seeded successfully',
        count: records.length,
        advocates: records,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error seeding database:', error);

    // Handle duplicate key errors gracefully
    if (
      error instanceof Error &&
      error.message.includes('duplicate key value')
    ) {
      return Response.json(
        {
          error: 'Database already seeded',
          message: 'Advocates may already exist in the database',
        },
        { status: 409 }
      );
    }

    return Response.json(
      {
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
