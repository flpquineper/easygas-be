# EasyGas - Backend API

Sistema de gerenciamento de pedidos para distribuidoras de gás.

Este repositório contém o backend do projeto EasyGas, desenvolvido em **Node.js**, **Express**, **TypeScript** e **Prisma ORM**, com banco de dados **PostgreSQL**.

---

## 📦 Tecnologias

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (Autenticação)
- Bcrypt (Hash de senhas)

---

## 🚀 Funcionalidades

- Cadastro e login de usuários
- Autenticação segura com JWT
- CRUD de Produtos
- Gestão de Carrinho de Compras
- Gestão de Pedidos
- Controle de Entregadores
- Controle de Métodos de Pagamento
- Rotas públicas e rotas privadas protegidas

---

## 🔧 Como rodar o projeto localmente

1. Clone o repositório:

```bash
git clone git@gitlab.com:senac-projetos-de-desenvolvimento/2025-guilherme-silva-e-luis-felipe-quinepe/easygas-be.git

### 2. Instale as dependências:

```bash
npm install
```

### 3. Configure o arquivo `.env` com os dados do banco:

Crie o arquivo `.env` na raiz com o seguinte conteúdo:

```env
DATABASE_URL="mysql://root:root@localhost:3306/api_easygas"
JWT_SECRET="easygas_secret_key"
```

### 4. Rode as migrações do banco de dados:

```bash
npx prisma migrate dev --name init
```

### 5. Gere o Prisma Client:

```bash
npx prisma generate
```

### 6. Rode o servidor:

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

---

## 🛠 Estrutura de Pastas

```
src/
 ├── controllers/
 ├── middlewares/
 ├── routes/
 ├── prisma/
 ├── index.ts
 └── ...
```
---

## 📌 Observações

- O projeto ainda está em desenvolvimento.
- Para testes de rotas protegidas, é necessário realizar login para obter o token JWT.
- Ambiente recomendado: Node.js 18+

---

## 👨‍💻 Desenvolvedores

- Luis Felipe Quineper Junior
- Guilherme da Rosa Silva

---

## 📄 Licença

Este projeto é apenas para fins acadêmicos.
