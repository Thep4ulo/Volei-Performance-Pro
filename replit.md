# Vôlei Performance Pro

Plataforma SaaS para clubes de voleibol acompanharem performance técnica, carga física e análise tática em um único workspace.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/volei-performance-pro/src/App.tsx` — shell, rotas e telas do produto.
- `artifacts/volei-performance-pro/src/index.css` — tokens visuais e componentes utilitários.
- `artifacts/api-server/src/routes/volei.ts` — rotas e dados iniciais da plataforma.
- `lib/api-spec/openapi.yaml` — contrato único da API.
- `lib/db/src/schema/volei.ts` — tabelas PostgreSQL do domínio.

## Architecture decisions

- O primeiro recorte usa o PostgreSQL gerenciado do workspace, com seed idempotente para o ambiente de demonstração.
- A API mantém o prefixo `/api`; o frontend usa os hooks gerados a partir do OpenAPI.
- O frontend foi estruturado para permitir conexão posterior a um provedor de autenticação sem trocar o modelo de papéis exibido em Configurações.

## Product

Dashboard com métricas e atividade recente, CRUD de atletas, perfis individuais, cadastro de partidas, sessões de treino com carga/fadiga, análise tática por zonas, comparação de atletas, relatórios e configurações de clube/equipe/acesso.

## User preferences

O produto deve manter comunicação e interface em português, com aparência premium e foco em decisão esportiva.

## Gotchas

Após alterar o contrato OpenAPI, rode o codegen antes de usar novos hooks ou schemas.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
