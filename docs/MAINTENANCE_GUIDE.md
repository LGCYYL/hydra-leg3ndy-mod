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

### 4. Compilação do Python (RPC)
O backend Python (`hydra-python-rpc`) precisa ser compilado separadamente antes do build principal.

1.  Instale as dependências:
    ```bash
    pip install -r requirements.txt
    ```
2.  Compile o executável (gera pasta `hydra-python-rpc`):
    ```bash
    python python_rpc/setup.py build
    ```

### 5. Configurar Ludusavi (Backup de Saves)
Garanta que o executável `ludusavi.exe` esteja na pasta `ludusavi/`.

### 6. Buidar o projeto
```bash
npm run build:win
```