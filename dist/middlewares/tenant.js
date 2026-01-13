"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantExtractor = void 0;
const database_1 = __importDefault(require("../config/database"));
const tenantExtractor = async (req, res, next) => {
    try {
        const host = req.headers.host || '';
        const headerTenant = req.headers['x-tenant'];
        if (headerTenant) {
            req.subdomain = headerTenant;
        }
        else {
            const hostWithoutPort = host.split(':')[0];
            const parts = hostWithoutPort.split('.');
            if (parts.length >= 3) {
                req.subdomain = parts[0];
            }
            else {
                return res.status(400).json({ message: 'Subdomínio não identificado (use header x-tenant em local).' });
            }
        }
        const tenant = await database_1.default.tenant.findUnique({
            where: { subdomain: req.subdomain }
        });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant não encontrado' });
        }
        req.tenant_id = tenant.id;
        next();
    }
    catch (err) {
        console.error('tenantExtractor error:', err);
        return res.status(500).json({ message: 'Erro ao identificar tenant' });
    }
};
exports.tenantExtractor = tenantExtractor;
//# sourceMappingURL=tenant.js.map