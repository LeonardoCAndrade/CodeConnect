const MAX_TERMS = 8;
const MAX_TERM_LENGTH = 40;

/**
 * Converte o texto digitado na busca em uma condição segura para CONTAINS/CONTAINSTABLE
 * do SQL Server: cada palavra vira um termo de prefixo ("reac*") e todos são obrigatórios.
 * Só letras e números passam, então operadores e aspas do usuário nunca chegam ao FTS.
 * Retorna undefined quando não há nada pesquisável.
 */
export function toFullTextQuery(text: string | undefined): string | undefined {
  const terms = extractTerms(text);
  if (terms.length === 0) {
    return undefined;
  }
  return terms.map((term) => `"${term}*"`).join(' AND ');
}

export function extractTerms(text: string | undefined): string[] {
  const words = text?.match(/[\p{L}\p{N}]+/gu) ?? [];
  const unique = new Set(
    words.map((word) => word.slice(0, MAX_TERM_LENGTH).toLowerCase()),
  );
  return [...unique].slice(0, MAX_TERMS);
}
