import { Button } from "@/components/ui/button";

export const DashboardHeader = () => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-500">Bem-vinda de volta</p>
        <h1 className="text-2xl font-semibold text-foreground">
          Visão geral financeira
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="border-border text-gray-600">
          Exportar
        </Button>
        <Button>Nova transação</Button>
      </div>
    </header>
  );
};
