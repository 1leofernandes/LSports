import { CreateAppointmentDto, UpdateAppointmentDto, CreateBlockDto, CreateRecurringBlockDto } from '../dtos/appointments';
export declare class AppointmentService {
    static getAppointments(tenantId: number, date?: string): Promise<({
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
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        tenantId: number;
        userId: number;
        scheduledDate: Date;
        startTime: string;
        endTime: string;
        court: string;
        status: string;
        paymentMethod: string | null;
    })[]>;
    static createAppointment(tenantId: number, dto: CreateAppointmentDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        tenantId: number;
        userId: number;
        scheduledDate: Date;
        startTime: string;
        endTime: string;
        court: string;
        status: string;
        paymentMethod: string | null;
    }>;
    static updateAppointment(tenantId: number, id: number, dto: UpdateAppointmentDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        tenantId: number;
        userId: number;
        scheduledDate: Date;
        startTime: string;
        endTime: string;
        court: string;
        status: string;
        paymentMethod: string | null;
    }>;
    static deleteAppointment(tenantId: number, id: number, userId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        tenantId: number;
        userId: number;
        scheduledDate: Date;
        startTime: string;
        endTime: string;
        court: string;
        status: string;
        paymentMethod: string | null;
    }>;
}
export declare class BlockService {
    static getBlocks(tenantId: number): Promise<{
        id: number;
        createdAt: Date;
        tenantId: number;
        startTime: string;
        endTime: string;
        court: string;
        date: Date;
    }[]>;
    static createBlock(tenantId: number, dto: CreateBlockDto): Promise<{
        id: number;
        createdAt: Date;
        tenantId: number;
        startTime: string;
        endTime: string;
        court: string;
        date: Date;
    }>;
    static createRecurringBlock(tenantId: number, dto: CreateRecurringBlockDto): Promise<{
        id: number;
        name: string | null;
        createdAt: Date;
        tenantId: number;
        startTime: string;
        endTime: string;
        court: string;
        dayOfWeek: number;
    }>;
}
//# sourceMappingURL=appointmentService.d.ts.map