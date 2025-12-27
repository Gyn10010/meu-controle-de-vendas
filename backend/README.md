# Backend para Sistema de Controle de Vendas

Backend API REST completo para o sistema de controle de vendas.

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
- `DATABASE_URL`: String de conexão do PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT (use uma string aleatória segura)
- `GEMINI_API_KEY`: Sua chave da API do Gemini
- `PORT`: Porta do servidor (padrão: 5000)

3. Execute as migrations do banco de dados:
```bash
npm run prisma:migrate
```

4. (Opcional) Popule o banco com dados de exemplo:
```bash
npm run prisma:seed
```

## Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obter usuário atual (requer autenticação)

### Vendas
- `GET /api/sales` - Listar vendas (com filtros opcionais)
- `POST /api/sales` - Criar venda
- `PATCH /api/sales/:id/status` - Atualizar status
- `DELETE /api/sales/:id` - Excluir venda
- `GET /api/sales/export/csv` - Exportar CSV
- `GET /api/sales/export/json` - Exportar JSON

### Clientes
- `GET /api/clients` - Resumo de clientes com dívidas
- `GET /api/clients/:name/sales` - Vendas de um cliente

### Insights
- `POST /api/insights/generate` - Gerar insights com IA

## Credenciais Demo

Após executar o seed:
- Email: `demo@exemplo.com`
- Senha: `123456`
