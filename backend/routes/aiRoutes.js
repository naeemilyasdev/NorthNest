import express from 'express';
import { getRecommendations, getHealthAdvice } from '../controllers/aiController.js';

const router = express.Router();

router.post('/recommendations', getRecommendations);
router.post('/advice', getHealthAdvice);

export default router;
