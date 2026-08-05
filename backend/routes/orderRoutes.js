import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateOrder, validateId } from '../utils/validators.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.post('/', validateOrder, handleValidationErrors, createOrder);
router.get('/', getOrders);
router.get('/:id', validateId, handleValidationErrors, getOrderById);
router.patch('/:id/status', authorize('admin'), validateId, handleValidationErrors, updateOrderStatus);
router.post('/:id/cancel', validateId, handleValidationErrors, cancelOrder);
router.delete('/:id', authorize('admin'), validateId, handleValidationErrors, deleteOrder);

export default router;
