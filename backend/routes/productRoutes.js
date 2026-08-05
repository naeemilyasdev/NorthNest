import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';
import { validateProduct, validateId } from '../utils/validators.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', validateId, handleValidationErrors, getProductById);
router.post('/', protect, authorize(USER_ROLES.ADMIN), validateProduct, handleValidationErrors, createProduct);
router.put('/:id', protect, authorize(USER_ROLES.ADMIN), validateId, validateProduct, handleValidationErrors, updateProduct);
router.delete('/:id', protect, authorize(USER_ROLES.ADMIN), validateId, handleValidationErrors, deleteProduct);
router.post('/:id/reviews', protect, validateId, handleValidationErrors, addReview);

export default router;
