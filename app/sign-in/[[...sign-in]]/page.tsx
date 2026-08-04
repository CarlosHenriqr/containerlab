import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <main className="auth-screen"><section className="auth-copy"><a className="auth-brand" href="/course/index.html">&gt;_ container<span>lab</span></a><p className="auth-eyebrow">CONTINUE SUA TRILHA</p><h1>Seu próximo comando começa aqui.</h1><p>Entre para guardar práticas, avaliações e conquistas no seu perfil.</p></section><SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" appearance={clerkAppearance} /></main>;
}

const clerkAppearance = { variables: { colorPrimary: "#1267e8", colorText: "#10233d", colorBackground: "#ffffff", borderRadius: "14px", fontFamily: "Arial, sans-serif" }, elements: { card: "containerlab-card", headerTitle: "containerlab-title", headerSubtitle: "containerlab-subtitle", formButtonPrimary: "containerlab-primary", socialButtonsBlockButton: "containerlab-social", footerActionLink: "containerlab-link", formFieldInput: "containerlab-input" } };
