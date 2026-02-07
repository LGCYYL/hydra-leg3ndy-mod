# Guia de Manutenção do Hydra Leg3ndy

Este guia explica como manter seu Hydra modificado atualizado e salvo.

## Repositórios Configurados

- **origin (Seu Backup):** `https://github.com/LGCYYL/hydra-leg3ndy-mod.git`
  - Onde você salva suas modificações.
  - Comando: `git push`

- **upstream (Oficial):** `https://github.com/hydralauncher/hydra.git`
  - De onde vêm as atualizações oficiais.
  - Comando: `git pull upstream main --rebase`

## Fluxo de Trabalho

### 1. Salvar suas alterações (Backup)
Sempre que fizer uma mudança (ou "hack") nova:
```bash
git add .
git commit -m "Descrição do que você fez"
git push
```

### 2. Atualizar com a versão oficial (Sustentabilidade)
Para pegar as novidades do Hydra oficial sem perder seus mods:
```bash
git pull upstream main --rebase
```
*Se houver conflitos, o Git avisará. Você resolve os arquivos marcados e depois roda `git rebase --continue`.*

### 3. Enviar atualização combinada para o seu backup
Depois de atualizar:
```bash
git push --force-with-lease
```
*(O `--force-with-lease` é necessário porque o `rebase` reescreve o histórico para deixar seus commits no topo)*
