# 🌐 Guia de Deploy Online - Sistema de Controle de Vendas

## 🎯 Objetivo

Colocar sua aplicação **online e acessível de qualquer lugar** com domínio próprio.

---

## 🚀 Opção Recomendada: Railway (Tudo em Um)

### Por que Railway?
- ✅ Deploy automático de backend + banco de dados
- ✅ $5 de crédito gratuito/mês (suficiente para começar)
- ✅ Setup mais simples
- ✅ PostgreSQL incluído
- ✅ SSL/HTTPS automático

### Passo a Passo

#### 1. Preparar o Projeto

Crie um arquivo `railway.json` na pasta `backend`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Atualize `backend/package.json` para incluir script de build:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc && npx prisma generate",
    "start": "npx prisma migrate deploy && node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "tsx prisma/seed.ts"
  }
}
```

#### 2. Criar Conta no Railway

1. Acesse: https://railway.app
2. Clique em "Start a New Project"
3. Conecte sua conta GitHub (ou faça upload manual)

#### 3. Deploy do Backend

**Opção A: Via GitHub (Recomendado)**
1. Faça push do código para GitHub
2. No Railway: "Deploy from GitHub repo"
3. Selecione o repositório
4. Selecione a pasta `backend`

**Opção B: Via CLI**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Na pasta backend
cd backend
railway init
railway up
```

#### 4. Adicionar PostgreSQL

1. No projeto Railway, clique em "+ New"
2. Selecione "Database" → "PostgreSQL"
3. Railway criará automaticamente e conectará ao backend

#### 5. Configurar Variáveis de Ambiente

No Railway Dashboard, adicione:

```env
JWT_SECRET=sua_chave_secreta_super_segura_aqui_mude_isso
JWT_EXPIRES_IN=7d
NODE_ENV=production
GEMINI_API_KEY=sua_chave_gemini
PORT=5000
```

**Nota:** `DATABASE_URL` é configurado automaticamente pelo Railway.

#### 6. Deploy do Frontend (Vercel)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Na pasta raiz do projeto
vercel

# Configurar variável de ambiente
# VITE_API_URL=https://seu-backend.railway.app
```

Ou via Dashboard:
1. Acesse https://vercel.com
2. Import projeto do GitHub
3. Configure: `Root Directory: ./`
4. Adicione variável: `VITE_API_URL`
5. Deploy!

#### 7. Atualizar Frontend para Usar URL de Produção

Crie `.env.production` na raiz:

```env
VITE_API_URL=https://seu-backend.railway.app
```

Atualize `src/services/api.service.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

---

## 🔄 Opção Alternativa: Render + Supabase

### Vantagens
- ✅ 100% gratuito para começar
- ✅ Mais controle sobre o banco
- ✅ Supabase oferece 500MB grátis

### Backend no Render

1. **Criar conta:** https://render.com
2. **Novo Web Service:**
   - Conecte GitHub
   - Selecione repositório
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`

3. **Variáveis de Ambiente:**
   ```env
   DATABASE_URL=postgresql://...  # Do Supabase
   JWT_SECRET=sua_chave_secreta
   GEMINI_API_KEY=sua_chave
   NODE_ENV=production
   ```

### Banco de Dados no Supabase

1. **Criar projeto:** https://supabase.com
2. **Copiar Connection String:**
   - Settings → Database → Connection String
   - Modo: "Session"
   - Copie a URL completa

3. **Aplicar Migrations:**
   ```bash
   # Localmente, com DATABASE_URL do Supabase
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```

### Frontend na Vercel

Mesmo processo da opção Railway.

---

## 🌍 Opção 3: Heroku (Clássico)

### Backend + PostgreSQL

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Criar app
cd backend
heroku create seu-app-vendas

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Configurar variáveis
heroku config:set JWT_SECRET=sua_chave
heroku config:set GEMINI_API_KEY=sua_chave
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Executar migrations
heroku run npx prisma migrate deploy
```

---

## 📋 Checklist de Deploy

### Antes do Deploy
- [ ] Código commitado no Git
- [ ] `.env` no `.gitignore`
- [ ] Scripts de build configurados
- [ ] Migrations testadas localmente

### Backend
- [ ] Serviço escolhido (Railway/Render/Heroku)
- [ ] PostgreSQL configurado
- [ ] Variáveis de ambiente definidas
- [ ] Migrations executadas
- [ ] Seed executado (opcional)
- [ ] URL do backend anotada

### Frontend
- [ ] Vercel/Netlify configurado
- [ ] `VITE_API_URL` definida
- [ ] CORS configurado no backend
- [ ] Build testado localmente
- [ ] Deploy realizado

### Pós-Deploy
- [ ] Testar registro de usuário
- [ ] Testar login
- [ ] Testar criação de venda
- [ ] Testar exportação
- [ ] Testar insights IA

---

## 🔒 Configurar CORS no Backend

Atualize `backend/src/server.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://seu-frontend.vercel.app'
  ],
  credentials: true
}));
```

---

## 💰 Custos Estimados

### Opção Gratuita (Render + Supabase + Vercel)
- Backend: **Grátis** (com limitações)
- Banco: **Grátis** (500MB)
- Frontend: **Grátis** (ilimitado)
- **Total: R$ 0/mês**

### Opção Railway
- **$5 de crédito/mês grátis**
- Depois: ~$5-10/mês
- Inclui tudo (backend + banco + SSL)

### Opção Heroku
- **$5/mês** (Eco Dynos)
- PostgreSQL Mini: **$5/mês**
- **Total: ~$10/mês**

---

## 🎯 Recomendação Final

**Para começar:** Railway (mais fácil, tudo integrado)
**Para escalar:** Render + Supabase (mais controle, grátis)
**Para empresas:** AWS/Google Cloud (mais robusto)

---

## 🆘 Troubleshooting

### Erro de Conexão com Banco
- Verifique `DATABASE_URL` nas variáveis de ambiente
- Confirme que migrations foram executadas
- Teste conexão local primeiro

### CORS Error
- Adicione URL do frontend no `cors()` do backend
- Verifique se HTTPS está habilitado

### Build Falha
- Verifique logs no dashboard do serviço
- Confirme que `package.json` tem script `build`
- Teste build localmente: `npm run build`

---

## 📞 Próximos Passos

1. Escolha a plataforma (Railway recomendado)
2. Siga o guia passo a passo
3. Teste tudo online
4. Compartilhe o link!

**Sua aplicação estará online em menos de 30 minutos!** 🚀
