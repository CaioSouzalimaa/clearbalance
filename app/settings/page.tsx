"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { SidebarShell } from "@/components/dashboard/sidebar-shell";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"password" | "confirm">("password");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Falha ao carregar perfil");
        const data: UserProfile = await res.json();
        setProfile(data);
        setName(data.name ?? "");
        setEmail(data.email);
      } catch {
        toast("Erro ao carregar informações do perfil.", "error");
      } finally {
        setIsLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Erro ao salvar.", "error");
      } else {
        setProfile(data);
        toast("Perfil atualizado com sucesso!", "success");
      }
    } catch {
      toast("Erro de conexão.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast("A nova senha deve ter pelo menos 8 caracteres.", "error");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      toast(
        "A nova senha deve conter pelo menos uma letra maiúscula.",
        "error",
      );
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      toast(
        "A nova senha deve conter pelo menos uma letra minúscula.",
        "error",
      );
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      toast("A nova senha deve conter pelo menos um número.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("As senhas não coincidem.", "error");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Erro ao alterar senha.", "error");
      } else {
        toast("Senha alterada com sucesso!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast("Erro de conexão.", "error");
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <SidebarShell>
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground">
          Atualize seu perfil e personalize suas preferências.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* ── Perfil ── */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            Informações do perfil
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mantenha seus dados sempre atualizados.
          </p>

          {isLoadingProfile ? (
            <div className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-9 w-36 rounded-md" />
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="nome"
                    className="text-sm font-medium text-foreground"
                  >
                    Nome completo
                  </label>
                  <Input
                    id="nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex.: Ana Beatriz Oliveira"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ana@email.com"
                  />
                </div>
              </div>

              {profile && (
                <p className="text-xs text-muted-foreground">
                  Membro desde{" "}
                  {new Date(profile.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {/* ── Preferências ── */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">
              Preferências
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Personalize sua experiência no ClearBalance.
            </p>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Tema</p>
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* ── Conta ── */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Conta</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Gerencie sua sessão e acesso ao sistema.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
              >
                Sair da conta
              </button>
            </div>
          </div>

          {/* ── Segurança / Alterar senha ── */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Segurança</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Altere sua senha de acesso.
            </p>

            <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="currentPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Senha atual
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Nova senha
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mín. 8 chars, maiúscula, número"
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Confirmar nova senha
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSavingPassword}
              >
                {isSavingPassword ? "Alterando..." : "Alterar senha"}
              </Button>
            </form>
          </div>

          {/* ── Zona de Perigo ── */}
          <div className="rounded-2xl border border-red-200 bg-surface p-6 shadow-sm dark:border-red-800/40">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
              Zona de perigo
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ações irreversíveis sobre sua conta.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setDeleteStep("password");
                  setDeletePassword("");
                  setDeleteConfirmText("");
                  setIsDeleteModalOpen(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
              >
                Excluir minha conta
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Modal de confirmação de exclusão ── */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeletingAccount) {
              setIsDeleteModalOpen(false);
              setDeletePassword("");
              setDeleteConfirmText("");
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
              Excluir conta permanentemente
            </h2>

            {deleteStep === "password" ? (
              <>
                <p className="mt-3 text-sm text-muted-foreground">
                  Para continuar, confirme sua senha atual.
                </p>
                <div className="mt-4 space-y-2">
                  <label
                    htmlFor="deletePassword"
                    className="text-sm font-medium text-foreground"
                  >
                    Senha
                  </label>
                  <Input
                    id="deletePassword"
                    type="password"
                    placeholder="••••••••"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    autoComplete="current-password"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && deletePassword.trim()) {
                        setDeleteStep("confirm");
                      }
                    }}
                  />
                </div>
                <div className="mt-6 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setDeletePassword("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    disabled={!deletePassword.trim()}
                    onClick={() => setDeleteStep("confirm")}
                  >
                    Continuar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm text-muted-foreground">
                  Seus dados serão{" "}
                  <strong className="text-foreground">apagados permanentemente</strong>.
                  Esta ação é irreversível.
                </p>
                <p className="mt-4 text-sm text-foreground">
                  Para confirmar, digite exatamente:{" "}
                  <strong className="font-mono text-red-600 dark:text-red-400">
                    EXCLUIR MINHA CONTA
                  </strong>
                </p>
                <Input
                  className="mt-3"
                  placeholder="EXCLUIR MINHA CONTA"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
                <div className="mt-6 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setDeletePassword("");
                      setDeleteConfirmText("");
                    }}
                    disabled={isDeletingAccount}
                  >
                    Cancelar
                  </Button>
                  <button
                    type="button"
                    disabled={
                      deleteConfirmText !== "EXCLUIR MINHA CONTA" ||
                      isDeletingAccount
                    }
                    onClick={async () => {
                      if (deleteConfirmText !== "EXCLUIR MINHA CONTA") return;
                      setIsDeletingAccount(true);
                      try {
                        const res = await fetch("/api/settings/delete-account", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ password: deletePassword }),
                        });
                        if (!res.ok) {
                          const data = await res.json().catch(() => ({}));
                          toast(
                            (data as { error?: string })?.error ??
                              "Erro ao excluir conta.",
                            "error",
                          );
                          if (
                            (data as { error?: string })?.error === "Senha incorreta"
                          ) {
                            setDeleteStep("password");
                            setDeletePassword("");
                            setDeleteConfirmText("");
                          }
                          return;
                        }
                        toast("Conta excluída com sucesso.", "success");
                        await signOut({ callbackUrl: "/login" });
                      } catch {
                        toast("Erro de conexão.", "error");
                      } finally {
                        setIsDeletingAccount(false);
                      }
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
                  >
                    {isDeletingAccount ? "Excluindo…" : "Excluir minha conta"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </SidebarShell>
  );
}
