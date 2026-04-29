# Inventário Detalhado do Repositório

Data: 2026-04-21

## Resumo
- Projeto: Vite + React + TypeScript + Tailwind.
- Backend atual: Supabase (DB, Auth, Storage).
- Estado atual: Frontend completo com painel admin integrado em `src/pages/admin` realizando CRUD direto via `supabase` client.

## Arquivos/pastas chave
- `package.json`, `vite.config.ts` — scripts e plugins.
- `src/` — app React (páginas públicas + admin integrado).
- `src/pages/admin/*` — painel admin existente (Login, Posts, PostEditor, Categories, SiteContent, Users, Dashboard).
- `src/components/admin/*` — `AdminLayout.tsx`, `ImageUpload.tsx` (upload para Supabase Storage).
- `src/integrations/supabase/*` — client e tipos gerados (`client.ts`, `types.ts`).
- `supabase/migrations/*` — migrations com schema e políticas (RLS e bucket `cms-images`).
- `supabase/config.toml` — project_id.
- `.env` — contém variáveis `VITE_SUPABASE_*` (ATENÇÃO: foi encontrado arquivo `.env` no repositório; contém chaves/URLs e deve ser tratado como sensível).
- `docks/objetivo_e_analise.md` — análise inicial já gerada.

## Páginas Admin (localização)
- `src/pages/admin/Login.tsx`
- `src/pages/admin/Dashboard.tsx`
- `src/pages/admin/Posts.tsx`
- `src/pages/admin/PostEditor.tsx`
- `src/pages/admin/Categories.tsx`
- `src/pages/admin/SiteContent.tsx`
- `src/pages/admin/Users.tsx`

## Componentes importantes
- `src/components/admin/AdminLayout.tsx` — layout, navegação, proteção por role via `useAuth`.
- `src/components/admin/ImageUpload.tsx` — envia arquivos para Supabase Storage (bucket `cms-images`) e retorna URL pública.
- `src/components/ui/*` — biblioteca de componentes UI reutilizáveis (radix + estilos).

## Integrações detectadas
- Supabase
  - `src/integrations/supabase/client.ts` — client criado usando `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
  - Uso de `supabase.auth` para autenticação (`useAuth`), `supabase.from("posts"/"categories"/"site_content"/"user_roles")` para CRUD.
  - Storage: bucket `cms-images` (políticas públicas e regras RLS para uploads por `admin`/`editor`).
  - Migrations definem tabelas e RLS (função `has_role`, políticas de leitura/escrita para roles).

- IA
  - Não foram encontradas referências a OpenAI, modelos LLM, ou endpoints de IA no código atual.

## Observações técnicas relevantes
- Editor de posts: atualmente `PostEditor.tsx` usa um `<textarea>` para o campo `content` e armazena HTML (campo `content` no DB). Não há editor WYSIWYG/Markdown integrado.
- Uploads: `ImageUpload` usa `supabase.storage.from('cms-images').upload(...)` e `getPublicUrl(path)` — uploads diretos do cliente para o bucket público.
- Autorização/Segurança: RLS e função `public.has_role` estão presentes nas migrations; o frontend depende de `supabase.auth` e do mapeamento em `user_roles` para permitir ações do admin/editor.
- Segredos no repositório:
  - Existe um arquivo `.env` com variáveis `VITE_SUPABASE_*` presentes no repositório. Recomenda-se remover esse arquivo do git, adicionar a `.gitignore` e rotacionar as chaves (especialmente `SERVICE` keys, se houver).

## Conclusão do inventário
- O painel admin já funciona para CRUD básico (posts, categorias, conteúdo do site, gerenciamento de papéis) e uploads de imagem.
- Falta: backend server dedicado para operações server-side seguras (ex.: uso de `SUPABASE_SERVICE_KEY` e integração com IA), editor rico (WYSIWYG/Markdown), e automações IA.


---
Arquivo gerado automaticamente: `docks/inventario.md` — rever e pedir ajustes se quiser mais detalhe em áreas específicas.
