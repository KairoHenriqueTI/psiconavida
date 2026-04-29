# Migração incremental do Supabase para Next.js + Prisma

Objetivo: extrair dados e arquivos do Supabase e migrar incrementalmente para o backend Next.js usando Prisma (mantendo PostgreSQL).

Passos recomendados (ordenados):

1. Exportar dump do Supabase
   - Obtenha a connection string Postgres do painel Supabase (ROLE com permissões de leitura).
   - Localmente execute:

```bash
cd server
SUPABASE_DB_URL="postgres://USER:PASS@HOST:PORT/DATABASE" ./scripts/export_supabase_db.sh ./dumps/supabase_dump.sqlc
```

2. Baixar arquivos do Storage (images)
   - Use `supabase` CLI or `aws s3 sync` (se o storage providenciar S3 compat). Exemplo com `supabase` CLI:

```bash
# login supabase
supabase login
supabase storage download --bucket cms-images --prefix "" --output ./public/uploads/
```

3. Importar dump para ambiente local Postgres

```bash
cd server
LOCAL_DATABASE_URL=postgresql://pnv_user:pnv_pass@localhost:5433/pnv_db ./scripts/import_to_local.sh ./dumps/supabase_dump.sqlc
```

4. Introspecionar / ajustar schema Prisma
   - Se desejar manter esquema Supabase idêntico, use `npx prisma db pull` para introspecção e revisar `schema.prisma`.
   - Alternativamente, ajustar `prisma/schema.prisma` (já criado) e gerar/apply migrations para casar com dados.

5. Mapear dados específicos e scripts de transformação
   - Users: senhas do Supabase não são portáveis. Recomendado: manter users apenas para referência e ativar NextAuth Magic Link para login.
   - user_roles / app_role: migrar valores para tabela `User.role` no Prisma.
   - Posts: campos `content`/`slug`/`image` devem mapear diretamente.

6. Atualizar o backend Next.js para apontar ao DB local e testar endpoints CRUD.

7. Atualizar frontend admin incrementalmente:
   - Substituir chamadas `supabase.from(...)` por fetch para os endpoints `/api/posts`, `/api/uploads`, etc.
   - Trocar auth do front para NextAuth (ou manter Supabase Auth temporariamente e validar JWTs no backend).

8. Testes e verificação de integridade de dados.

9. Remoção final do Supabase client do frontend e limpeza de dependências.

Observações:
- Arquivos em `public/uploads/` dependem de persistência no ambiente de produção (H2K). Verificar se H2K mantém filesystem persistente; caso contrário usar S3/MinIO.
- Sempre fazer backup antes de aplicar migrações em produção.
