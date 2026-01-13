import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            subdomain?: string;
        }
    }
}
export declare const tenantExtractor: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=tenant.d.ts.map