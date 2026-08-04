import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function CoursePage() {
  return (
    <main className="course-page">
      <header className="course-topbar">
        <a className="course-brand" href="/course" aria-label="Container Lab, início">
          <span aria-hidden="true">&gt;_ </span>container<span>lab</span>
        </a>

        <nav aria-label="Navegação principal">
          <a href="/course/index.html?embedded=1#trilha" target="course-content">Trilha</a>
          <a href="/course/index.html?embedded=1#laboratorio" target="course-content">Laboratório</a>
          <a href="/course/index.html?embedded=1#comandos" target="course-content">Comandos</a>
          <a href="/course/assessment.html?module=1" target="course-content">Avaliações</a>
        </nav>

        <div className="course-account">
          <Show when="signed-out">
            <SignInButton>
              <button className="course-login" type="button">Entrar</button>
            </SignInButton>
            <SignUpButton>
              <button className="course-register" type="button">Criar conta</button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <a className="course-dashboard" href="/dashboard">Meu progresso</a>
            <UserButton />
          </Show>
        </div>
      </header>

      <iframe
        className="course-frame"
        title="Curso Container Lab"
        name="course-content"
        src="/course/index.html?embedded=1"
      />
    </main>
  );
}
