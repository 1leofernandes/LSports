"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockService = exports.AppointmentService = void 0;
const database_1 = __importDefault(require("../config/database"));
class AppointmentService {
    static async getAppointments(tenantId, date) {
        const where = { tenantId };
        if (date) {
            where.scheduledDate = {
                gte: new Date(date + 'T00:00:00'),
                lt: new Date(date + 'T23:59:59'),
            };
        }
        return await database_1.default.appointment.findMany({
            where,
            include: { user: true },
            orderBy: { scheduledDate: 'asc' },
        });
    }
    static async createAppointment(tenantId, dto) {
        // Check for conflicts
        const conflict = await database_1.default.appointment.findFirst({
            where: {
                tenantId,
                scheduledDate: new Date(dto.scheduledDate),
                court: dto.court,
                OR: [
                    {
                        AND: [
                            { startTime: { lte: dto.startTime } },
                            { endTime: { gt: dto.startTime } },
                        ],
                    },
                    {
                        AND: [
                            { startTime: { lt: dto.endTime } },
                            { endTime: { gte: dto.endTime } },
                        ],
                    },
                ],
            },
        });
        if (conflict) {
            throw new Error('Horário conflitante');
        }
        return await database_1.default.appointment.create({
            data: {
                tenantId,
                ...dto,
                scheduledDate: new Date(dto.scheduledDate),
            },
        });
    }
    static async updateAppointment(tenantId, id, dto) {
        return await database_1.default.appointment.update({
            where: { id, tenantId },
            data: dto,
        });
    }
    static async deleteAppointment(tenantId, id, userId) {
        const appointment = await database_1.default.appointment.findUnique({
            where: { id },
        });
        if (!appointment || appointment.tenantId !== tenantId) {
            throw new Error('Agendamento não encontrado');
        }
        if (appointment.userId !== userId) {
            throw new Error('Não autorizado');
        }
        return await database_1.default.appointment.delete({
            where: { id },
        });
    }
}
exports.AppointmentService = AppointmentService;
class BlockService {
    static async getBlocks(tenantId) {
        return await database_1.default.block.findMany({
            where: { tenantId, date: { gte: new Date() } },
            orderBy: { date: 'asc' },
        });
    }
    static async createBlock(tenantId, dto) {
        return await database_1.default.block.create({
            data: {
                tenantId,
                date: new Date(dto.date),
                startTime: dto.startTime,
                endTime: dto.endTime,
                court: dto.court,
            },
        });
    }
    static async createRecurringBlock(tenantId, dto) {
        return await database_1.default.recurringBlock.create({
            data: {
                tenantId,
                ...dto,
            },
        });
    }
}
exports.BlockService = BlockService;
//# sourceMappingURL=appointmentService.js.map