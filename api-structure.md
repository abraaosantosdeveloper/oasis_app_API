# 🚀 API Node.js - OASIS Habit Tracker

## 📦 Estrutura de Arquivos

```
api/
├── db/
│   └── init.sql              # Script para criar tabelas no MySQL
├── middleware/
│   ├── auth.js               # Middleware de autenticação JWT
│   └── validation.js         # Validações de entrada
├── routes/
│   ├── auth.js               # Rotas de autenticação (login/signup)
│   ├── habits.js             # Rotas de hábitos
│   ├── categories.js         # Rotas de categorias
│   └── journal.js            # Rotas de diário
├── utils/
│   ├── db.js                 # Conexão com MySQL
│   └── responses.js          # Respostas padronizadas
├── index.js                  # Entry point principal
├── vercel.json               # Configuração Vercel
├── package.json              # Dependências
└── .env.example              # Exemplo de variáveis de ambiente
```

## 🔧 Configuração

### 1. **Instalar Dependências**
```bash
npm install
```

### 2. **Configurar Banco de Dados no Railway**
- Criar banco MySQL no Railway
- Copiar credenciais de conexão
- Executar o script `db/init.sql` para criar tabelas

### 3. **Configurar Variáveis de Ambiente**
Criar arquivo `.env` com:
```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=seu_secret_super_seguro_aqui
NODE_ENV=production
```

### 4. **Testar Localmente**
```bash
npm run dev
```

### 5. **Deploy na Vercel**
```bash
vercel --prod
```

## 🗃️ Estrutura do Banco de Dados

### Tabela: `usuarios`
- `id` (INT, PK, AUTO_INCREMENT)
- `nome` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `senha_hash` (VARCHAR)
- `data_nasc` (DATE, nullable)
- `idade` (INT, nullable)
- `sexo` (VARCHAR, nullable)
- `criado_em` (TIMESTAMP)

### Tabela: `categorias`
- `id` (INT, PK, AUTO_INCREMENT)
- `nome` (VARCHAR)
- `emoji` (VARCHAR)
- `user_id` (INT, FK)

### Tabela: `habitos`
- `id` (INT, PK, AUTO_INCREMENT)
- `titulo` (VARCHAR)
- `descricao` (TEXT)
- `categoria` (INT, FK)
- `repetir` (BOOLEAN)
- `tipo_repeticao` (ENUM: 'diario', 'semanal', 'mensal')
- `completado` (BOOLEAN)
- `proxima_data` (DATE, nullable)
- `user_id` (INT, FK)
- `criado_em` (TIMESTAMP)

### Tabela: `diario`
- `id` (INT, PK, AUTO_INCREMENT)
- `conteudo` (TEXT)
- `data` (DATE)
- `user_id` (INT, FK)
- `criado_em` (TIMESTAMP)
- **Permite múltiplas entradas no mesmo dia**

## 🛣️ Endpoints da API

### **Autenticação**
- `POST /api/login` - Login (retorna token + usuário)
- `POST /api/signup` - Registro
- `PUT /api/users/:id` - Atualizar perfil

### **Hábitos**
- `GET /api/habits/user/:userId` - Listar hábitos do usuário
- `POST /api/habits` - Criar hábito
- `PUT /api/habits/:id` - Editar hábito
- `DELETE /api/habits/:id` - Deletar hábito
- `POST /api/habits/:id/toggle` - Marcar/desmarcar como concluído

### **Categorias**
- `GET /api/categories?user_id=:userId` - Listar categorias
- `POST /api/categories` - Criar categoria
- `PUT /api/categories/:id` - Editar categoria
- `DELETE /api/categories/:id` - Deletar categoria

### **Diário**
- `GET /api/journal/user/:userId` - Listar entradas do usuário
- `GET /api/journal/user/:userId/date/:date` - Buscar por data específica
- `POST /api/journal` - Criar entrada (permite múltiplas no mesmo dia)
- `PUT /api/journal/:id` - Editar entrada
- `DELETE /api/journal/:id` - Deletar entrada

## 🔒 Segurança Implementada

✅ **Senhas com bcrypt** (10 rounds)  
✅ **JWT com expiração** (7 dias)  
✅ **Validação de entrada** (previne SQL injection)  
✅ **CORS configurado**  
✅ **Rate limiting** (opcional, adicionar express-rate-limit se necessário)  
✅ **Prepared statements** (mysql2 com placeholders)

## ⚡ Performance

✅ **Connection pooling** (reutiliza conexões MySQL)  
✅ **Índices no banco** (email, user_id, data)  
✅ **Respostas compactas** (apenas dados necessários)  
✅ **Validação antes de queries** (evita queries desnecessárias)

## 📝 Observações Importantes

### **Problema de Datas Resolvido**
O frontend estava usando `new Date().toISOString().split('T')[0]` que poderia gerar problemas de fuso horário. A API agora:

1. **Recebe datas no formato `YYYY-MM-DD`** (sem hora)
2. **Armazena como `DATE` no MySQL** (sem timestamp)
3. **Compara datas apenas por dia** (ignora hora)
4. **Permite múltiplas entradas no mesmo dia** (sem UNIQUE constraint em `data`)

### **Próxima Data de Repetição**
Quando um hábito é marcado como concluído:
- **Diário**: Adiciona 1 dia
- **Semanal**: Adiciona 7 dias
- **Mensal**: Adiciona 1 mês
- **Sem repetição**: Marca como concluído definitivo

### **Autenticação JWT**
- Token expira em 7 dias
- Frontend envia token no header: `Authorization: Bearer <token>`
- Middleware valida token antes de acessar rotas protegidas

## 🚀 Deploy na Vercel

A API usa **Vercel Serverless Functions**. Cada rota vira uma função serverless automaticamente.

**Importante**: No `vercel.json`, todas as rotas são redirecionadas para `/api/index.js`.

### **Configurar no Vercel Dashboard**
1. Adicionar variáveis de ambiente:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`

2. Build settings:
   - Framework Preset: **Other**
   - Build Command: (vazio)
   - Output Directory: (vazio)

3. Deploy: `vercel --prod`

## 🔄 Atualizar Frontend

Mudar a `BASE_URL` em `api.js`:

```javascript
const API_CONFIG = {
  BASE_URL: 'https://seu-projeto.vercel.app/api',
  // ...
};
```

---

**Pronto!** A API está 100% compatível com o frontend, pronta para produção na Vercel + Railway MySQL.
