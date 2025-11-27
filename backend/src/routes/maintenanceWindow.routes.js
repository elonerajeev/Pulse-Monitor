import { Router } from 'express';
import {
    createMaintenanceWindow,
    getAllMaintenanceWindows,
    getSingleMaintenanceWindow,
    updateMaintenanceWindow,
    deleteMaintenanceWindow
} from '../controllers/maintenanceWindow.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js'; // Assuming auth middleware is needed for these routes

const router = Router();

// Apply verifyJWT middleware to all maintenance window routes
router.use(verifyJWT);

router.route('/').post(createMaintenanceWindow);
router.route('/').get(getAllMaintenanceWindows);
router.route('/:id').get(getSingleMaintenanceWindow);
router.route('/:id').put(updateMaintenanceWindow);
router.route('/:id').delete(deleteMaintenanceWindow);

export default router;