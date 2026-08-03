import type { Metadata } from "next";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Container Lab | Docker e Kubernetes no Windows",
  description: "Curso pratico de Docker e Kubernetes para iniciantes no Windows.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <ClerkProvider>
          <header className="auth-nav">
            <Show when="signed-out">
              <SignInButton><button className="auth-link">Entrar</button></SignInButton>
              <SignUpButton><button className="auth-button">Criar conta</button></SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
