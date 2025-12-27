# ⚙️ Configuração do Backend

## Passo 1: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend` com o seguinte conteúdo:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/controle_vendas?schema=public"

# JWT
JWT_SECRET="minha_chave_secreta_super_segura_2025_vendas"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# Gemini AI
GEMINI_API_KEY="sua_chave_gemini_aqui"
```

**IMPORTANTE:**
- Substitua `sua_chave_gemini_aqui` pela sua chave da API Gemini
- Ajuste as credenciais do PostgreSQL se necessário (usuário/senha)

## Passo 2: Instalar PostgreSQL

Se você ainda não tem o PostgreSQL instalado:

### Windows
1. Baixe o instalador: https://www.postgresql.org/download/windows/
2. Execute o instalador
3. Durante a instalação, defina a senha do usuário `postgres`
4. Anote a porta (padrão: 5432)

### Verificar Instalação
```bash
psql --version
```

## Passo 3: Criar o Banco de Dados

Abra o terminal e execute:

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar o banco de dados
CREATE DATABASE controle_vendas;

# Sair
\q
```

## Passo 4: Executar Migrations

Na pasta `backend`, execute:

```bash
npm run prisma:generate
npm run prisma:migrate
```

## Passo 5: (Opcional) Popular com Dados de Exemplo

```bash
npm run prisma:seed
```

Isso criará um usuário demo:
- Email: `demo@exemplo.com`
- Senha: `123456`

## Passo 6: Iniciar o Backend

```bash
npm run dev
```

O servidor estará rodando em: http://localhost:5000

## Verificar Funcionamento

Acesse: http://localhost:5000/health

Você deve ver:
```json
{"status":"ok","timestamp":"..."}
```

## Problemas Comuns

### Erro de Conexão com o Banco
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão: `psql -U postgres -d controle_vendas`

### Erro de Porta em Uso
- Mude a porta no `.env`: `PORT=5001`

### Erro de Prisma
- Execute: `npm run prisma:generate`
