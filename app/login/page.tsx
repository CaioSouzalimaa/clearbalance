"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsSubmitting(false);

    if (response?.error) {
      setError("Não foi possível entrar. Verifique seu e-mail e senha.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans">
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="ClearBalance Logo"
          width={180}
          height={50}
          priority
          className="object-contain"
        />
      </div>

      <div className="w-full max-w-120 bg-surface rounded-xl shadow-xl shadow-black/10 p-10 border border-border">
        <h1 className="text-2xl font-bold text-foreground mb-8 text-center md:text-left">
          Welcome back to financial clarity
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error ? <p className="text-sm text-rose-500">{error}</p> : null}

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
        </form>

        <div className="flex items-center justify-between mt-10 text-sm">
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
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

      <div className="flex gap-6 mt-12 opacity-50">
        <a href="#" className="text-foreground hover:text-primary transition-colors">
          <FacebookIcon size={28} />
        </a>

        <a href="#" className="text-foreground hover:text-primary transition-colors">
          <InstagramIcon size={28} />
        </a>

        <a href="#" className="text-foreground hover:text-primary transition-colors">
          <LinkedInIcon size={28} />
        </a>
      </div>
    </main>
  );
}
