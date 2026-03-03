import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  CalendarDays,
  CheckCircle2,
  LayoutDashboard,
  PieChart,
  Repeat2,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const features = [
  {
    icon: LayoutDashboard,
    title: "Visão geral completa",
    desc: "Acompanhe entradas, saídas, saldo e montante acumulado em um único painel.",
  },
  {
    icon: Repeat2,
    title: "Lançamentos recorrentes",
    desc: "Registre transações fixas ou variáveis e veja projeções automáticas para os próximos meses.",
  },
  {
    icon: PieChart,
    title: "Distribuição por categoria",
    desc: "Veja exatamente para onde vai cada centavo com gráficos de distribuição por categoria.",
  },
  {
    icon: Target,
    title: "Gestão de metas",
    desc: "Crie objetivos financeiros, registre aportes e acompanhe o progresso em tempo real.",
  },
  {
    icon: BarChart2,
    title: "Variação histórica",
    desc: "Analise a evolução das suas receitas e despesas ao longo dos últimos meses.",
  },
  {
    icon: CalendarDays,
    title: "Calendário de transações",
    desc: "Visualize todos os seus lançamentos organizados por dia em um calendário interativo.",
  },
];

const steps = [
  {
    n: "01",
    title: "Crie sua conta",
    desc: "Cadastre-se gratuitamente em segundos. Sem cartão de crédito.",
  },
  {
    n: "02",
    title: "Registre suas finanças",
    desc: "Lance entradas, saídas e transações recorrentes com facilidade.",
  },
  {
    n: "03",
    title: "Defina suas metas",
    desc: "Estabeleça objetivos e acompanhe quanto falta para atingi-los.",
  },
  {
    n: "04",
    title: "Tome decisões melhores",
    desc: "Com dados claros, você gasta menos onde importa menos e investe onde importa mais.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Image
            src="/logo.png"
            alt="ClearBalance"
            width={140}
            height={36}
            className="object-contain"
          />
          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a
              href="#funcionalidades"
              className="transition-colors hover:text-foreground"
            >
              Funcionalidades
            </a>
            <a
              href="#como-funciona"
              className="transition-colors hover:text-foreground"
            >
              Como funciona
            </a>
            <Link
              href="/login"
              className="transition-colors hover:text-foreground"
            >
              Entrar
            </Link>
            <Link href="/login">
              <Button className="h-auto gap-2 px-5 py-2 text-sm">
                Criar conta grátis <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <Link href="/login" className="md:hidden">
            <Button className="text-sm py-1 px-4">Entrar</Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="bg-primary px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div className="space-y-7 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium">
              <ShieldCheck className="h-4 w-4" />
              100% gratuito e seguro
            </div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Clareza financeira ao seu alcance
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-white/85">
              Controle gastos, defina metas e entenda para onde vai o seu
              dinheiro — tudo em uma plataforma simples, visual e gratuita.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/login">
                <Button className="gap-2 bg-surface px-8 py-5 text-primary hover:bg-muted">
                  Começar agora <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#funcionalidades">
                <Button
                  variant="outline"
                  className="border-white/50 px-8 py-5 text-white hover:bg-white/10"
                >
                  Ver funcionalidades
                </Button>
              </a>
            </div>
            <ul className="flex flex-col gap-2 pt-2 text-sm text-white/80">
              {[
                "Sem anúncios",
                "Sem cartão de crédito",
                "Sem limites de lançamentos",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-white/90" />{" "}
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Dashboard wireframe */}
          <div className="flex justify-center">
            <div className="w-full max-w-lg rounded-xl border border-white/20 bg-surface shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
              <div className="flex items-center gap-1.5 rounded-t-xl bg-muted px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <span className="ml-2 h-3 w-40 rounded bg-border" />
              </div>
              <div className="space-y-4 p-5">
                <div className="grid grid-cols-3 gap-3">
                  {["Entradas", "Saídas", "Saldo"].map((label, i) => (
                    <div
                      key={label}
                      className="space-y-1 rounded-lg border border-border bg-muted p-3"
                    >
                      <div className="h-2 w-12 rounded bg-border" />
                      <div
                        className={`h-4 w-16 rounded ${i === 0 ? "bg-primary/60" : i === 1 ? "bg-rose-300" : "bg-primary"}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-border bg-muted p-3">
                  <div className="mb-2 h-2 w-24 rounded bg-border" />
                  <div className="flex h-20 items-end gap-1.5">
                    {[35, 60, 45, 80, 55, 90, 70].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-primary/70"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20" />
                        <div className="space-y-1">
                          <div className="h-2 w-20 rounded bg-border" />
                          <div className="h-1.5 w-12 rounded bg-border/60" />
                        </div>
                      </div>
                      <div
                        className={`h-2 w-14 rounded ${i === 2 ? "bg-rose-300" : "bg-primary/50"}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="funcionalidades" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Tudo o que você precisa para organizar as suas finanças
            </h2>
            <p className="mt-4 text-muted-foreground">
              Ferramentas simples e visuais para quem quer sair do vermelho e
              construir um futuro sólido.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="como-funciona" className="bg-muted px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Como funciona
            </h2>
            <p className="mt-4 text-muted-foreground">
              Comece em minutos. Sem complicação.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-sm">
                  {n}
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl rounded-2xl bg-primary p-12 text-center text-white shadow-lg">
          <TrendingUp className="mx-auto mb-6 h-10 w-10 text-white/80" />
          <h2 className="text-3xl font-bold">
            Pronto para ter clareza financeira?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/80">
            Crie sua conta gratuitamente e comece a transformar a sua relação
            com o dinheiro hoje mesmo.
          </p>
          <Link href="/login">
            <Button className="mt-8 gap-2 bg-surface px-10 py-5 text-lg text-primary hover:bg-muted">
              Criar minha conta gratuita <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <Image
            src="/logo.png"
            alt="ClearBalance"
            width={110}
            height={30}
            className="object-contain opacity-70"
          />
          <p>
            © {new Date().getFullYear()} ClearBalance. Todos os direitos
            reservados.
          </p>
          <div className="flex gap-6">
            <Link
              href="/login"
              className="transition-colors hover:text-foreground"
            >
              Entrar
            </Link>
            <Link
              href="/login"
              className="transition-colors hover:text-foreground"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
