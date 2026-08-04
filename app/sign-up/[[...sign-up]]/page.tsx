import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <main className="auth-screen"><section className="auth-copy"><a className="auth-brand" href="/course/index.html">&gt;_ container<span>lab</span></a><p className="auth-eyebrow">COMECE SEM CUSTO</p><h1>Aprenda construindo de verdade.</h1><p>Crie sua conta para salvar cada passo da sua jornada com Docker e Kubernetes.</p></section><SignUp path="/sign-up" routing="path" signInUrl="/sign-in" appearance={clerkAppearance} /></main>;
}

const clerkAppearance = { variables: { colorPrimary: "#1267e8", colorText: "#10233d", colorBackground: "#ffffff", borderRadius: "14px", fontFamily: "Arial, sans-serif" }, elements: { cardBox: "containerlab-cardbox", card: "containerlab-card", headerTitle: "containerlab-title", headerSubtitle: "containerlab-subtitle", formButtonPrimary: "containerlab-primary", socialButtonsBlockButton: "containerlab-social", footerActionLink: "containerlab-link", formFieldInput: "containerlab-input" } };
