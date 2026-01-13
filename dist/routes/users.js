"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
// Placeholder for user management
router.get('/', auth_1.isAdmin, (req, res) => {
    res.json({ message: 'List users' });
});
exports.default = router;
//# sourceMappingURL=users.js.map