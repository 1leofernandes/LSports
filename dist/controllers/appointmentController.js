"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockController = exports.AppointmentController = void 0;
const appointmentService_1 = require("../services/appointmentService");
class AppointmentController {
    static async getAppointments(req, res) {
        try {
            const tenantId = req.tenant_id;
            const date = req.query.date;
            const appointments = await appointmentService_1.AppointmentService.getAppointments(tenantId, date);
            res.json(appointments);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async createAppointment(req, res) {
        try {
            const tenantId = req.tenant_id;
            const dto = req.body;
            const appointment = await appointmentService_1.AppointmentService.createAppointment(tenantId, dto);
            res.status(201).json(appointment);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async updateAppointment(req, res) {
        try {
            const tenantId = req.tenant_id;
            const id = parseInt(req.params.id);
            const dto = req.body;
            const appointment = await appointmentService_1.AppointmentService.updateAppointment(tenantId, id, dto);
            res.json(appointment);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async deleteAppointment(req, res) {
        try {
            const tenantId = req.tenant_id;
            const id = parseInt(req.params.id);
            const userId = req.user.id;
            await appointmentService_1.AppointmentService.deleteAppointment(tenantId, id, userId);
            res.status(204).send();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.AppointmentController = AppointmentController;
class BlockController {
    static async getBlocks(req, res) {
        try {
            const tenantId = req.tenant_id;
            const blocks = await appointmentService_1.BlockService.getBlocks(tenantId);
            res.json(blocks);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async createBlock(req, res) {
        try {
            const tenantId = req.tenant_id;
            const dto = req.body;
            const block = await appointmentService_1.BlockService.createBlock(tenantId, dto);
            res.status(201).json(block);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async createRecurringBlock(req, res) {
        try {
            const tenantId = req.tenant_id;
            const dto = req.body;
            const block = await appointmentService_1.BlockService.createRecurringBlock(tenantId, dto);
            res.status(201).json(block);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.BlockController = BlockController;
//# sourceMappingURL=appointmentController.js.map