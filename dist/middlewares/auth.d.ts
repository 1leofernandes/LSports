import { Request, Response, NextFunction } from 'express';
export interface AuthUser {
    id: number;
    nome: string;
    email: string;
    role: string;
    roles?: string;
    tenant_id: number;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
            tenant_id?: number;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const isFuncionarioOuAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map