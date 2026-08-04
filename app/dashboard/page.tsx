import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { moduleStatus } from "@/db/schema";
import { courseModules } from "@/lib/course";
import "./dashboard.css";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const statuses = await getDb().select().from(moduleStatus).where(eq(moduleStatus.userId, userId));
  const byModule = new Map(statuses.map((status) => [status.moduleId, status]));
  const approved = statuses.filter((status) => status.passedAt).length;

  return <main className="dashboard"><a className="dash-brand" href="/course">&gt;_ container<span>lab</span></a><p className="dash-eyebrow">SEU ESPAÇO</p><h1>Seu progresso.</h1><p className="dash-lead">{approved} de {courseModules.length} módulos aprovados.</p><div className="dash-grid">{courseModules.map((module) => { const status = byModule.get(module.id); const passed = Boolean(status?.passedAt); return <article className={`dash-module ${passed ? "approved" : ""}`} key={module.id}><span>MÓDULO {String(module.id).padStart(2, "0")}</span><h2>{module.title}</h2><p>{passed ? "Badge conquistada" : status?.practiceComplete ? "Prática concluída. Faça a avaliação." : "Em andamento"}</p><dl><div><dt>Prática</dt><dd>{status?.practiceComplete ? "Concluída" : "Pendente"}</dd></div><div><dt>Melhor nota</dt><dd>{status?.bestScore ? `${status.bestScore}%` : "-"}</dd></div></dl><a href={`/course/assessment.html?module=${module.id}`}>Abrir módulo</a></article>; })}</div></main>;
}
