import { Request, Response } from 'express';
export declare class AppointmentController {
    static getAppointments(req: Request, res: Response): Promise<void>;
    static createAppointment(req: Request, res: Response): Promise<void>;
    static updateAppointment(req: Request, res: Response): Promise<void>;
    static deleteAppointment(req: Request, res: Response): Promise<void>;
}
export declare class BlockController {
    static getBlocks(req: Request, res: Response): Promise<void>;
    static createBlock(req: Request, res: Response): Promise<void>;
    static createRecurringBlock(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=appointmentController.d.ts.map