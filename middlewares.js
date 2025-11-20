const jwt = require('jsonwebtoken');
const secret = 'secreta';

// Autenticar token normal
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    jwt.verify(token, secret, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        req.user = user;
        next();
    });
}

// Somente ADMIN
function isAdmin(req, res, next) {
    if (req.user.roles !== 'admin') {
        return res.status(403).json({ message: 'Apenas administradores podem acessar.' });
    }
    next();
}

// Funcionário OU admin
function isFuncionarioOuAdmin(req, res, next) {
    if (req.user.role !== 'funcionario' && req.user.roles !== 'admin') {
        return res.status(403).json({ message: 'Acesso restrito a funcionários e administradores' });
    }
    next();
}

module.exports = {
    authenticateToken,
    isAdmin,
    isFuncionarioOuAdmin
};
