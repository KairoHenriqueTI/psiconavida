# Recomendações e Próximos Passos

Data: 2026-04-21

## Prioridade imediata (segurança)
- Remover o arquivo `.env` do repositório e adicioná-lo em `.gitignore`.
  - Comandos sugeridos:

```bash
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: remove .env and add to .gitignore"
```

- Rotacionar as chaves encontradas (provisionar novas no painel do provedor atual) e atualizar variáveis no H2K.
- Certificar que a `SUPABASE_SERVICE_KEY` (service role) nunca fique no bundle cliente.

## Arquitetura recomendada para painel admin + IA
1. Preferência: manter o admin integrado em `src/pages/admin` (menos overhead). Alternativa: separar `admin/` se quiser deploy distinto.
2. Criar um pequeno backend em `server/` (Node + Fastify/Express) hospedado no H2K com endpoints protegidos:
   - `POST /api/posts` (create/edit/delete) — usa `SUPABASE_SERVICE_KEY` no servidor para operações seguras.
   - `POST /api/ai/generate-post` — chama OpenAI (ou similar) usando `OPENAI_API_KEY` no servidor e retorna rascunho estruturado.
   - `POST /api/uploads/signed-url` — opcional: gerar URLs assinadas para upload direto (se optar por não expor upload direto do cliente).
3. Autenticação entre frontend e servidor:
   - Validar o JWT do Supabase enviado no header `Authorization: Bearer <token>`; o servidor pode verificar com Supabase Admin ou chamando `supabase.auth.getUser()`.
4. Editor de conteúdo:
   - Integrar TipTap (recomendado) ou React-Quill para edição com suporte a Markdown/HTML.
   - Permitir salvar como Markdown e/ou HTML; considerar converter para HTML ao gravar, ou armazenar Markdown e renderizar no frontend.
5. IA (fluxo seguro):
   - Endpoint server-side `/api/ai/generate-post` recebe prompt + contexto (categoria, tom) e retorna `title`, `excerpt`, `content` (markdown), `suggested_tags`, `image_prompt`.
   - No editor, adicionar botão "Gerar com IA" que abre modal para prompt e insere resultado no formulário.

## Deploy no H2K
- Opções:
  - Deploy estático para frontend (`dist/`) + serviço Node separado para `server/`.
  - Docker: multi-stage build (frontend build + Nginx serve) e serviço Node (ou container único com process manager).
- Variáveis de ambiente a configurar no H2K:
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (frontend)
  - `SUPABASE_SERVICE_KEY` (server)
  - `OPENAI_API_KEY` (server)
  - Outras: `NODE_ENV`, `PORT`, `SUPABASE_PROJECT_ID` (se necessário)

## Entregáveis que posso gerar para você (posso começar agora)
- Scaffold `server/` com endpoints mínimos (`/api/posts`, `/api/ai/generate-post`) + README e `Dockerfile`.
- Atualizar `PostEditor` para adicionar botão "Gerar com IA" e integração com o endpoint.
- Trocar textarea por editor TipTap (ou React-Quill) e converter conteúdo para Markdown/HTML conforme preferência.
- Script de deploy para H2K e `env.template` com variáveis necessárias.

## Estimativa de tempo (ordem de grandeza)
- Limpeza de segredos & CI básico: 0.5–1h
- Scaffold do `server/` + endpoints básicos: 3–6h
- Integração IA (server + editor UI): 2–4h
- Editor WYSIWYG/Markdown: 2–6h (depende de funcionalidades)
- Docker + deploy H2K: 1–2h

## Perguntas para você
1. Confirma que prefere manter o admin em `src/pages/admin` ou prefere `admin/` separado? 
2. Você tem acesso aos segredos (H2K, Supabase, OpenAI)? Quer que eu adicione placeholders e instruções para você preencher no H2K?
3. Quer que eu comece scaffold do `server/` e do botão IA agora? (Posso committar os arquivos preparados para subir no H2K.)

---
Arquivo gerado automaticamente: `docks/recomendacoes.md`. Diga qual item quer priorizar que eu começo a implementar.
