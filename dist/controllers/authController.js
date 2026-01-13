"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
class AuthController {
    static async register(req, res) {
        try {
            const tenantId = req.tenant_id;
            const data = req.body;
            const user = await authService_1.AuthService.register(tenantId, data);
            res.status(201).json({ message: 'Usuário registrado', user: { id: user.id, name: user.name, email: user.email } });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async login(req, res) {
        try {
            const tenantId = req.tenant_id;
            const data = req.body;
            const { user, token } = await authService_1.AuthService.login(tenantId, data);
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        }
        catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map