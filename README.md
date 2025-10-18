---

# Sistema de Gestão de Pedidos

Sistema de gerenciamento de pedidos para restaurante, com controle de mesas, cardápio, pedidos e "pagamentos".

---

## Pré-requisitos

Antes de rodar o projeto, você precisa ter instalado:

* [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
* [npm](https://www.npmjs.com/)

---

## Passo a passo para rodar o projeto

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/SThalyta/Gestao-de-pedidos.git
cd Gestao-de-pedidos
```

### 2️⃣ Instalar dependências

```bash
npm install
```

### 3️⃣ Criar arquivo `.env`

Edite o arquivo `.env_example` na raiz do projeto com as configurações do seu banco:

```
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
DB_DATABASE=

PORT=

JWT_SECRET=
JWT_EXPIRES_IN=
```
---

### 4️⃣ Rodar o projeto

```bash
npm run dev
```

* O servidor iniciará usando `nodemon` (reinicia automaticamente ao salvar arquivos).
* O padrão é rodar na porta definida no `.env` (`PORT`).

---

### 5️⃣ Testar endpoints

Use Postman, Insomnia ou curl para acessar rotas como:

* `POST /login` → login de usuário
* `POST /pedidos` → criar pedido
* `GET /pedidos` → listar todos os pedidos
* `PATCH /pedidos/:id/itens` → atualizar itens do pedido **(atualização parcial)**

