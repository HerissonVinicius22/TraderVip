# Trader VIP

Projeto full‑stack Express + React que usa Supabase como banco de dados.

## Como rodar localmente
```bash
npm install
npm run dev   # inicia o servidor Express + Vite dev
```

## Build
```bash
npm run build   # gera a pasta dist com o bundle estático e o server compilado
npm start       # roda o servidor a partir de `dist/server.cjs`
```

## Deploy no Vercel
1. Conecte este repositório ao Vercel.
2. Defina as variáveis de ambiente (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
3. O Vercel usará o script `npm run build` e iniciará o servidor com `npm start`.

## Estrutura
- `server.ts` – API Express.
- `src/` – código front‑end React.
- `supabaseClient.ts` / `supabaseHelpers.ts` – camada de acesso ao Supabase.
- `dist/` – artefatos de produção (gerados pelo build).
