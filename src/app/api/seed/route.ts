import { db } from '@/db';
import { advocates } from '@/server/advocates/models/model';
import { advocateData } from '@/db/seed/advocates';

export async function POST() {
  const records = await db.insert(advocates).values(advocateData).returning();

  return Response.json({ advocates: records });
}
