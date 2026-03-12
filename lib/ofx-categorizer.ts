/**
 * Keyword-based heuristic categorizer for OFX transactions.
 * Matches the transaction description against known keyword patterns to suggest
 * a category name. Falls back to "Outros" when nothing matches.
 */

interface CategoryRule {
  pattern: RegExp;
  category: string;
}

const RULES: CategoryRule[] = [
  {
    pattern: /alimenta|supermercado|mercado|padaria|restaurante|lanchonete|ifood|rappi|delivery|snack|mc donalds|mcdonalds|burger|pizza|sushi/i,
    category: "Alimentação",
  },
  {
    pattern: /uber|99pop|taxi|táxi|onibus|ônibus|metro|metrô|gasolina|combustivel|combustível|posto|estacionamento|pedágio|pedagio|passagem|bilhete único|bilhete unico/i,
    category: "Transporte",
  },
  {
    pattern: /farmacia|farmácia|hospital|médico|medico|clínica|clinica|plano.?saude|plano.?saúde|unimed|amil|hapvida|sulamerica|dental|laboratorio|laboratório/i,
    category: "Saúde",
  },
  {
    pattern: /netflix|spotify|prime video|hbo|disney|cinema|teatro|show|ingresso|jogo|game|steam|playstation|xbox|amazon prime/i,
    category: "Lazer",
  },
  {
    pattern: /escola|faculdade|universidade|curso|alura|udemy|coursera|mensalidade|matricula|matrícula|livro|material escolar/i,
    category: "Educação",
  },
  {
    pattern: /aluguel|condominio|condomínio|iptu|água|agua|luz|energia|internet|telefone|celular|plano.?cel|gás|gas|limpeza|móveis|moveis/i,
    category: "Moradia",
  },
  {
    pattern: /salário|salario|pagamento|holerite|folha|contra.?cheque|prolabore|pró-labore/i,
    category: "Salário",
  },
  {
    pattern: /freelance|autônomo|autonomo|prestação.?serviço|prestacao.?servico|nota.?fiscal|nf-e/i,
    category: "Freelance",
  },
];

const FALLBACK_CATEGORY = "Outros";

/**
 * Given a transaction description, returns the best-matching category name.
 */
export function categorize(description: string): string {
  for (const rule of RULES) {
    if (rule.pattern.test(description)) {
      return rule.category;
    }
  }
  return FALLBACK_CATEGORY;
}
