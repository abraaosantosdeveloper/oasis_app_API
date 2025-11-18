# 🚀 Guia de Deploy - OASIS API

## 📂 Estrutura Final do Projeto

```
oasis-api/
├── api/
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── habits.js
│   │   ├── categories.js
│   │   └── journal.js
│   ├── utils/
│   │   ├── db.js
│   │   └── responses.js
│   └── index.js
├── db/
│   └── init.sql
├── .env
├── .gitignore
├── package.json
├── vercel.json
└── README.md
```

---

## ⚙️ Passo 1: Organizar os Arquivos

### 1.1 Criar estrutura de pastas

```bash
mkdir -p api/middleware api/routes api/utils db
```

### 1.2 Mover arquivos para as pastas corretas

Os arquivos que criei devem ser organizados assim:

- `api-index.js` → `api/index.js`
- `auth-middleware.js` → `api/middleware/auth.js`
- `validation.js` → `api/middleware/validation.js`
- `auth-routes.js` → `api/routes/auth.js`
- `habits-routes.js` → `api/routes/habits.js`
- `categories-routes.js` → `api/routes/categories.js`
- `journal-routes.js` → `api/routes/journal.js`
- `db-utils.js` → `api/utils/db.js`
- `responses.js` → `api/utils/responses.js`
- `init-sql.txt` → `db/init.sql`
- `env-example.txt` → `.env.example`

---

## 🗄️ Passo 2: Configurar MySQL no Railway

### 2.1 Criar banco de dados no Railway

1. Acesse https://railway.app
2. Crie novo projeto
3. Adicione **MySQL** como serviço
4. Copie a `DATABASE_URL` que será algo como:
   ```
   mysql://root:senha123@containers-us-west-123.railway.app:6789/railway
   ```

### 2.2 Executar script SQL

No Railway, vá em **MySQL** → **Query** e execute o conteúdo do arquivo `db/init.sql` para criar todas as tabelas.

**Ou use um cliente MySQL:**

```bash
mysql -h containers-us-west-123.railway.app -P 6789 -u root -p railway < db/init.sql
```

---

## 🔐 Passo 3: Configurar Variáveis de Ambiente

### 3.1 Criar arquivo `.env` local

```bash
cp .env.example .env
```

### 3.2 Editar `.env` com suas credenciais

```env
DATABASE_URL=mysql://root:SuaSenhaDoRailway@containers-us-west-123.railway.app:6789/railway
JWT_SECRET=gere_uma_string_aleatoria_segura_aqui_123456789abcdef
NODE_ENV=development
PORT=5000
```

**Gerar JWT_SECRET seguro:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.3 Criar `.gitignore`

```
node_modules/
.env
.DS_Store
*.log
.vercel
```

---

## 🧪 Passo 4: Testar Localmente

### 4.1 Instalar dependências

```bash
npm install
```

### 4.2 Rodar servidor local

```bash
npm run dev
```

Você deve ver:

```
✅ Pool de conexões MySQL criado
✅ Conexão com MySQL estabelecida
🚀 Servidor rodando na porta 5000
🌐 http://localhost:5000
```

### 4.3 Testar endpoints

**Health check:**
```bash
curl http://localhost:5000/api
```

**Criar conta:**
```bash
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "senha123",
    "idade": 25,
    "sexo": "M"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

---

## ☁️ Passo 5: Deploy na Vercel

### 5.1 Instalar Vercel CLI (se não tiver)

```bash
npm install -g vercel
```

### 5.2 Login na Vercel

```bash
vercel login
```

### 5.3 Configurar variáveis de ambiente na Vercel

**Opção 1: Via Dashboard**

1. Acesse https://vercel.com/dashboard
2. Vá no seu projeto
3. **Settings** → **Environment Variables**
4. Adicione:
   - `DATABASE_URL` = (sua URL do Railway)
   - `JWT_SECRET` = (seu secret)
   - `NODE_ENV` = `production`

**Opção 2: Via CLI**

```bash
vercel env add DATABASE_URL production
# Cole a URL do Railway quando solicitado

vercel env add JWT_SECRET production
# Cole seu JWT secret

vercel env add NODE_ENV production
# Digite: production
```

### 5.4 Deploy

```bash
vercel --prod
```

Aguarde o deploy concluir. Você receberá uma URL como:

```
https://oasis-api-seu-usuario.vercel.app
```

### 5.5 Testar API em produção

```bash
curl https://oasis-api-seu-usuario.vercel.app/api
```

---

## 🌐 Passo 6: Conectar Frontend à API

### 6.1 Atualizar `api.js` no frontend

Edite o arquivo `api.js`:

```javascript
const API_CONFIG = {
  BASE_URL: 'https://oasis-api-seu-usuario.vercel.app/api',
  // ... resto do código
};
```

### 6.2 Testar login/signup

Abra `login.html` e tente fazer login com a conta criada anteriormente.

---

## 🔍 Troubleshooting

### ❌ Erro: "DATABASE_URL não configurada"

**Solução:** Verifique se as variáveis de ambiente estão configuradas corretamente na Vercel.

```bash
vercel env ls
```

### ❌ Erro: "Cannot connect to MySQL"

**Solução:** 

1. Verifique se o Railway está ativo
2. Confirme se a `DATABASE_URL` está correta
3. Teste conexão direta:

```bash
mysql -h containers-us-west-123.railway.app -P 6789 -u root -p
```

### ❌ Erro: "Token inválido"

**Solução:** Verifique se o `JWT_SECRET` é o mesmo em desenvolvimento e produção.

### ❌ Erro 404 em /api/login

**Solução:** Verifique se `vercel.json` está correto e faça redeploy:

```bash
vercel --prod --force
```

### ❌ Frontend não conecta à API (CORS)

**Solução:** A API já está com CORS configurado para `origin: '*'`. Em produção, você pode especificar domínios:

No `api/index.js`:

```javascript
app.use(cors({
  origin: ['https://seu-frontend.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📊 Endpoints Disponíveis

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/signup` | Criar conta |
| POST | `/api/login` | Fazer login |
| PUT | `/api/users/:id` | Atualizar perfil |

### Hábitos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/habits/user/:userId` | Listar hábitos do usuário |
| GET | `/api/habits/:id` | Buscar hábito por ID |
| POST | `/api/habits` | Criar hábito |
| PUT | `/api/habits/:id` | Editar hábito |
| DELETE | `/api/habits/:id` | Deletar hábito |
| POST | `/api/habits/:id/toggle` | Marcar/desmarcar concluído |

### Categorias

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/categories?user_id=:userId` | Listar categorias |
| GET | `/api/categories/user/:userId` | Categorias do usuário |
| POST | `/api/categories` | Criar categoria |
| PUT | `/api/categories/:id` | Editar categoria |
| DELETE | `/api/categories/:id` | Deletar categoria |

### Diário

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/journal/user/:userId` | Listar entradas |
| GET | `/api/journal/user/:userId/date/:date` | Buscar por data |
| POST | `/api/journal` | Criar entrada (múltiplas por dia) |
| PUT | `/api/journal/:id` | Editar entrada |
| DELETE | `/api/journal/:id` | Deletar entrada |

---

## ✅ Checklist Final

- [ ] Banco de dados criado no Railway
- [ ] Script `init.sql` executado
- [ ] Arquivo `.env` configurado localmente
- [ ] Dependências instaladas (`npm install`)
- [ ] API testada localmente (`npm run dev`)
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Deploy feito na Vercel (`vercel --prod`)
- [ ] API em produção testada (curl ou Postman)
- [ ] Frontend atualizado com nova `BASE_URL`
- [ ] Login/signup funcionando no frontend

---

🎉 **Pronto!** Sua API está completa e hospedada na Vercel, conectada ao MySQL no Railway!