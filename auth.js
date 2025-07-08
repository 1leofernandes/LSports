require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('./db'); // Certifique-se de que db.js usa o método .promise()

const router = express.Router();
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : 'https://resenha-backend.onrender.com';


// Login
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        const usuario = rows[0];
        const senhaValida = bcrypt.compareSync(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        const token = jwt.sign(
            { id: usuario.id, nome: usuario.nome, role: usuario.role },
            'secreta',
            { expiresIn: '365d' }
        );

        res.json({
            message: 'Login bem-sucedido!',
            token,
            usuario_id: usuario.id, // Incluindo o ID do usuário na resposta
            role: usuario.role,
            nome: usuario.nome
        });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).json({ message: 'Erro interno ao fazer login' });
    }
});


// Esqueci minha senha (enviar e-mail com o token)
const { Resend } = require('resend');

const resend = new Resend('re_9UknK8M2_MXGBA6UWZ4p8cB4XjVqJ71a9'); // sua API key

router.post('/esqueci-senha', async (req, res) => {
    const { email } = req.body;

    try {
        const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Email não cadastrado' });
        }

        const token = jwt.sign({ id: rows[0].id }, 'secreta', { expiresIn: '25m' });

        const link = `https://cantinhodoboni.vercel.app/cdb/resetar-senha.html?token=${token}`;

        const { data, error } = await resend.emails.send({
            from: 'LF Software <onboarding@resend.dev>',
            to: email,
            subject: 'Redefinição de Senha',
            html: `
                <p>Olá,</p>
                <p>Você solicitou uma redefinição de senha. Clique no link abaixo para continuar:</p>
                <a href="${link}">${link}</a>
                <p>Este link expira em 25 minutos.</p>
            `
        });

        if (error) {
            console.error('Erro ao enviar e-mail via Resend:', error);
            return res.status(500).json({ message: 'Erro ao enviar o e-mail' });
        }

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
        const decoded = jwt.verify(token, 'secreta');
        const userId = decoded.id;

        // Atualização no PostgreSQL (sintaxe atualizada)
        const { rowCount } = await db.query(
            'UPDATE usuarios SET senha = $1 WHERE id = $2', 
            [senhaHash, userId]
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


function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // Adiciona os dados do token no req.user para uso nas rotas
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token inválido' });
    }
}

module.exports = authenticateToken;

module.exports = router;
