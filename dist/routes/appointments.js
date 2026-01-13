"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointmentController_1 = require("../controllers/appointmentController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/appointments', appointmentController_1.AppointmentController.getAppointments);
router.post('/appointments', appointmentController_1.AppointmentController.createAppointment);
router.put('/appointments/:id', appointmentController_1.AppointmentController.updateAppointment);
router.delete('/appointments/:id', appointmentController_1.AppointmentController.deleteAppointment);
router.get('/blocks', appointmentController_1.BlockController.getBlocks);
router.post('/blocks', auth_1.isFuncionarioOuAdmin, appointmentController_1.BlockController.createBlock);
router.post('/recurring-blocks', auth_1.isFuncionarioOuAdmin, appointmentController_1.BlockController.createRecurringBlock);
exports.default = router;
//# sourceMappingURL=appointments.js.map