# 🚀 LSports - Como Rodar Localmente

## Pré-requisitos

- Node.js 14+ instalado
- PostgreSQL rodando
- Arquivo `.env` na raiz com:
  ```
  DATABASE_URL=postgresql://user:password@localhost:5432/lsports
  JWT_SECRET=sua_chave_secreta
  MAILERSEND_API_KEY=sua_chave_mailersend (opcional)
  MAILERSEND_FROM=seu-email@seu-dominio.com (opcional)
  ```

## 📋 Instalação de Dependências

```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

---

## 🎯 Rodando o Sistema

### Opção 1: Terminal Único (Recomendado para macOS/Linux)

```bash
npm run dev
```

### Opção 2: Dois Terminais (Windows)

#### Terminal 1 - Backend
```bash
npm start
```
Acesse: http://localhost:3000/ping (deve retornar "pong")

#### Terminal 2 - Frontend
```bash
cd client
npm start
```
Abrirá automaticamente em http://localhost:3001

---

## 🧪 Testando as Páginas Convertidas para React

Com ambos rodando, teste as novas rotas:

- **Login**: http://localhost:3001/cliente1/login
- **Registrar**: http://localhost:3001/cliente1/registrar
- **Agendamento**: http://localhost:3001/cliente1/agendamento
- **Admin**: http://localhost:3001/cliente1/admin
- **Financeiro**: http://localhost:3001/cliente1/financeiro
- **Funcionário**: http://localhost:3001/cliente1/funcionario
- **Registrar Funcionário**: http://localhost:3001/cliente1/registrar-funcionario
- **Esqueci Senha**: http://localhost:3001/cliente1/esqueci-senha

---

## 🔑 Fluxo de Tenant

1. **Frontend extrai o tenant do caminho**: `/cliente1/login` → tenant = `cliente1`
2. **Frontend envia em cada requisição API**: header `X-Tenant: cliente1`
3. **Backend valida e isola dados**: toda query usa `SET LOCAL app.current_tenant = '1'`

### Para testar com outro tenant:

Altere a URL para:
- http://localhost:3001/outroTenant/login

O sistema buscará `tenants.subdomain = 'outroTenant'` no banco de dados.

---

## 📡 Arquitetura

```
Frontend React (3001)
       ↓
    CORS ✓
       ↓
Backend Node.js (3000)
       ↓
  PostgreSQL
```

- **Frontend**: Roteamento React Router (client-side)
- **Backend**: API REST com isolamento de tenant
- **Database**: PostgreSQL com RLS (Row Level Security) por tenant

---

## ⚠️ Troubleshooting

### Erro: "Subdomínio não identificado"
- ✅ Certifique-se que está enviando header `X-Tenant`
- ✅ O frontend faz isso automaticamente
- ✅ Se acessar backend diretamente (3000), use curl com `-H "X-Tenant: cliente1"`

### Erro: "Cannot GET /cliente1/login"
- ✅ Você está acessando a porta **errada**
- ✅ Frontend está em **3001**, backend em **3000**
- ✅ Acesse: `http://localhost:3001/cliente1/login` ✓

### Erro: "Connection refused"
- ✅ Backend não está rodando
- ✅ Certifique-se de `npm start` no terminal 1

---

## 🎨 Build para Produção

```bash
cd client
npm run build
```

Isso gera otimizado em `client/build/` com ~237KB (gzip)

---

## 📞 Suporte

Se houver erro, verifique:
1. Backend rodando: `curl http://localhost:3000/ping`
2. Frontend rodando: `http://localhost:3001`
3. Banco de dados conectado
4. `.env` configurado corretamente
