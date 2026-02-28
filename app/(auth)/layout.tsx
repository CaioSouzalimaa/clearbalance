import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - ClearBalance",
  description: "Faça login na sua conta ClearBalance",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {children}
    </div>
  );
}
