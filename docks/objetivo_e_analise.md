# Objetivo e Análise do Projeto

Data: 2026-04-21

## Objetivo

- Pegar o front-end React existente e criar um painel administrativo completo para o blog.
- Integrar (quando aplicável) automações com IA para auxiliar/automatizar a criação de posts (geração de texto, sugestões de título/excerpt, SEO, etc.).
- Preparar os arquivos completos (código-fonte + instruções) para deploy no servidor H2K.

## Resumo rápido do repositório

- Projeto: Vite + React + TypeScript + Tailwind.
- Scripts importantes: `dev` (vite), `build` (vite build), `preview`.
- Dependências principais encontradas:
  - `react`, `react-dom` (React 18)
  - `vite` + `@vitejs/plugin-react-swc`
  - `tailwindcss`, `postcss`, `autoprefixer`
  - `@supabase/supabase-js` (integração com Supabase)
  - `@tanstack/react-query`, `react-router-dom`

## Backend / integrações detectadas

- O front acessa Supabase via `src/integrations/supabase/client.ts` e `src/lib/cms.ts` (consultas a `posts`, `categories`, `site_content`).
- Há um `supabase/config.toml` e migrations em `supabase/migrations/` — indica que a fonte de dados oficial é Supabase.

## Inventário rápido (arquivos/locais relevantes)

- `package.json` — dependências e scripts.
- `src/` — código da aplicação:
  - `src/App.tsx`, `src/main.tsx` — bootstrap da app.
  - `src/pages/` — páginas públicas e admin (há `src/pages/admin/*`).
  - `src/components/` — componentes UI reutilizáveis.
  - `src/lib/cms.ts` — funções de acesso a conteúdo (usa Supabase).
  - `src/integrations/supabase/client.ts` — client supabase usando `VITE_` env vars.
- `supabase/` — `config.toml` e `migrations/`.

## Observações importantes

- Atualmente o front faz leituras/escritas via Supabase (client com `VITE_*` vars). Para um painel admin completo será necessário:
  - Um método seguro para operações de escrita: usar uma API servidor-side ou a `service_role` key do Supabase (NUNCA expor no cliente).
  - Autenticação/Autorização: criar fluxo de login para administradores (Supabase Auth ou provider próprio) e aplicar RLS (Row Level Security) ou checar roles no servidor.

## Proposta de arquitetura do painel admin

- Frontend admin: SPA React (poderia ser parte do mesmo repositório sob `src/pages/admin` ou uma app separada `admin/`).
  - Páginas: Login, Dashboard, Lista de Posts, Editor de Post (Markdown/WYSIWYG), Upload de Imagens, Categorias, Conteúdo do site, Usuários/Permissões.
  - Uploads: usar Supabase Storage (ou S3) com URLs assinadas para uploads seguros.
- Backend (recomendado): pequena API Node/Express ou Fastify hospedada no H2K que:
  - Armazena a `SUPABASE_SERVICE_KEY` (service role) para operações de criação/edição exclusivas do admin.
  - Expõe endpoints protegidos por autenticação (JWT) para o admin.
  - Integra com OpenAI (ou outro) para chamadas de IA sem expor chaves ao cliente.

Fluxo seguro: Admin UI (autenticado) → API no H2K (valida JWT/role) → Supabase (service role) / OpenAI (servidor)

## Integração com IA (opções e abordagem)

- Objetivo IA: gerar rascunhos de posts, sugerir títulos, meta descriptions, extrair trechos, otimizar SEO, criar tags e imagens (via DALL·E / imagem generativa) — tudo via prompts.
- Recomendações de segurança:
  - Fazer chamadas à API de IA a partir do servidor (H2K) usando a chave secreta.
  - Não incluir pacotes de IA cliente-side no bundle público.
- Exemplo de fluxo de geração de post:
  1. Admin clica em "Gerar rascunho IA" e fornece prompt/tópico.
  2. Front chama endpoint `/api/ai/generate-post` no H2K com user prompt e meta (categoria, tom, palavras-chave).
  3. Servidor chama OpenAI (ou outro) e retorna rascunho estruturado (title, excerpt, content, suggested tags).
  4. Admin revisa/edita e publica — servidor grava no Supabase usando `service_role`.
- Modelos/serviços sugeridos: OpenAI (GPT-4/4o/3.5), ou provedores compatíveis com API OpenAI. Se desejar offline, podemos olhar LLMs self-hosted (mais complexo).

## Deploy no H2K — notas práticas

- Build do front (public site + admin SPA):

```bash
npm install
npm run build
# artefato em dist/
```

- Variáveis de ambiente necessárias:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY` (para a parte pública que precisa apenas do client)
  - Para admin/server: `SUPABASE_SERVICE_KEY` (service role — guardar no servidor, NUNCA no cliente)
  - Para IA: `OPENAI_API_KEY` (no servidor)

- Opções de deploy no H2K:
  - Servir `dist/` como site estático (Nginx) e rodar a API Node.js como serviço separado (process manager ou container).
  - Criar um `Dockerfile` que constrói e serve a app com Nginx e roda a API (multi-service ou múltiplos containers).

## Entregáveis sugeridos (primeira entrega)

- `admin/` (ou `src/pages/admin` expandida) com CRUD para posts, categorias, uploads.
- API mínima em `server/` (Node) com endpoints:
  - `/auth/*` (login/refresh) — opcional se usar Supabase Auth direto
  - `/posts/*` (create/edit/delete) — usa `SUPABASE_SERVICE_KEY`
  - `/ai/generate-post` — chama OpenAI
- Documentação em `docks/objetivo_e_analise.md` (este arquivo)
- `docks/deploy_instructions.md` com passos de implantação (opcional)

## Próximos passos recomendados

2. Decidir se o painel admin ficará no mesmo repositório (`src/pages/admin`) ou será uma app separada (`admin/`).
3. Autenticação: definir fluxo (Supabase Auth ou JWT próprio).
4. Se concordar, eu posso:
   - Scaffold do admin (UI + rotas) e endpoints básicos no servidor H2K.
   - Implementar integração IA básica (endpoint server-side para gerar rascunho) e um botão no editor.

---

Se quiser, eu já inicio a scaffold do painel admin e preparo o `server/` com endpoints protegidos e a integração IA (fazendo commit dos arquivos prontos para você subir no H2K). Diga se prefere que o admin seja integrado ao `src/pages/admin` existente ou em um diretório `admin/` separado.
