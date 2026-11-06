-- Índice full-text da busca do feed (título e descrição dos posts).
-- O Prisma não modela índices full-text, então esta migration é escrita à mão.
-- CREATE FULLTEXT CATALOG/INDEX não podem rodar dentro de uma transação de
-- usuário: por isso, diferente das migrations geradas, não há BEGIN TRAN.
-- Requer o componente Full-Text Search (imagem docker/mssql).

-- LANGUAGE 1046 usa o separador de palavras do português (Brasil).
-- STOPLIST = OFF indexa todas as palavras, para que buscas com termos comuns
-- (por exemplo, "de") não fiquem vazias.
-- CHANGE_TRACKING AUTO atualiza o índice automaticamente após inserções e alterações.
CREATE FULLTEXT CATALOG [codeconnect_ft];

CREATE FULLTEXT INDEX ON [dbo].[posts] (
    [title] LANGUAGE 1046,
    [body] LANGUAGE 1046
)
KEY INDEX [posts_pkey] ON [codeconnect_ft]
WITH CHANGE_TRACKING AUTO, STOPLIST = OFF;
