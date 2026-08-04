import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { moduleStatus } from "@/db/schema";
import { getCourseModule } from "@/lib/course";

export async function POST(_: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const moduleId = Number((await params).moduleId);
  if (!getCourseModule(moduleId)) return NextResponse.json({ error: "Module not found" }, { status: 404 });
  const now = new Date();
  await getDb().insert(moduleStatus).values({ userId, moduleId, practiceComplete: 1, updatedAt: now })
    .onConflictDoUpdate({ target: [moduleStatus.userId, moduleStatus.moduleId], set: { practiceComplete: 1, updatedAt: now } });
  return NextResponse.json({ ok: true });
}
