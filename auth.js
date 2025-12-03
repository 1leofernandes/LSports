require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const nodemailer = require('nodemailer');
const { authenticateToken, isAdmin, isFuncionarioOuAdmin } = require('./middlewares');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secreta';
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : 'https://lsports-bufv.onrender.com';

// Configurar Nodemailer com Gmail
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

let transporter = null;

if (GMAIL_USER && GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD
    }
  });
  console.log('✓ Nodemailer configurado com Gmail');
} else {
  console.warn('⚠️  GMAIL_USER ou GMAIL_APP_PASSWORD não definidas no .env - emails não funcionarão');
}

// Login
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    // 1️⃣ Capturar o tenant vindo do frontend
    const tenantSub = req.headers["x-tenant"];
    if (!tenantSub) {
        return res.status(400).json({ message: "Tenant não informado." });
    }

    try {
        // 2️⃣ Buscar o tenant no banco
        const tenantResult = await db.query(
            "SELECT id FROM tenants WHERE subdomain = $1",
            [tenantSub]
        );

        if (tenantResult.rows.length === 0) {
            return res.status(404).json({ message: "Tenant inválido." });
        }

        const tenantId = tenantResult.rows[0].id;

        // 3️⃣ Buscar o usuário dentro do tenant correto
        const { rows } = await db.query(
            "SELECT * FROM usuarios WHERE email = $1 AND tenant_id = $2",
            [email, tenantId]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Email ou senha inválidos" });
        }

        const usuario = rows[0];

        // 4️⃣ Validar senha
        const senhaValida = bcrypt.compareSync(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ message: "Email ou senha inválidos" });
        }

        // 5️⃣ Criar token com tenant_id incluso
        const token = jwt.sign(
            {
                id: usuario.id,
                nome: usuario.nome,
                role: usuario.role,
                tenant_id: tenantId
            },
            JWT_SECRET,
            { expiresIn: '365d' }
        );

        // 6️⃣ Retornar dados ao cliente
        res.json({
            message: "Login bem-sucedido!",
            token,
            usuario_id: usuario.id,
            role: usuario.role,
            nome: usuario.nome
        });

    } catch (err) {
        console.error("Erro ao fazer login:", err);
        res.status(500).json({ message: "Erro interno ao fazer login" });
    }
});



// Esqueci minha senha (enviar e-mail com o token)
router.post('/esqueci-senha', async (req, res) => {
    const { email } = req.body;
    const tenantSub = req.headers['x-tenant'];

    if (!tenantSub) {
        return res.status(400).json({ message: 'Tenant não informado.' });
    }

    if (!transporter) {
        return res.status(500).json({ message: 'Serviço de email não configurado' });
    }

    try {
        // Buscar tenant_id
        const tenantResult = await db.query(
            'SELECT id FROM tenants WHERE subdomain = $1',
            [tenantSub]
        );
        if (tenantResult.rows.length === 0) {
            return res.status(404).json({ message: 'Tenant inválido' });
        }
        const tenantId = tenantResult.rows[0].id;

        // Buscar usuário no tenant correto
        const { rows } = await db.query(
            'SELECT * FROM usuarios WHERE email = $1 AND tenant_id = $2',
            [email, tenantId]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Email não cadastrado' });
        }

        const token = jwt.sign({ id: rows[0].id, tenant_id: tenantId }, JWT_SECRET, { expiresIn: '25m' });

        const link = `${API_BASE_URL}/${tenantSub}/resetar-senha.html?token=${token}`;

        const mailOptions = {
            from: GMAIL_USER,
            to: email,
            subject: 'Redefinição de Senha - LSports',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Redefinição de Senha</h2>
                    <p>Olá,</p>
                    <p>Você solicitou uma redefinição de senha. Clique no botão abaixo para continuar:</p>
                    <p><a href="${link}" style="background-color: #30186b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Redefinir Senha</a></p>
                    <p>Ou copie e cole este link no navegador:</p>
                    <p><code>${link}</code></p>
                    <p><strong>Este link expira em 25 minutos.</strong></p>
                    <p>Se você não solicitou esta redefinição, ignore este email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'E-mail de redefinição enviado com sucesso!' });

    } catch (err) {
        console.error('Erro ao processar /esqueci-senha:', err);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});


// Redefinir senha (valida o token e atualiza a senha)
router.post('/resetar-senha/:token', async (req, res) => {
    const { token } = req.params;
    const { senha } = req.body;

    if (!senha) {
        return res.status(400).json({ message: 'Senha é obrigatória' });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 8);
        
        // Verificação do token JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;
        const tenantId = decoded.tenant_id;

        // Atualização no PostgreSQL - validar tenant_id para segurança
        const { rowCount } = await db.query(
            'UPDATE usuarios SET senha = $1 WHERE id = $2 AND tenant_id = $3', 
            [senhaHash, userId, tenantId]
        );

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.json({ message: 'Senha redefinida com sucesso!' });
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Token inválido ou expirado' });
        }
        
        console.error('Erro ao redefinir senha:', err);
        res.status(500).json({ message: 'Erro ao redefinir senha' });
    }
});

// Rota para obter lista de funcionarios
router.get('/funcionarios', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, nome FROM usuarios WHERE role = $1', ['funcionario']);
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar funcionarios:', err);
        res.status(500).json({ message: 'Erro ao buscar funcionarios' });
    }
});


module.exports = router;
