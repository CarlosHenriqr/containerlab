import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import "./globals.css";
import "./course.css";
import "./auth.css";
import "./auth-fix.css";

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
        <ClerkProvider ui={ui}>{children}</ClerkProvider>
      </body>
    </html>
  );
}
