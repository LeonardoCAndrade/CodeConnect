const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Colunas uniqueidentifier fazem o SQL Server falhar na conversão de valores fora
// do formato; os repositórios checam antes e tratam como "não encontrado".
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

// O SQL Server devolve uniqueidentifier em maiúsculas; a API expõe minúsculas.
export function normalizeUuid(value: string): string {
  return value.toLowerCase();
}
