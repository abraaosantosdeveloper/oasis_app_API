# OASIS API

API RESTful para o aplicativo Oasis - um sistema de gerenciamento de hábitos e bem-estar pessoal.

## 📋 Descrição

A Oasis API fornece endpoints para gerenciar usuários, hábitos, categorias e registros de diário. Desenvolvida com Node.js e Express, utiliza PostgreSQL como banco de dados e está hospedada na Vercel.

## 🚀 Tecnologias

- **Node.js** - Ambiente de execução JavaScript
- **Express.js** - Framework web minimalista
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação via tokens
- **Bcrypt** - Hash de senhas
- **Vercel** - Plataforma de deploy serverless

## 🔗 Base URL

```
https://oasis-app-api.vercel.app/api
```

## 📚 Endpoints Principais

### 🔐 Autenticação

#### POST `/login`
Autentica um usuário e retorna um token JWT.

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "usuario@email.com"
  }
}
```

#### POST `/signup`
Registra um novo usuário.

**Request Body:**
```json
{
  "nome": "João Silva",
  "email": "usuario@email.com",
  "senha": "senha123",
  "data_nasc": "1990-01-01",
  "idade": 33,
  "sexo": "M"
}
```

### 📝 Hábitos

#### GET `/habits/user/:userId`
Retorna todos os hábitos de um usuário específico.

#### POST `/habits`
Cria um novo hábito.

**Request Body:**
```json
{
  "titulo": "Exercícios matinais",
  "descricao": "30 minutos de exercícios",
  "categoria": 1,
  "repetir": true,
  "tipo_repeticao": "diario",
  "user_id": 1
}
```

#### PUT `/habits/:id`
Atualiza um hábito existente.

#### DELETE `/habits/:id`
Remove um hábito.

#### POST `/habits/:id/toggle`
Alterna o status de conclusão de um hábito.

### 📂 Categorias

#### GET `/categories/user/:userId`
Retorna todas as categorias de um usuário.

#### POST `/categories`
Cria uma nova categoria personalizada.

### 📔 Diário

#### GET `/journal/user/:userId`
Retorna todas as entradas de diário de um usuário.

#### POST `/journal`
Cria uma nova entrada de diário.

**Request Body:**
```json
{
  "conteudo": "Hoje foi um ótimo dia...",
  "data": "2025-11-20",
  "user_id": 1
}
```

#### GET `/journal/user/:userId/date/:date`
Retorna entradas de diário de uma data específica.

### 👤 Usuários

#### PUT `/users/:id`
Atualiza informações do usuário.

**Request Body:**
```json
{
  "nome": "João Silva",
  "email": "novoemail@email.com",
  "senha": "novasenha123"
}
```

## 🔒 Autenticação

A maioria dos endpoints requer autenticação via token JWT. Inclua o token no header das requisições:

```
Authorization: Bearer <seu_token_jwt>
```

## ⚙️ Variáveis de Ambiente

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=seu_secret_key_aqui
PORT=3000
```

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Configurar banco de dados
# Execute o script SQL em api/db/init.sql

# Iniciar servidor
npm start
```

## 📦 Deploy

A API está configurada para deploy automático na Vercel. O arquivo `vercel.json` contém as configurações necessárias.

## 📄 Licença

Este projeto é parte do Oasis App desenvolvido por Abraão Santos.

## 🤝 Contribuindo

Para contribuir com melhorias:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📞 Contato

- **Desenvolvedor:** Abraão Santos
- **Repositório:** [github.com/abraaosantosdeveloper/oasis_app_API](https://github.com/abraaosantosdeveloper/oasis_app_API)

