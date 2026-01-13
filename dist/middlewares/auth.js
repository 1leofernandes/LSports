"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFuncionarioOuAdmin = exports.isAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'secreta';
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!payload.tenant_id) {
            return res.status(403).json({ message: 'Token sem tenant_id' });
        }
        if (req.tenant_id && payload.tenant_id !== req.tenant_id) {
            return res.status(403).json({ message: 'Token inválido para este tenant' });
        }
        req.user = {
            id: payload.id,
            nome: payload.nome,
            email: payload.email,
            role: payload.role,
            roles: payload.roles,
            tenant_id: payload.tenant_id
        };
        next();
    }
    catch (err) {
        return res.status(403).json({ message: 'Token inválido ou expirado' });
    }
};
exports.authenticateToken = authenticateToken;
const isAdmin = (req, res, next) => {
    if (!req.user)
        return res.status(401).json({ message: 'Não autenticado' });
    if (req.user.role !== 'admin' && req.user.roles !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado: apenas administradores' });
    }
    next();
};
exports.isAdmin = isAdmin;
const isFuncionarioOuAdmin = (req, res, next) => {
    if (!req.user)
        return res.status(401).json({ message: 'Não autenticado' });
    if (req.user.role !== 'admin' && req.user.role !== 'funcionario' && req.user.roles !== 'admin' && req.user.roles !== 'funcionario') {
        return res.status(403).json({ message: 'Acesso negado: apenas funcionários ou administradores' });
    }
    next();
};
exports.isFuncionarioOuAdmin = isFuncionarioOuAdmin;
//# sourceMappingURL=auth.js.map