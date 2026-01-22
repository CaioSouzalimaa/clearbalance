"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkedInIcon } from "@/public/linkedin";
import { FacebookIcon } from "@/public/facebook";
import { InstagramIcon } from "@/public/instagram";

export default function LoginPage() {
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

        <form className="space-y-4">
          <Input type="email" placeholder="Email address" required />

          <Input type="password" placeholder="Password" required />

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

            <Button type="submit">Secure Login</Button>
          </div>
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
