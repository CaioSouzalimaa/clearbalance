import React from "react";

interface Transaction {
  id: number;
  description: string;
  category: string;
  date: string;
  amount: string;
  type: "entrada" | "saida";
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Lançamentos</h2>
          <p className="text-sm text-muted-foreground">
            Confira suas movimentações recentes.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {transactions.length} itens
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-background text-left text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-semibold">Descrição</th>
              <th className="px-6 py-3 font-semibold">Categoria</th>
              <th className="px-6 py-3 font-semibold">Data</th>
              <th className="px-6 py-3 font-semibold text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="px-6 py-4 font-medium text-foreground">
                  {item.description}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {item.category}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {item.date}
                </td>
                <td
                  className={`px-6 py-4 text-right font-semibold ${
                    item.type === "entrada" ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {item.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
