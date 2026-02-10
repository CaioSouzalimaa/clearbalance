"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export const LogoutButton = () => {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full sm:w-auto"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sair
    </Button>
  );
};
