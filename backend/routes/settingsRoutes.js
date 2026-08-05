import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getStoreSettings, getAdminStoreSettings, updateStoreSettings } from '../controllers/settingsController.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/', getStoreSettings);
router.get('/admin', protect, authorize(USER_ROLES.ADMIN), getAdminStoreSettings);
router.put('/admin', protect, authorize(USER_ROLES.ADMIN), updateStoreSettings);

export default router;
