import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* --- NAVBAR --- */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Image
          src="/logo.png"
          alt="ClearBalance Logo"
          width={150}
          height={40}
          className="object-contain"
        />
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#" className="hover:text-brand-teal transition-colors">
            Entrar
          </Link>
          <Link href="#" className="hover:text-brand-teal transition-colors">
            Funcionalidades
          </Link>
          <Link href="#" className="hover:text-brand-teal transition-colors">
            Comunidade
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              className="py-2 h-auto text-xs border-border"
            >
              Cadaste-se
            </Button>
          </Link>
          <Button className="bg-primary py-2 h-auto text-xs px-4">
            Download App
          </Button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="bg-primary py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Sua jornada para a clareza financeira começa aqui
            </h1>
            <p className="text-lg text-white/90 max-w-md">
              Assuma o controle dos seus gastos, invista com sabedoria e
              construa seu futuro financeiro com o ClearBalance.
            </p>
            <div className="flex gap-4 pt-4">
              <Button className="bg-surface text-primary hover:bg-muted px-8">
                Começar Grátis
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8"
              >
                Saiba Mais
              </Button>
            </div>
          </div>
          <div className="relative flex justify-center">
            {/* Representação do Mockup do Dashboard */}
            <div className="w-full max-w-125 bg-surface rounded-lg shadow-2xl p-2 border border-white/20 overflow-hidden transform md:rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="bg-muted rounded-t-md h-6 w-full flex items-center px-2 gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <div className="p-4 bg-surface space-y-4">
                <div className="h-4 w-1/3 bg-border rounded" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-12 bg-teal-50 rounded" />
                  <div className="h-12 bg-teal-50 rounded" />
                  <div className="h-12 bg-teal-50 rounded" />
                </div>
                <div className="h-32 w-full bg-muted rounded-md border border-dashed border-border flex items-end p-2 gap-1">
                  <div className="w-full bg-primary/40 h-[40%]" />
                  <div className="w-full bg-primary/60 h-[70%]" />
                  <div className="w-full bg-primary h-[50%]" />
                  <div className="w-full bg-primary/80 h-[90%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-foreground mb-16">
          Como o ClearBalance funciona?
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              id: 1,
              title: "Conecte suas contas",
              desc: "Sincronize bancos e cartões automaticamente.",
              icon: "12",
            },
            {
              id: 2,
              title: "Visualize seus gastos",
              desc: "Gráficos intuitivos para entender sua vida.",
              icon: "📊",
            },
            {
              id: 3,
              title: "Comunidade e FIIs",
              desc: "Troque experiências e aprenda sobre fundos.",
              icon: "🤝",
            },
            {
              id: 4,
              title: "Invista e colha",
              desc: "Planeje sua liberdade financeira a longo prazo.",
              icon: "📈",
            },
          ].map((item) => (
            <div key={item.id} className="text-center space-y-4 group">
              <div className="w-16 h-16 bg-[#F0F7F6] text-primary rounded-full flex items-center justify-center mx-auto text-xl font-bold group-hover:bg-primary group-hover:text-white transition-all">
                {item.icon}
              </div>
              <h3 className="font-bold text-foreground">
                {item.id}. {item.title}
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto bg-primary rounded-2xl p-12 text-center text-white space-y-6">
          <h2 className="text-3xl font-bold">
            Pronto para ter clareza financeira?
          </h2>
          <p className="text-white/80 max-w-lg mx-auto">
            Junte-se aos milhares de usuários que transformaram suas vidas
            financeiras com nossa plataforma.
          </p>
          <Button className="bg-surface text-primary hover:bg-muted px-10 py-6 text-lg">
            Criar minha conta gratuita
          </Button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 text-center text-foreground text-xs border-t border-border">
        <p>© 2025 ClearBalance. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
