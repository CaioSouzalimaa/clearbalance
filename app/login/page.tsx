"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkedInIcon } from "@/public/linkedin";
import { FacebookIcon } from "@/public/facebook";
import { InstagramIcon } from "@/public/instagram";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Email ou senha inválidos. Tente novamente.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans">
      {/* Logo Area - Agora usando o arquivo logo.png */}
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="ClearBalance Logo"
          width={180} // Ajuste o tamanho conforme necessário
          height={50}
          priority // Carrega a logo com prioridade
          className="object-contain"
        />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-120 bg-surface rounded-xl shadow-xl shadow-black/10 p-10 border border-border">
        <h1 className="text-2xl font-bold text-foreground mb-8 text-center md:text-left">
          Welcome back to financial clarity
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <div className="flex items-center justify-between mt-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Remember me
              </span>
            </label>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Secure Login"}
            </Button>
          </div>

          {error ? (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          ) : null}
        </form>

        <div className="flex items-center justify-between mt-10 text-sm">
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Forgot password?
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            Create an account
          </a>
        </div>
      </div>

      {/* Social Footer */}
      <div className="flex gap-6 mt-12 opacity-50">
        <a
          href="#"
          className="text-foreground hover:text-primary transition-colors"
        >
          <FacebookIcon size={28} />
        </a>

        <a
          href="#"
          className="text-foreground hover:text-primary transition-colors"
        >
          <InstagramIcon size={28} />
        </a>

        <a
          href="#"
          className="text-foreground hover:text-primary transition-colors"
        >
          <LinkedInIcon size={28} />
        </a>
      </div>
    </main>
  );
}
