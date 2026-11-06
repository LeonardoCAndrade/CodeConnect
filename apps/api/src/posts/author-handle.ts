/**
 * Identificador exibido do autor (@ana.souza), derivado do nome, já que o
 * cadastro não tem nome de usuário. Não é único nem usado para buscar usuários.
 */
export function toHandle(name: string): string {
  const handle = name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  return handle || 'usuario';
}
