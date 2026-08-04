import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { assessmentAttempts, courseProgress, moduleStatus } from "@/db/schema";
import { getCourseModule, moduleLessons } from "@/lib/course";

function moduleFrom(params: { moduleId: string }) {
  const id = Number(params.moduleId);
  return Number.isInteger(id) ? getCourseModule(id) : undefined;
}

async function missingLessons(userId: string, moduleId: number) {
  const required = moduleLessons[moduleId];
  const rows = await getDb().select({ moduleId: courseProgress.moduleId, completedAt: courseProgress.completedAt })
    .from(courseProgress).where(and(eq(courseProgress.userId, userId), inArray(courseProgress.moduleId, required)));
  const done = new Set(rows.filter((row) => row.completedAt).map((row) => row.moduleId));
  return required.filter((lessonId) => !done.has(lessonId));
}

async function previousModulePassed(userId: string, moduleId: number) {
  if (moduleId === 1) return true;
  const [previous] = await getDb().select({ passedAt: moduleStatus.passedAt }).from(moduleStatus)
    .where(and(eq(moduleStatus.userId, userId), eq(moduleStatus.moduleId, moduleId - 1)));
  return Boolean(previous?.passedAt);
}

export async function GET(_: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const courseModule = moduleFrom(await params);
  if (!courseModule) return NextResponse.json({ error: "Module not found" }, { status: 404 });
  if (!await previousModulePassed(userId, courseModule.id)) return NextResponse.json({ locked: true, previousModule: courseModule.id - 1 }, { status: 423 });
  const missing = await missingLessons(userId, courseModule.id);
  if (missing.length) return NextResponse.json({ locked: true, missingLessons: missing }, { status: 423 });
  const [moduleRecord] = await getDb().select({ practiceComplete: moduleStatus.practiceComplete }).from(moduleStatus).where(and(eq(moduleStatus.userId, userId), eq(moduleStatus.moduleId, courseModule.id)));
  if (!moduleRecord?.practiceComplete) return NextResponse.json({ locked: true, needsPractice: true }, { status: 423 });

  const attempts = await getDb().select({ score: assessmentAttempts.score, createdAt: assessmentAttempts.createdAt })
    .from(assessmentAttempts).where(and(eq(assessmentAttempts.userId, userId), eq(assessmentAttempts.moduleId, courseModule.id))).orderBy(desc(assessmentAttempts.createdAt));

  return NextResponse.json({ title: courseModule.title, questions: courseModule.questions.map(({ prompt, options }) => ({ prompt, options })), attempts: attempts.slice(0, 10) });
}

export async function POST(request: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const courseModule = moduleFrom(await params);
  if (!courseModule) return NextResponse.json({ error: "Module not found" }, { status: 404 });
  if (!await previousModulePassed(userId, courseModule.id)) return NextResponse.json({ locked: true, previousModule: courseModule.id - 1 }, { status: 423 });
  const missing = await missingLessons(userId, courseModule.id);
  if (missing.length) return NextResponse.json({ locked: true, missingLessons: missing }, { status: 423 });
  const [moduleRecord] = await getDb().select({ practiceComplete: moduleStatus.practiceComplete }).from(moduleStatus).where(and(eq(moduleStatus.userId, userId), eq(moduleStatus.moduleId, courseModule.id)));
  if (!moduleRecord?.practiceComplete) return NextResponse.json({ locked: true, needsPractice: true }, { status: 423 });
  const body = await request.json().catch(() => null) as { answers?: unknown } | null;
  const answers = body?.answers;
  if (!Array.isArray(answers) || answers.length !== courseModule.questions.length || answers.some((answer): answer is number => typeof answer !== "number" || !Number.isInteger(answer) || answer < 0 || answer > 3)) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }

  const correct = courseModule.questions.reduce((total, question, index) => total + Number(question.answer === answers[index]), 0);
  const score = Math.round((correct / courseModule.questions.length) * 100);
  await getDb().insert(assessmentAttempts).values({ id: crypto.randomUUID(), userId, moduleId: courseModule.id, score, answers: JSON.stringify(answers) });
  const now = new Date();
  await getDb().insert(moduleStatus).values({ userId, moduleId: courseModule.id, bestScore: score, passedAt: score >= 70 ? now : null, updatedAt: now })
    .onConflictDoUpdate({ target: [moduleStatus.userId, moduleStatus.moduleId], set: { bestScore: score, passedAt: score >= 70 ? now : null, updatedAt: now } });
  return NextResponse.json({ score, passed: score >= 70, answers: courseModule.questions.map((question, index) => ({ correct: question.answer, explanation: question.explanation, selected: answers[index] })) });
}
