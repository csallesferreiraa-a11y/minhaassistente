# 🍒 Minha Assistente — Carol

## Como publicar no Netlify (5 minutos!)

### Passo 1 — Crie uma conta gratuita
Acesse: https://netlify.com e crie sua conta (pode usar o login do Google).

### Passo 2 — Publique o app
1. Acesse: https://app.netlify.com/drop
2. **Arraste a pasta `carol-netlify`** pra área de drop
3. Aguarde ~30 segundos
4. Seu link estará pronto! Ex: `https://carol-assistente.netlify.app`

### Passo 3 — Instale no iPhone
1. Abra o link no **Safari** (obrigatório — não funciona no Chrome do iPhone)
2. Toque no ícone de **Compartilhar** (□↑) na barra inferior
3. Role pra baixo e toque **"Adicionar à Tela de Início"**
4. Confirme e toque **Adicionar**
5. O ícone 🍒 aparece na sua tela inicial!

### Passo 4 — Conectar Notion (opcional mas poderoso!)

#### No Notion:
1. Acesse: https://www.notion.so/my-integrations
2. Clique em **"+ Nova integração"**
3. Nome: `Minha Assistente Carol`
4. Selecione seu workspace
5. Permissões: ✅ Ler conteúdo, ✅ Atualizar conteúdo, ✅ Inserir conteúdo
6. Salve e copie o **Token** (começa com `secret_`)

#### Criar database de tarefas no Notion:
1. Crie uma nova página no Notion
2. Adicione um bloco **Database — Full page**
3. Adicione as propriedades:
   - `Name` (título — já existe)
   - `Status` → Select: `A fazer`, `Em andamento`, `Concluída`
   - `Prioridade` → Select: `Crítica`, `Alta`, `Média`, `Baixa`
   - `Contexto` → Select: `APEX`, `Pessoal`, `Freela`
   - `Prazo` → Date
   - `Notas` → Text
4. Conecte sua integração: clique nos **...** da página → **Connections** → selecione `Minha Assistente Carol`
5. Copie o **ID do database** da URL (os 32 caracteres após a última `/`)

#### No assistente:
1. Vá em **Integrações** na sidebar
2. Cole o Token e o ID do database
3. Clique **Conectar Notion**
4. Use **Enviar pro Notion** ou **Puxar do Notion**

---

## Estrutura dos arquivos

```
carol-netlify/
├── index.html              ← App principal
├── manifest.json           ← Config PWA (ícone, nome, cores)
├── sw.js                   ← Service Worker (modo offline)
├── netlify.toml            ← Config do Netlify
├── icons/
│   ├── icon-192.png        ← Ícone do app
│   └── icon-512.png        ← Ícone grande
└── netlify/functions/
    └── notion-sync.js      ← Proxy Notion (server-side)
```

## Seus dados

Os dados ficam no `localStorage` do navegador de cada dispositivo.
Para sincronizar entre dispositivos, use a integração com Notion —
as tarefas ficam salvas lá e você puxa em qualquer lugar.

---

Feito com 🍒 especialmente pra Carol.
