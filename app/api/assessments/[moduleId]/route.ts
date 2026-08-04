import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { assessmentAttempts } from "@/db/schema";
import { getCourseModule } from "@/lib/course";

function moduleFrom(params: { moduleId: string }) {
  const id = Number(params.moduleId);
  return Number.isInteger(id) ? getCourseModule(id) : undefined;
}

export async function GET(_: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const module = moduleFrom(await params);
  if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  const attempts = await getDb().select({ score: assessmentAttempts.score, createdAt: assessmentAttempts.createdAt })
    .from(assessmentAttempts).where(and(eq(assessmentAttempts.userId, userId), eq(assessmentAttempts.moduleId, module.id))).orderBy(desc(assessmentAttempts.createdAt));

  return NextResponse.json({ title: module.title, questions: module.questions.map(({ prompt, options }) => ({ prompt, options })), attempts: attempts.slice(0, 10) });
}

export async function POST(request: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const module = moduleFrom(await params);
  if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 });
  const body = await request.json().catch(() => null) as { answers?: unknown } | null;
  const answers = body?.answers;
  if (!Array.isArray(answers) || answers.length !== module.questions.length || answers.some((answer): answer is number => typeof answer !== "number" || !Number.isInteger(answer) || answer < 0 || answer > 3)) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }

  const correct = module.questions.reduce((total, question, index) => total + Number(question.answer === answers[index]), 0);
  const score = Math.round((correct / module.questions.length) * 100);
  await getDb().insert(assessmentAttempts).values({ id: crypto.randomUUID(), userId, moduleId: module.id, score, answers: JSON.stringify(answers) });
  return NextResponse.json({ score, passed: score >= 70, answers: module.questions.map((question, index) => ({ correct: question.answer, explanation: question.explanation, selected: answers[index] })) });
}
