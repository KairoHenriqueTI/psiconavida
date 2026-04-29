Contributing to Psiconavida

Short guide for contributors

1. Code style & linting
- This project uses TypeScript and standard React patterns. Run `npm run lint` (root) before opening a PR.

2. How to run locally
- See README.md for full development quick-start (install root and server deps, start Postgres, run frontend and backend).

3. Adding secrets
- Never commit `.env` files, API keys, or other secrets. Use `.env.template` to document required variables.

4. Adding Skills / Agents
- If you add Claude/VoltAgent skills, keep them isolated under `.claude/skills/` or a dedicated repository to avoid adding third-party code to the main history.

5. Pull request process
- Create feature branches, open a PR against `main` with a concise description and testing instructions.

If you want, I can add a GitHub Action that runs lint and builds both frontend and server on PRs.
