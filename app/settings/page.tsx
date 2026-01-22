import { Sidebar } from "@/components/dashboard/sidebar";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-[260px_1fr]">
        <Sidebar />
        <main className="flex flex-col gap-8 bg-background px-8 py-10">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">
              Configurações
            </h1>
            <p className="text-sm text-muted-foreground">
              Atualize seu perfil e personalize suas preferências.
            </p>
          </header>

          <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">
                Informações do perfil
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Mantenha seus dados sempre atualizados.
              </p>

              <form className="mt-6 space-y-4">
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
                      name="nome"
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
                      name="email"
                      type="email"
                      placeholder="ana@email.com"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="telefone"
                      className="text-sm font-medium text-foreground"
                    >
                      Telefone
                    </label>
                    <Input
                      id="telefone"
                      name="telefone"
                      placeholder="(11) 91234-5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="cargo"
                      className="text-sm font-medium text-foreground"
                    >
                      Cargo
                    </label>
                    <Input
                      id="cargo"
                      name="cargo"
                      placeholder="Ex.: Analista financeiro"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="bio"
                    className="text-sm font-medium text-foreground"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Conte um pouco sobre sua rotina financeira."
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Salvar alterações</Button>
                </div>
              </form>
            </div>

            <div className="flex flex-col gap-6">
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

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Notificações
                    </p>
                    <label className="flex items-center gap-3 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        defaultChecked
                      />
                      Receber lembretes semanais de metas
                    </label>
                    <label className="flex items-center gap-3 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      Alertas de gastos acima do orçamento
                    </label>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground">
                  Segurança
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Controle seus acessos e dados sensíveis.
                </p>

                <div className="mt-6 space-y-3">
                  <Button variant="outline" className="w-full">
                    Alterar senha
                  </Button>
                  <Button variant="outline" className="w-full">
                    Gerenciar dispositivos
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
