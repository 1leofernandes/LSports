"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const JWT_SECRET = process.env.JWT_SECRET || 'secreta';
class AuthService {
    static async register(tenantId, data) {
        const hashedPassword = await bcryptjs_1.default.hash(data.senha, 10);
        const user = await database_1.default.user.create({
            data: {
                tenantId,
                name: data.nome,
                email: data.email,
                password: hashedPassword,
                phone: data.telefone,
                role: 'user'
            }
        });
        return user;
    }
    static async login(tenantId, data) {
        const user = await database_1.default.user.findUnique({
            where: { tenantId_email: { tenantId, email: data.email } }
        });
        if (!user || !(await bcryptjs_1.default.compare(data.senha, user.password))) {
            throw new Error('Credenciais inválidas');
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            nome: user.name,
            email: user.email,
            role: user.role,
            tenant_id: user.tenantId
        }, JWT_SECRET, { expiresIn: '24h' });
        return { user, token };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map