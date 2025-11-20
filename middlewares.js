// middlewares.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreta';

// Autenticar token e validar tenant_id (agora considera tenant atual no req.tenant_id)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        // payload precisa conter tenant_id
        if (!payload.tenant_id) {
            return res.status(403).json({ message: 'Token sem tenant_id' });
        }

        // Se o servidor já definiu req.tenant_id (pelo tenantExtractor), validar igualdade
        if (req.tenant_id && payload.tenant_id !== req.tenant_id) {
            return res.status(403).json({ message: 'Token inválido para este tenant' });
        }

        // setar req.user padrão (compatível com seu código)
        req.user = {
            id: payload.id,
            nome: payload.nome,
            email: payload.email,
            role: payload.role,
            roles: payload.roles,
            tenant_id: payload.tenant_id
        };

        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token inválido ou expirado' });
    }
}

// Somente ADMIN
function isAdmin(req, res, next) {
    // Checamos tanto role quanto roles (legacy) para compatibilidade
    if (!req.user) return res.status(401).json({ message: 'Não autenticado' });

    if (req.user.role !== 'admin' && req.user.roles !== 'admin') {
        return res.status(403).json({ message: 'Apenas administradores podem acessar.' });
    }
    next();
}

// Funcionário OU admin
function isFuncionarioOuAdmin(req, res, next) {
    if (!req.user) return res.status(401).json({ message: 'Não autenticado' });

    if (req.user.role !== 'funcionario' && req.user.roles !== 'admin' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso restrito a funcionários e administradores' });
    }
    next();
}

module.exports = {
    authenticateToken,
    isAdmin,
    isFuncionarioOuAdmin
};
