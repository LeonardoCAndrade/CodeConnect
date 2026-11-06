import { toFullTextQuery } from './full-text-query.js';

describe('toFullTextQuery', () => {
  it('transforma cada palavra em um termo de prefixo obrigatório', () => {
    expect(toFullTextQuery('React hooks')).toBe('"react*" AND "hooks*"');
  });

  it('mantém acentos e números e remove duplicatas', () => {
    expect(toFullTextQuery('Acessibilidade  acessibilidade CSS3')).toBe(
      '"acessibilidade*" AND "css3*"',
    );
    expect(toFullTextQuery('ação')).toBe('"ação*"');
  });

  it('descarta operadores e aspas que o usuário digitar', () => {
    expect(toFullTextQuery('"react" OR NEAR(x) *')).toBe(
      '"react*" AND "or*" AND "near*" AND "x*"',
    );
  });

  it('retorna undefined quando não há nada pesquisável', () => {
    expect(toFullTextQuery(undefined)).toBeUndefined();
    expect(toFullTextQuery('   ')).toBeUndefined();
    expect(toFullTextQuery('!!! ***')).toBeUndefined();
  });

  it('limita a quantidade e o tamanho dos termos', () => {
    const many = Array.from({ length: 12 }, (_, i) => `termo${i}`).join(' ');
    expect(toFullTextQuery(many)?.split(' AND ')).toHaveLength(8);
    expect(toFullTextQuery('a'.repeat(100))).toBe(`"${'a'.repeat(40)}*"`);
  });
});
