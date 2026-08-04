import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { courseProgress } from "@/db/schema";

const MIN_MODULE_ID = 1;
const MAX_MODULE_ID = 16;

function validModuleId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= MIN_MODULE_ID && value <= MAX_MODULE_ID;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const progress = await getDb()
    .select({
      moduleId: courseProgress.moduleId,
      completed: courseProgress.completedAt,
      practiceComplete: courseProgress.practiceComplete,
    })
    .from(courseProgress)
    .where(eq(courseProgress.userId, userId));

  return NextResponse.json({ progress });
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { moduleId, completed, practiceComplete = false } = body as Record<string, unknown>;
  if (!validModuleId(moduleId) || typeof completed !== "boolean" || typeof practiceComplete !== "boolean") {
    return NextResponse.json({ error: "Invalid progress data" }, { status: 400 });
  }

  const now = new Date();
  await getDb()
    .insert(courseProgress)
    .values({
      userId,
      moduleId,
      practiceComplete: practiceComplete ? 1 : 0,
      completedAt: completed ? now : null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [courseProgress.userId, courseProgress.moduleId],
      set: {
        practiceComplete: practiceComplete ? 1 : 0,
        completedAt: completed ? now : null,
        updatedAt: now,
      },
    });

  return NextResponse.json({ ok: true });
}
