import express from 'express';
import { sendContactMessage } from '../controllers/contactController.js';
import { validateContact } from '../utils/validators.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.post('/', validateContact, handleValidationErrors, sendContactMessage);

export default router;
