import { LoginRequest, RegisterRequest } from '../dtos/requests';
export declare class AuthService {
    static register(tenantId: number, data: RegisterRequest): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        phone: string | null;
        role: string;
        tenantId: number;
    }>;
    static login(tenantId: number, data: LoginRequest): Promise<{
        user: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            phone: string | null;
            role: string;
            tenantId: number;
        };
        token: string;
    }>;
}
//# sourceMappingURL=authService.d.ts.map