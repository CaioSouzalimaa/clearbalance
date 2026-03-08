# ClearBalance — Guia de Padrões de UI

Este documento descreve todos os padrões visuais e de código do projeto. **Antes de criar qualquer nova página ou componente, leia este arquivo.** Seguir esses padrões garante consistência visual e facilidade de manutenção.

---

## 1. Tipografia (Tailwind)

### Escala de referência

| Elemento | Classes Tailwind obrigatórias | Notas |
|---|---|---|
| **Título de página (H1)** | `text-xl sm:text-2xl font-semibold text-foreground` | Sempre responsivo |
| **Título de seção / card (H2)** | `text-base sm:text-lg font-semibold text-foreground` | Cards, seções dentro da página |
| **Título de modal** | `text-base sm:text-lg font-semibold text-foreground` | Mesmo padrão do H2 |
| **Subtítulo / descrição de página** | `text-xs sm:text-sm font-medium text-muted-foreground` | Linha abaixo do H1 |
| **Subtítulo / descrição de seção** | `text-xs sm:text-sm font-medium text-muted-foreground` | Linha abaixo do H2 de cards |
| **Subtítulo / descrição de modal** | `text-xs sm:text-sm text-muted-foreground` | Sem `font-medium` em modais |
| **Label de formulário** | `text-xs sm:text-sm font-medium text-foreground` | Todo `<label>` e `<span>` que age como label |
| **Texto de corpo (parágrafo)** | `text-xs sm:text-sm text-muted-foreground` | Textos auxiliares |
| **Texto de valor / nome principal em card** | `text-sm font-semibold text-foreground` | Ex.: nome da meta, nome da categoria |
| **Texto de metadado em card** | `text-xs text-muted-foreground` | Data, contagem, info secundária |
| **Texto de botão primário/outline (padrão)** | `text-xs sm:text-sm` | Botões no header e nos modais |
| **Texto de botão em linha compacta (linhas de lista)** | `text-[10px]` | Botões Editar/Excluir dentro de linhas |
| **Badge / tag** | `text-xs font-semibold` | Ex.: tipo da categoria, status de transação |
| **Label de card de destaque (tipo SummaryCard)** | `text-[10px] sm:text-sm font-medium text-muted-foreground` | Cards de métricas no topo |
| **Valor de card de destaque** | `text-xs sm:text-2xl font-semibold text-foreground` | Valor numérico grande |
| **Input de texto explícito** | `text-xs sm:text-sm` | Quando precisar sobrescrever o padrão do componente |

### Regra geral de responsividade

> Sempre use o par `text-{menor} sm:text-{maior}`. O breakpoint `sm:` (640 px) é o principal.  
> **Nunca** defina um tamanho fixo sem variante `sm:` para elementos visíveis em ambas as telas — exceto em contextos compactos intencionais (`text-[10px]` para botões de linha) ou em `text-xs` puro para metadados.

---

## 2. Cores de texto

| Token | Uso |
|---|---|
| `text-foreground` | Títulos, labels, valores principais — qualquer texto que precisa de destaque máximo |
| `text-muted-foreground` | Subtítulos, descrições, metadados, textos secundários |
| `text-primary` | Links, badges de contagem, ícones de destaque, bordas ativas |
| `text-rose-500` | Ações destrutivas (Excluir, erro) |
| `text-white` | Texto sobre fundo sólido (`bg-primary`, FAB, botões destrutivos com `bg-red-600`) |
| `text-emerald-500/600` | Valores positivos, metas atingidas |

---

## 3. Ícones

### Duas fontes de ícones — atenção ao tipo

| Fonte | Tipo retornado | Como usar |
|---|---|---|
| `import { X } from "lucide-react"` | Componente React | Diretamente como JSX: `<X className="h-4 w-4" />` |
| `import { X } from "lucide"` | `IconNode` (array de dados) | **Somente** via wrapper: `<LucideIcon icon={X} className="h-4 w-4" />` |

**Regra:** `lib/icon-options.ts` usa `"lucide"`. Todos os ícones vindos de `iconOptions` ou `resolveIcon()` devem ser passados para `<LucideIcon>`. Nunca use `IconNode` diretamente como JSX — o TypeScript recusará.

### Wrapper LucideIcon

```tsx
import { LucideIcon } from "@/components/dashboard/sidebar";

<LucideIcon icon={MinhaIcone} className="h-4 w-4" aria-hidden />
```

### Tamanhos padrão de ícone

| Contexto | Tamanho |
|---|---|
| Dentro de botão compacto (h-7) | `h-3 w-3` |
| Dentro de botão padrão (h-8/h-9) | `h-3.5 w-3.5 sm:h-4 sm:w-4` |
| Ao lado de texto em header | `h-4 w-4` |
| FAB (floating action button) | `h-5 w-5 md:h-6 md:w-6` |
| Ícone de categoria em lista | `h-4 w-4 sm:h-5 sm:w-5` |
| Ícone em card de destaque | `h-3 w-3 sm:h-4 sm:w-4` |

---

## 4. Estrutura de página

### Layout padrão (dentro do shell)

Toda página de app usa `<SidebarShell>` como container raiz:

```tsx
export default function MinhaPage() {
  return (
    <SidebarShell>
      {/* 1. Header */}
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Subtítulo da página
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            Título da Página
          </h1>
        </div>
        <Button className="shrink-0 gap-1.5 text-xs sm:text-sm" onClick={...}>
          <LucideIcon icon={Plus} className="h-4 w-4" aria-hidden />
          Nova ação
        </Button>
      </header>

      {/* 2. Conteúdo: sections, cards, tabelas */}
    </SidebarShell>
  );
}
```

### Anatomy do header

- `flex items-center justify-between gap-3` no `<header>`
- À esquerda: `<div className="min-w-0">` com subtítulo + H1
- À direita: botão com `shrink-0` para nunca ser espremido em mobile
- O botão fica **inline** com o título — não em linha separada

---

## 5. Floating Action Button (FAB)

Exibido quando o usuário rola além do header (threshold: `scrollY > 120`).

### Classes fixas

```tsx
const [showFab, setShowFab] = useState(false);

useEffect(() => {
  const onScroll = () => setShowFab(window.scrollY > 120);
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, []);

<button
  type="button"
  aria-label="Nova ação"
  onClick={abrirModal}
  className={`fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 md:bottom-8 md:right-8 md:h-14 md:w-14 ${
    showFab ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
  }`}
>
  <LucideIcon icon={Plus} className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
</button>
```

### Regras do FAB

- Sempre `text-white` no botão (não `text-primary-foreground`)
- Posição mobile: `bottom-24 right-4` (acima da barra de navegação inferior)
- Posição desktop: `bottom-8 right-8`
- Ícone sempre via `<LucideIcon>` (ícones vêm de `"lucide"`)
- Transição: `opacity` + `translate-y` + `pointer-events-none` quando oculto

---

## 6. Modais

### Estrutura padrão de modal

```tsx
{/* Backdrop + centralização */}
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
  <div className="w-full max-w-md rounded-xl bg-surface p-4 sm:p-6 shadow-lg">

    {/* Cabeçalho do modal */}
    <h2 className="text-base sm:text-lg font-semibold text-foreground">
      Título do Modal
    </h2>
    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
      Descrição breve do que o modal faz.
    </p>

    {/* Formulário */}
    <form className="mt-6 space-y-4">

      {/* Campo padrão */}
      <div className="space-y-2">
        <label htmlFor="campo" className="text-xs sm:text-sm font-medium text-foreground">
          Nome do campo
        </label>
        <Input id="campo" ... />
      </div>

      {/* Rodapé de ações */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={fechar} className="flex-1 text-xs sm:text-sm">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 text-xs sm:text-sm">
          Salvar
        </Button>
      </div>
    </form>

  </div>
</div>
```

---

## 7. Cards de seção

```tsx
<section className="rounded-xl sm:rounded-2xl border border-border bg-surface p-3 sm:p-6 shadow-sm">
  <div>
    <h2 className="text-base sm:text-lg font-semibold text-foreground">
      Título da Seção
    </h2>
    <p className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground">
      Descrição da seção.
    </p>
  </div>
  {/* conteúdo */}
</section>
```

### Bordas e arredondamento

- Mobile: `rounded-xl`
- Desktop: `sm:rounded-2xl`
- Padding mobile: `p-3`
- Padding desktop: `sm:p-6`
- Sempre: `border border-border bg-surface shadow-sm`

---

## 8. Botões de ação em linhas de lista (Editar / Excluir)

Para botões compactos dentro de linhas de lista (categorias, metas, transações):

```tsx
{/* Editar */}
<Button
  type="button"
  variant="outline"
  className="border-border h-7 px-2.5 text-[10px]"
  onClick={...}
>
  Editar
</Button>

{/* Excluir */}
<Button
  type="button"
  variant="outline"
  className="border-border h-7 px-2.5 text-[10px] text-rose-500 hover:bg-rose-500/10"
  onClick={...}
>
  Excluir
</Button>
```

---

## 9. Badges / Tags de tipo

```tsx
<span
  className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold leading-none ${
    tipo === "INCOME"
      ? "border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
      : tipo === "EXPENSE"
        ? "border-rose-500 text-rose-600 dark:border-rose-400 dark:text-rose-400"
        : "border-border text-muted-foreground"
  }`}
>
  {tipo === "INCOME" ? "Entrada" : tipo === "EXPENSE" ? "Saída" : "Ambos"}
</span>
```

- Estilo: **outlined** (apenas borda + texto, sem background fill)
- Peso: `font-semibold` (nunca `font-medium`)

---

## 10. Cards de métricas (SummaryCard / highlight cards)

```tsx
<div className="rounded-xl sm:rounded-2xl border border-border bg-surface p-2 sm:p-5 shadow-sm min-w-0">
  <div className="flex items-center justify-between gap-1">
    <p className="text-[10px] sm:text-sm font-medium text-muted-foreground truncate">
      Label da métrica
    </p>
    {/* Ícone à direita */}
    <span className="flex h-6 w-6 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <LucideIcon icon={MeuIcone} className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden />
    </span>
  </div>
  <p className="mt-1 sm:mt-4 text-xs sm:text-2xl font-semibold text-foreground truncate">
    Valor
  </p>
</div>
```

---

## 11. Sistema de ícones disponíveis

Centralizado em `lib/icon-options.ts` (~245 ícones):

- Use `iconOptions` para renderizar o picker de ícones
- Use `resolveIcon(iconId: string)` para obter o `IconNode` a partir do ID salvo no banco
- Passe sempre para `<LucideIcon icon={resolveIcon(id)} className="..." />`

---

## 12. Checklist para nova página

Antes de finalizar uma nova página, verifique:

- [ ] Usa `<SidebarShell>` como wrapper raiz
- [ ] Header com H1 `text-xl sm:text-2xl font-semibold text-foreground`
- [ ] Subtítulo do header `text-xs sm:text-sm font-medium text-muted-foreground`
- [ ] Botão de ação no header tem `shrink-0 gap-1.5 text-xs sm:text-sm`
- [ ] FAB adicionado se a página tem lista rolável (scroll > 120px)
- [ ] FAB com `text-white` e `<LucideIcon>` para o ícone
- [ ] Todos os H2 de seção/card usam `text-base sm:text-lg font-semibold text-foreground`
- [ ] Todos os subtítulos de seção usam `font-medium text-muted-foreground`
- [ ] Todos os labels de formulário usam `text-xs sm:text-sm font-medium text-foreground`
- [ ] Modais têm título `text-base sm:text-lg`, subtítulo sem `font-medium`
- [ ] Botões compactos de lista usam `h-7 px-2.5 text-[10px]`
- [ ] Badges de tipo usam `text-xs font-semibold` com estilo outlined
- [ ] Ícones de `"lucide"` passados via `<LucideIcon>`, nunca diretamente como JSX
- [ ] Nenhum tamanho de texto fixo sem variante `sm:` (exceto `text-[10px]` e `text-xs` intencionais)
- [ ] `npx tsc --noEmit` passa sem erros

---

## 13. Autenticação (páginas fora do shell)

As páginas `/login` e `/register` são intencionalmente diferentes:

- Usam layout centralizado próprio `(auth)/layout.tsx`
- Títulos com `font-bold` em vez de `font-semibold` (estilo de marca)
- Não usam `<SidebarShell>`, FAB nem os padrões de seção acima

---

_Última atualização: março 2026_
