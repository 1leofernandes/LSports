// server.js (REESCRITO) - Multi-tenant (subdomínio) + JWT com tenant_id
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db'); // pool do pg (arquivo que você enviou)
const { authenticateToken, isAdmin, isFuncionarioOuAdmin } = require('./middlewares'); // usa seus middlewares existentes para roles
const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secreta';

// lista legacy de admin emails (mantive)
const adminEmails = [
  'leonardoff24@gmail.com',
  'BONIEQUES2020@GMAIL.COM',
  'bonieques2020@gmail.com',
  'guyhenryck06@gmail.com'
];

// middlewares globais
app.use(cors({
  origin: ['https://l-sports.vercel.app', 'http://localhost:3000', 'http://127.0.0.1:5500'],
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization','x-tenant'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.static('public'));
// Montar rotas de autenticação definidas em auth.js em /auth
const authRouter = require('./auth');
app.use('/auth', authRouter);

// ------------------------------------------------------------
// Ensure audit table exists for role change logging
async function ensureAuditTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS role_changes (
        id serial PRIMARY KEY,
        tenant_id integer NOT NULL,
        user_id integer NOT NULL,
        changed_by integer NOT NULL,
        old_role text NOT NULL,
        new_role text NOT NULL,
        changed_at timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Audit table role_changes ensured');
  } catch (err) {
    console.error('Error ensuring role_changes table:', err);
  }
}
ensureAuditTable();
// ------------------------------------------------------------
// Helper: wrapper para executar queries com app.current_tenant
// ------------------------------------------------------------
async function withTenantClient(tenantId, handler) {
  const client = await db.connect(); // pool.connect()
  try {
    await client.query('BEGIN');
      // SET LOCAL does not accept parameter placeholders in some Postgres versions.
      // Tenant id comes from our DB (trusted), so interpolate safely as integer.
      const tid = parseInt(tenantId, 10);
      await client.query(`SET LOCAL app.current_tenant = '${tid}'`);
    const res = await handler(client);
    await client.query('COMMIT');
    return res;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ------------------------------------------------------------
// Middleware: extrair subdomínio e carregar tenant_id
// Expectativa: requests chegam como <subdomain>.seu-dominio.com
// Em ambiente local para testes, você pode enviar header "x-tenant" com o subdomain.
// ------------------------------------------------------------
async function tenantExtractor(req, res, next) {
  try {
    const host = req.headers.host || '';
    // prioridade: header x-tenant (útil para testes locais)
    const headerTenant = req.headers['x-tenant'];
    if (headerTenant) {
      req.subdomain = headerTenant;
    } else {
      const hostWithoutPort = host.split(':')[0];
      const parts = hostWithoutPort.split('.');
      if (parts.length >= 3) {
        req.subdomain = parts[0];
      } else {
        // sem subdomínio -> retornar 400 pedindo subdomínio (modo produção)
        return res.status(400).json({ message: 'Subdomínio não identificado (use header x-tenant em local).' });
      }
    }

    // Buscar tenant_id no banco
    const result = await db.query('SELECT id FROM tenants WHERE subdomain = $1', [req.subdomain]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tenant não encontrado' });
    }
    req.tenant_id = result.rows[0].id;
    next();
  } catch (err) {
    console.error('tenantExtractor error:', err);
    return res.status(500).json({ message: 'Erro ao identificar tenant' });
  }
}
app.use(tenantExtractor);

// ------------------------------------------------------------
// Auth middleware (verifica token + checa tenant_id no token)
// ------------------------------------------------------------
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'Token não fornecido' });

//   jwt.verify(token, JWT_SECRET, (err, payload) => {
//     if (err) return res.status(403).json({ message: 'Token inválido' });

//     // payload deve conter tenant_id (modelo C). Se não tiver, negar.
//     if (!payload.tenant_id || payload.tenant_id !== req.tenant_id) {
//       return res.status(403).json({ message: 'Token inválido para este tenant' });
//     }

//     // setar req.user compatível com seus middlewares existentes
//     req.user = {
//       id: payload.id,
//       nome: payload.nome,
//       email: payload.email,
//       role: payload.role,
//       roles: payload.roles, // legacy
//       tenant_id: payload.tenant_id
//     };
//     next();
//   });
// }

// ------------------------------------------------------------
// ROUTES
// ------------------------------------------------------------

// UTIL: endpoint health
app.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    return res.json({ status: 'online', dbTime: result.rows[0].now });
  } catch (err) {
    console.error('Health error:', err);
    return res.status(500).json({ error: 'DB error' });
  }
});

// -------------------- AUTH & REGISTRATION --------------------

// Registrar usuário normal (cliente)
app.post('/registrar', async (req, res) => {
  const { nome, email, senha, telefone } = req.body;
  if (!nome || !email || !senha || !telefone) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // usamos withTenantClient para garantir SET LOCAL app.current_tenant
    await withTenantClient(req.tenant_id, async (client) => {
      const r = await client.query('SELECT id FROM usuarios WHERE tenant_id = $1 AND email = $2', [req.tenant_id, email]);
      if (r.rows.length > 0) {
        return res.status(400).json({ message: 'Usuário já registrado' });
      }

      const hashed = await bcrypt.hash(senha, 10);
      // role padrão cliente; legacy field "roles" mantido
      const roles = adminEmails.includes(email) ? 'admin' : 'cliente';

      await client.query(
        `INSERT INTO usuarios (tenant_id, nome, email, senha, telefone, role, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
        [req.tenant_id, nome, email, hashed, telefone, 'cliente']
      );

      return res.status(201).json({ message: 'Usuário registrado com sucesso' });
    });
  } catch (err) {
    // if handler already sent response, avoid sending again
    if (!res.headersSent) {
      console.error('registrar error:', err);
      res.status(500).json({ message: 'Erro interno no servidor' });
    }
  }
});

// Registrar funcionário (somente admin pode criar) – legacy endpoint
app.post('/registrar-funcionario', authenticateToken, async (req, res) => {
  const { nome, email, senha, telefone } = req.body;

  try {
    // só admin cria funcionário (ou gerente, dependendo do seu modelo)
    if (req.user.role !== 'admin' && req.user.roles !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    await withTenantClient(req.tenant_id, async (client) => {
      const r = await client.query('SELECT id FROM usuarios WHERE tenant_id = $1 AND email = $2', [req.tenant_id, email]);
      if (r.rows.length > 0) return res.status(400).json({ mensagem: 'Email já registrado' });

      const hashed = await bcrypt.hash(senha, 8);
      await client.query(
        `INSERT INTO usuarios (tenant_id, nome, telefone, email, senha, role, created_at)
         VALUES ($1,$2,$3,$4,$5,'funcionario',NOW())`,
        [req.tenant_id, nome, telefone, email, hashed]
      );
      return res.status(201).json({ mensagem: 'Funcionário registrado com sucesso!' });
    });
  } catch (err) {
    if (!res.headersSent) {
      console.error('registrar-funcionario error:', err);
      res.status(500).json({ erro: 'Erro ao registrar funcionário' });
    }
  }
});

// Login (gera JWT com tenant_id) - tanto admin quanto clientes
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ message: 'Email e senha obrigatórios' });

  try {
    await withTenantClient(req.tenant_id, async (client) => {
      const r = await client.query('SELECT id, nome, email, senha, role, roles FROM usuarios WHERE tenant_id = $1 AND email = $2', [req.tenant_id, email]);
      if (r.rows.length === 0) return res.status(401).json({ message: 'Usuário não encontrado' });

      const user = r.rows[0];
      const valid = await bcrypt.compare(senha, user.senha);
      if (!valid) return res.status(401).json({ message: 'Senha incorreta' });

      const token = jwt.sign({
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        roles: user.roles,
        tenant_id: req.tenant_id
      }, JWT_SECRET, { expiresIn: '30d' });

      return res.json({ token });
    });
  } catch (err) {
    if (!res.headersSent) {
      console.error('login error:', err);
      res.status(500).json({ message: 'Erro no login' });
    }
  }
});

// resetar senha (rota legacy que aceitava token)
app.post('/auth/resetar-senha', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: 'Token e nova senha obrigatórios' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // garante que token pertence ao tenant atual
    if (!decoded.tenant_id || decoded.tenant_id !== req.tenant_id) {
      return res.status(403).json({ message: 'Token inválido para este tenant' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await withTenantClient(req.tenant_id, async (client) => {
      await client.query('UPDATE usuarios SET senha = $1 WHERE id = $2 AND tenant_id = $3', [hashed, decoded.id, req.tenant_id]);
      return res.json({ message: 'Senha redefinida com sucesso!' });
    });
  } catch (err) {
    console.error('resetar-senha error:', err);
    return res.status(400).json({ message: 'Token inválido ou expirado.' });
  }
});

// rota que retorna user-info (id e role) a partir do token
app.get('/user-info', authenticateToken, (req, res) => {
  // req.user foi setado pelo authenticateToken
  return res.json({ id: req.user.id, role: req.user.role, roles: req.user.roles });
});

// -------------------- AGENDAMENTOS / HORÁRIOS --------------------

// Obter horários (apenas horas para um dia)
app.get('/agendamentos/horarios', async (req, res) => {
  const { data_agendada } = req.query;
  if (!data_agendada) return res.status(400).json({ message: 'data_agendada é obrigatória' });

  try {
    await withTenantClient(req.tenant_id, async (client) => {
      const r = await client.query('SELECT hora_inicio FROM agendamentos WHERE tenant_id = $1 AND data_agendada = $2', [req.tenant_id, data_agendada]);
      return res.json({ agendamentos: r.rows });
    });
  } catch (err) {
    console.error('/agendamentos/horarios error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao carregar horários.' });
  }
});

// Endpoint compatível com frontend antigo: horários ocupados e reservas completas
app.get('/horarios-ocupados', async (req, res) => {
  try {
    const { data, quadra } = req.query;
    if (!data) return res.status(400).json({ message: 'data é obrigatória' });

    await withTenantClient(req.tenant_id, async (client) => {
      const params = [req.tenant_id, data];
      let q = `SELECT id, usuario_id, data_agendada, hora_inicio, hora_fim, quadra, status, payment_method FROM agendamentos WHERE tenant_id = $1 AND data_agendada = $2`;
      if (quadra) {
        q += ` AND quadra = $3`;
        params.push(parseInt(quadra, 10));
      }
      const r = await client.query(q, params);

      const horariosOcupadosQuadra1 = r.rows.filter(rw => Number(rw.quadra) === 1).map(x => x.hora_inicio?.slice(0,5));
      const horariosOcupadosQuadra2 = r.rows.filter(rw => Number(rw.quadra) === 2).map(x => x.hora_inicio?.slice(0,5));

      return res.json({ reservas: r.rows, horariosOcupadosQuadra1, horariosOcupadosQuadra2 });
    });
  } catch (err) {
    console.error('/horarios-ocupados error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao carregar horários' });
  }
});

// Endpoint compatível com frontend: bloqueios específicos e recorrentes
app.get('/horarios-bloqueados', async (req, res) => {
  try {
    const { data, quadra } = req.query;
    if (!data) return res.status(400).json({ message: 'data é obrigatória' });

    await withTenantClient(req.tenant_id, async (client) => {
      // bloqueios específicos
      const beParams = [req.tenant_id, data, quadra || null];
      const beQuery = `SELECT id, data, hora_inicio, hora_fim, quadra FROM bloqueios WHERE tenant_id = $1 AND data = $2` +
        (quadra ? ` AND (quadra IS NULL OR quadra = $3)` : '');
      const be = await client.query(beQuery, quadra ? beParams : [req.tenant_id, data]);

      // bloqueios recorrentes (bloqueios_recorrentes)
      const dayOfWeek = new Date(data).getDay();
      const brParams = [req.tenant_id, dayOfWeek];
      const brQuery = `SELECT id, day_of_week, start_time AS hora_inicio, end_time AS hora_fim, quadra, nome FROM bloqueios_recorrentes WHERE tenant_id = $1 AND day_of_week = $2`;
      const br = await client.query(brQuery, brParams);

      return res.json({ bloqueiosEspecificos: be.rows, bloqueiosRecorrentes: br.rows });
    });
  } catch (err) {
    console.error('/horarios-bloqueados error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao carregar horários bloqueados' });
  }
});

// Verificar disponibilidade (reutilizado por front)
app.post('/verificar-disponibilidade', async (req, res) => {
  try {
    const { data_agendada, hora_inicio, hora_fim, quadra } = req.body;
    const quadraNum = parseInt(quadra);
    if (isNaN(quadraNum)) return res.status(400).json({ message: 'Quadra inválida' });

    await withTenantClient(req.tenant_id, async (client) => {
      // conflitos com agendamentos
      const ag = await client.query(`
        SELECT id FROM agendamentos
        WHERE tenant_id = $1 AND data_agendada = $2 AND quadra = $3
          AND NOT (hora_fim <= $4 OR hora_inicio >= $5)
      `, [req.tenant_id, data_agendada, quadraNum, hora_inicio, hora_fim]);

      // conflitos bloqueios
      const be = await client.query(`
        SELECT id FROM bloqueios
        WHERE tenant_id = $1 AND data = $2
          AND (quadra IS NULL OR quadra = $3)
          AND NOT (hora_fim <= $4 OR hora_inicio >= $5)
      `, [req.tenant_id, data_agendada, quadraNum, hora_inicio, hora_fim]);

      // conflitos recorrentes (bloqueios_recorrentes)
      const diaSemana = new Date(data_agendada).getDay();
      const br = await client.query(`
        SELECT id FROM bloqueios_recorrentes
        WHERE tenant_id = $1 AND day_of_week = $2
          AND (quadra IS NULL OR quadra = $3)
          AND NOT (end_time <= $4 OR start_time >= $5)
      `, [req.tenant_id, diaSemana, quadraNum, hora_inicio, hora_fim]);

      const conflitos = ag.rowCount > 0 || be.rowCount > 0 || br.rowCount > 0;
      return res.json({
        disponivel: !conflitos,
        conflitos: {
          agendamentos: ag.rowCount > 0,
          bloqueios: be.rowCount > 0,
          recorrentes: br.rowCount > 0
        }
      });
    });
  } catch (err) {
    console.error('/verificar-disponibilidade error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro na verificação' });
  }
});

// Criar agendamento (usuário autenticado)
app.post('/agendar', authenticateToken, async (req, res) => {
  try {
    const { data_agendada, hora_inicio, hora_fim, quadra, payment_method } = req.body;
    const usuario_id = req.user.id;

    if (!data_agendada || !hora_inicio || !hora_fim || !quadra) {
      return res.status(400).json({ message: 'Preencha todos os campos' });
    }

    await withTenantClient(req.tenant_id, async (client) => {
      // verifica conflito
      const conflict = await client.query(`
        SELECT id FROM agendamentos
        WHERE tenant_id = $1 AND data_agendada = $2 AND quadra = $3
          AND NOT (hora_fim <= $4 OR hora_inicio >= $5)
      `, [req.tenant_id, data_agendada, quadra, hora_inicio, hora_fim]);

      if (conflict.rowCount > 0) {
        return res.status(400).json({ message: 'Horário já reservado nesta quadra' });
      }

      await client.query(`
        INSERT INTO agendamentos (tenant_id, usuario_id, data_agendada, hora_inicio, hora_fim, quadra, status, payment_method, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,'nao_pago',$7,NOW())
      `, [req.tenant_id, usuario_id, data_agendada, hora_inicio, hora_fim, quadra, payment_method]);

      return res.status(201).json({ message: 'Agendamento realizado com sucesso!' });
    });
  } catch (err) {
    console.error('/agendar error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar agendamentos (funcionário/admin)
app.get('/agendamentos', authenticateToken, isFuncionarioOuAdmin, async (req, res) => {
  try {
    await withTenantClient(req.tenant_id, async (client) => {
      const r = await client.query(`
        SELECT
          a.id,
          u.nome AS nome_cliente,
          u.telefone AS telefone_cliente,
          a.data_agendada,
          a.hora_inicio,
          a.hora_fim,
          a.quadra,
          a.status,
          a.payment_method
        FROM agendamentos a
        LEFT JOIN usuarios u ON a.usuario_id = u.id AND u.tenant_id = a.tenant_id
        WHERE a.tenant_id = $1 AND a.data_agendada >= CURRENT_DATE
        ORDER BY a.data_agendada, a.hora_inicio
      `, [req.tenant_id]);
      return res.json(r.rows || []);
    });
  } catch (err) {
    console.error('/agendamentos GET error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao buscar agendamentos' });
  }
});

// Histórico (todos os agendamentos do tenant)
app.get('/agendamentos/historico', authenticateToken, async (req, res) => {
  try {
    await withTenantClient(req.tenant_id, async (client) => {
      const r = await client.query(`
        SELECT
          a.id,
          u.nome AS nome_cliente,
          u.telefone AS telefone_cliente,
          a.data_agendada, a.hora_inicio, a.hora_fim, a.quadra, a.status, a.payment_method
        FROM agendamentos a
        LEFT JOIN usuarios u ON a.usuario_id = u.id AND u.tenant_id = a.tenant_id
        WHERE a.tenant_id = $1
        ORDER BY a.data_agendada DESC, a.hora_inicio DESC
      `, [req.tenant_id]);
      return res.json(r.rows);
    });
  } catch (err) {
    console.error('/agendamentos/historico error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao buscar histórico' });
  }
});

// Meus agendamentos (usuário autenticado)
app.get('/meus-agendamentos', authenticateToken, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    await withTenantClient(req.tenant_id, async (client) => {
      const r = await client.query(`
        SELECT id, data_agendada, hora_inicio, hora_fim, quadra, status, payment_method
        FROM agendamentos
        WHERE tenant_id = $1 AND usuario_id = $2 AND data_agendada >= CURRENT_DATE
        ORDER BY data_agendada, hora_inicio
      `, [req.tenant_id, usuario_id]);
      return res.json(r.rows);
    });
  } catch (err) {
    console.error('/meus-agendamentos error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao buscar agendamentos.' });
  }
});

// Cancelar agendamento (usuário dono ou admin) 
app.delete('/cancelar-agendamento/:id', authenticateToken, async (req, res) => {
  const agendamentoId = req.params.id;
  const usuario_id = req.user.id;
  try {
    await withTenantClient(req.tenant_id, async (client) => {
      const r = await client.query('SELECT usuario_id FROM agendamentos WHERE tenant_id = $1 AND id = $2', [req.tenant_id, agendamentoId]);
      if (r.rows.length === 0) return res.status(404).json({ message: 'Agendamento não encontrado' });

      const dono = r.rows[0].usuario_id;
      if (dono !== usuario_id && req.user.role !== 'admin' && req.user.roles !== 'admin') {
        return res.status(403).json({ message: 'Não autorizado' });
      }

      await client.query('DELETE FROM agendamentos WHERE tenant_id = $1 AND id = $2', [req.tenant_id, agendamentoId]);
      return res.json({ message: 'Agendamento cancelado com sucesso!' });
    });
  } catch (err) {
    console.error('cancelar-agendamento error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao cancelar agendamento.' });
  }
});

// Marcar como pago (func/admin)
app.put('/agendamentos/:id/marcar-pago', authenticateToken, isFuncionarioOuAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await withTenantClient(req.tenant_id, async (client) => {
      await client.query(`UPDATE agendamentos SET status = 'pago' WHERE tenant_id = $1 AND id = $2`, [req.tenant_id, id]);
      return res.json({ message: 'Agendamento marcado como pago!' });
    });
  } catch (err) {
    console.error('marcar-pago error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao atualizar' });
  }
});

// Delete agendamento por id (admin)
app.delete('/agendamentos/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const agendamentoId = req.params.id;
    await withTenantClient(req.tenant_id, async (client) => {
      const r = await client.query('DELETE FROM agendamentos WHERE tenant_id = $1 AND id = $2', [req.tenant_id, agendamentoId]);
      if (r.rowCount === 0) return res.status(404).json({ error: 'Agendamento não encontrado' });
      return res.json({ message: 'Agendamento excluído com sucesso' });
    });
  } catch (err) {
    console.error('DELETE /agendamentos/:id error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Erro ao excluir agendamento' });
  }
});

// -------------------- BLOQUEIOS --------------------

// Adicionar bloqueio (func/admin)
app.post('/bloquear-horario', authenticateToken, isFuncionarioOuAdmin, async (req, res) => {
  try {
    const { data, hora_inicio, hora_fim, quadra } = req.body;
    await withTenantClient(req.tenant_id, async (client) => {
      await client.query(`INSERT INTO bloqueios (tenant_id, data, hora_inicio, hora_fim, quadra, created_at) VALUES ($1,$2,$3,$4,$5,NOW())`,
        [req.tenant_id, data, hora_inicio, hora_fim, quadra]);
      return res.json({ message: 'Horário bloqueado com sucesso!' });
    });
  } catch (err) {
    console.error('/bloquear-horario error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao bloquear o horário' });
  }
});

// Bloquear dia inteiro (func/admin)
app.post('/bloquear-dia', authenticateToken, isFuncionarioOuAdmin, async (req, res) => {
  try {
    const { data, quadra } = req.body;
    await withTenantClient(req.tenant_id, async (client) => {
      const exists = await client.query('SELECT id FROM bloqueios WHERE tenant_id = $1 AND data = $2', [req.tenant_id, data]);
      if (exists.rows.length > 0) return res.status(400).json({ message: 'Este dia já está bloqueado' });

      await client.query(`INSERT INTO bloqueios (tenant_id, data, hora_inicio, hora_fim, quadra, created_at) VALUES ($1,$2,$3,$4,$5,NOW())`,
        [req.tenant_id, data, '00:00:00', '23:59:59', quadra]);
      return res.json({ message: 'Dia bloqueado com sucesso!' });
    });
  } catch (err) {
    console.error('/bloquear-dia error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao bloquear o dia' });
  }
});

// Listar bloqueios futuros
app.get('/bloqueios', authenticateToken, async (req, res) => {
  try {
    await withTenantClient(req.tenant_id, async (client) => {
      const r = await client.query('SELECT id, data, hora_inicio, hora_fim, quadra FROM bloqueios WHERE tenant_id = $1 AND data >= CURRENT_DATE', [req.tenant_id]);
      return res.json(r.rows);
    });
  } catch (err) {
    console.error('/bloqueios GET error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao buscar bloqueios' });
  }
});

// Remover bloqueio
app.delete('/bloqueios/:id', authenticateToken, isFuncionarioOuAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await withTenantClient(req.tenant_id, async (client) => {
      await client.query('DELETE FROM bloqueios WHERE tenant_id = $1 AND id = $2', [req.tenant_id, id]);
      return res.json({ message: 'Bloqueio removido com sucesso!' });
    });
  } catch (err) {
    console.error('DELETE /bloqueios/:id error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao remover bloqueio' });
  }
});

// -------------------- BLOQUEIOS RECORRENTES --------------------

// Criar bloqueio recorrente (func/admin)
app.post('/bloquear-horario-recorrente', authenticateToken, isFuncionarioOuAdmin, async (req, res) => {
  try {
    const { dia_semana, hora_inicio, hora_fim, quadra, nome } = req.body;
    await withTenantClient(req.tenant_id, async (client) => {
      const r = await client.query(`INSERT INTO bloqueios_recorrentes (tenant_id, day_of_week, start_time, end_time, quadra, nome, created_at) VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING *`,
        [req.tenant_id, dia_semana, hora_inicio, hora_fim, quadra, nome]);
      return res.status(201).json(r.rows[0]);
    });
  } catch (err) {
    console.error('/bloquear-horario-recorrente error:', err);
    if (!res.headersSent) res.status(500).json({ message: err.message });
  }
});

// Listar bloc.recorrentes
app.get('/bloqueios-recorrentes', authenticateToken, async (req, res) => {
  try {
    await withTenantClient(req.tenant_id, async (client) => {
      const r = await client.query('SELECT * FROM bloqueios_recorrentes WHERE tenant_id = $1', [req.tenant_id]);
      return res.json(r.rows);
    });
  } catch (err) {
    console.error('/bloqueios-recorrentes GET error:', err);
    if (!res.headersSent) res.status(500).json({ message: err.message });
  }
});

// Remover bloqueio recorrente
app.delete('/bloqueios-recorrentes/:id', authenticateToken, isFuncionarioOuAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await withTenantClient(req.tenant_id, async (client) => {
      await client.query('DELETE FROM bloqueios_recorrentes WHERE tenant_id = $1 AND id = $2', [req.tenant_id, id]);
      return res.json({ message: 'Bloqueio recorrente removido com sucesso' });
    });
  } catch (err) {
    console.error('DELETE /bloqueios-recorrentes/:id error:', err);
    if (!res.headersSent) res.status(500).json({ message: err.message });
  }
});

// -------------------- FUNCIONÁRIOS / ADMIN --------------------

// Listar funcionarios (admin)
app.get('/admin/funcionarios', authenticateToken, isAdmin, async (req, res) => {
  try {
    await withTenantClient(req.tenant_id, async (client) => {
      const r = await client.query(`SELECT id, nome, email FROM usuarios WHERE tenant_id = $1 AND role = 'funcionario'`, [req.tenant_id]);
      return res.json(r.rows);
    });
  } catch (err) {
    console.error('/admin/funcionarios GET error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao buscar funcionarios' });
  }
});

// Criar funcionario via admin panel
app.post('/admin/funcionarios', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { nome, telefone, email, senha } = req.body;
    await withTenantClient(req.tenant_id, async (client) => {
      const hashed = await bcrypt.hash(senha, 8);
      await client.query(`INSERT INTO usuarios (tenant_id, nome, telefone, email, senha, role, created_at) VALUES ($1,$2,$3,$4,$5,'funcionario',NOW())`,
        [req.tenant_id, nome, telefone, email, hashed]);
      return res.status(201).json({ message: 'Funcionário registrado com sucesso' });
    });
  } catch (err) {
    console.error('POST /admin/funcionarios error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao registrar funcionário' });
  }
});

// Deletar funcionario (admin)
app.delete('/admin/funcionarios/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await withTenantClient(req.tenant_id, async (client) => {
      const r = await client.query(`DELETE FROM usuarios WHERE tenant_id = $1 AND id = $2 AND role = 'funcionario'`, [req.tenant_id, id]);
      if (r.rowCount === 0) return res.status(404).json({ message: 'Funcionário não encontrado' });
      return res.json({ message: 'Funcionário excluído com sucesso' });
    });
  } catch (err) {
    console.error('DELETE /admin/funcionarios/:id error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao excluir funcionário' });
  }
});

// -------------------- ADMIN: USUÁRIOS (LIST & ROLE UPDATE) --------------------

// Listar todos usuários do tenant (admin)
app.get('/admin/usuarios', authenticateToken, isAdmin, async (req, res) => {
  try {
    await withTenantClient(req.tenant_id, async (client) => {
      const r = await client.query(`SELECT id, nome, email, role FROM usuarios WHERE tenant_id = $1 ORDER BY nome`, [req.tenant_id]);
      return res.json(r.rows);
    });
  } catch (err) {
    console.error('/admin/usuarios GET error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
});

// Atualizar role de um usuário (apenas promover para funcionário por enquanto)
app.put('/admin/usuarios/:id/role', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { role } = req.body;
    // permitimos apenas promover para 'funcionario' ou rebaixar para 'cliente'
    const allowed = ['cliente', 'funcionario'];
    if (!allowed.includes(role)) return res.status(400).json({ message: 'Role inválida para este endpoint' });

    // Bloquear alteração de role do próprio admin por segurança
    const targetId = parseInt(id, 10);
    const userIdNum = parseInt(req.user && req.user.id ? req.user.id : 0, 10);
    if (userIdNum === targetId) {
      return res.status(403).json({ message: 'Alteração de role do próprio usuário não é permitida' });
    }

    await withTenantClient(req.tenant_id, async (client) => {
      // ensure allowed transitions only: cliente<->funcionario (not admin changes)
      const cur = await client.query(`SELECT role FROM usuarios WHERE tenant_id = $1 AND id = $2`, [req.tenant_id, id]);
      if (cur.rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
      const currentRole = cur.rows[0].role;
      const validTransition = (currentRole === 'cliente' && role === 'funcionario') || (currentRole === 'funcionario' && role === 'cliente');
      if (!validTransition) return res.status(400).json({ message: 'Transição de role inválida' });

      const r = await client.query(`UPDATE usuarios SET role = $1 WHERE tenant_id = $2 AND id = $3 RETURNING id, nome, email, role`, [role, req.tenant_id, id]);
      if (r.rowCount === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
      // inserir auditoria de mudança de role
      try {
        await client.query(
          `INSERT INTO role_changes (tenant_id, user_id, changed_by, old_role, new_role) VALUES ($1,$2,$3,$4,$5)`,
          [req.tenant_id, id, req.user.id, currentRole, role]
        );
      } catch (err) {
        console.error('Erro ao inserir auditoria de role_changes:', err);
      }
      return res.json({ message: 'Role atualizada com sucesso', user: r.rows[0] });
    });
  } catch (err) {
    console.error('PUT /admin/usuarios/:id/role error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao atualizar role' });
  }
});

// Listar auditorias de mudança de role (apenas admin)
app.get('/admin/role-changes', authenticateToken, isAdmin, async (req, res) => {
  try {
    await withTenantClient(req.tenant_id, async (client) => {
      const r = await client.query(`SELECT id, user_id, changed_by, old_role, new_role, changed_at FROM role_changes WHERE tenant_id = $1 ORDER BY changed_at DESC LIMIT 100`, [req.tenant_id]);
      return res.json(r.rows);
    });
  } catch (err) {
    console.error('/admin/role-changes GET error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao buscar auditorias' });
  }
});


// -------------------- RELATÓRIO FINANCEIRO --------------------

app.get('/relatorio-financeiro', authenticateToken, async (req, res) => {
  try {
    const periodo = parseInt(req.query.periodo || '3', 10);
    if (isNaN(periodo) || periodo < 1 || periodo > 12) return res.status(400).json({ error: 'Período inválido. Use 1-12 meses.' });

    await withTenantClient(req.tenant_id, async (client) => {
      const { rows: agendamentos } = await client.query(`
        SELECT data_agendada, hora_inicio, hora_fim, quadra, EXTRACT(DOW FROM data_agendada) as dia_semana
        FROM agendamentos
        WHERE tenant_id = $1 AND data_agendada >= NOW() - ($2 || ' months')::INTERVAL AND data_agendada <= NOW()
        ORDER BY data_agendada
      `, [req.tenant_id, periodo]);

      // processar relatório (mesma lógica sua)
      const report = { mensal: {}, diario: {}, por_dia_semana: Array(7).fill(0).map((_, i) => ({ dia: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][i], total:0, agendamentos:0, quadras: {} })), quadras: {} };
      agendamentos.forEach(ag => {
        const date = new Date(ag.data_agendada);
        const mesAno = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}`;
        const diaMes = `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}`;
        const diaSemana = ag.dia_semana;
        const quadra = ag.quadra || '0';
        const inicio = new Date(`1970-01-01T${ag.hora_inicio}`);
        const fim = new Date(`1970-01-01T${ag.hora_fim}`);
        const diffMin = (fim - inicio) / 60000;
        const valor = Math.floor(diffMin / 60) * 50 + ((diffMin % 60) >= 30 ? 25 : 0);

        if (!report.mensal[mesAno]) report.mensal[mesAno] = { total:0, agendamentos:0, quadras: {} };
        report.mensal[mesAno].total += valor; report.mensal[mesAno].agendamentos += 1;
        if (!report.mensal[mesAno].quadras[quadra]) report.mensal[mesAno].quadras[quadra] = { total:0, agendamentos:0 };
        report.mensal[mesAno].quadras[quadra].total += valor; report.mensal[mesAno].quadras[quadra].agendamentos += 1;

        if (!report.diario[diaMes]) report.diario[diaMes] = { total:0, agendamentos:0, quadras: {} };
        report.diario[diaMes].total += valor; report.diario[diaMes].agendamentos += 1;
        if (!report.diario[diaMes].quadras[quadra]) report.diario[diaMes].quadras[quadra] = { total:0, agendamentos:0 };
        report.diario[diaMes].quadras[quadra].total += valor; report.diario[diaMes].quadras[quadra].agendamentos += 1;

        report.por_dia_semana[diaSemana].total += valor; report.por_dia_semana[diaSemana].agendamentos += 1;
        if (!report.por_dia_semana[diaSemana].quadras[quadra]) report.por_dia_semana[diaSemana].quadras[quadra] = { total:0, agendamentos:0 };
        report.por_dia_semana[diaSemana].quadras[quadra].total += valor; report.por_dia_semana[diaSemana].quadras[quadra].agendamentos += 1;

        if (!report.quadras[quadra]) report.quadras[quadra] = { total:0, agendamentos:0 };
        report.quadras[quadra].total += valor; report.quadras[quadra].agendamentos += 1;
      });

      return res.json(report);
    });
  } catch (err) {
    console.error('/relatorio-financeiro error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

// ------------------------------------------------------------
// Start server
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
