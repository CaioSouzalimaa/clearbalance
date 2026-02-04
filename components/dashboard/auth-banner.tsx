"use client";

import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AuthBanner() {
  const { data: session } = useSession();

  if (!session?.user?.email) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>Olá, {session.user.email}</span>
      <Button
        variant="outline"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sair
      </Button>
    </div>
  );
}
