import { db } from '@/db';
import { advocates } from '@/server/advocates/models/model';
import { advocateData } from '@/db/seed/advocates';
import { handleApiError } from '@/server/lib/error-handler';

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
    return handleApiError(error);
  }
}
