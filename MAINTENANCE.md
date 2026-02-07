# Guia de Manutenção - Leg3ndy Hydra

Este documento descreve os processos de manutenção para o fork proprietário "Leg3ndy Hydra".

## 1. Segurança e Dependências

### Binários Externos (Ludusavi)
O download automático do `ludusavi` foi desativado no `scripts/postinstall.cjs` para evitar ataques de cadeia de suprimentos (Supply Chain Attacks).

**Para atualizar o Ludusavi:**
1. Baixe manualmente o binário confiável do repositório oficial ou de sua fonte auditada.
2. Coloque o arquivo (ex: `ludusavi.exe`) na pasta: `binaries/ludusavi/` (ou a pasta configurada no script).
3. O `.gitignore` foi configurado para permitir o commit deste binário específico.
4. Faça o commit do novo binário.

### Atualizações do Electron e Node
Mantenha o `electron` e outras dependências críticas atualizadas no `package.json`. Rode `npm audit` regularmente.

## 2. Rebranding

A marca "Hydra" foi substituída por "Leg3ndy Hydra" nos seguintes locais:
- `package.json`: Nome do pacote e produto.
- `electron-builder.yml`: Configurações do instalador (AppUserModelId: `com.leg3ndy.hydra`).
- `src/renderer/index.html`: Título da janela.
- `src/renderer/src/app.tsx`: Cabeçalho da aplicação.
- `src/locales`: Arquivos de tradução (JSON).

**Ao adicionar novas traduções ou componentes:**
Certifique-se de usar "Leg3ndy Hydra" ao invés de "Hydra" nas strings visíveis ao usuário.

## 3. Build e Distribuição

### Gerar Instalador
Para criar o instalador `.exe` (Windows):

```bash
npm run build:win
```

O arquivo de saída estará na pasta `dist/` (ou `release/`, dependendo da config).

**Nota:** O auto-updater foi desativado. Novas versões devem ser instaladas manualmente pelos usuários (você).

## 4. Variáveis de Ambiente

O arquivo `.env` bloqueia conexões externas para telemetria ou APIs do Hydra original:

```env
MAIN_VITE_API_URL="http://localhost:9999"
MAIN_VITE_WS_URL="http://localhost:9999"
```

Não remova essas variáveis a menos que você tenha implementado seu próprio backend seguro.
