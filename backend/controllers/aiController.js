import { HTTP_STATUS } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getProductRecommendations,
  generateHealthAdvice,
} from '../services/geminiService.js';

export const getRecommendations = asyncHandler(async (req, res) => {
  const { preferences } = req.body;

  if (!preferences) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Preferences are required',
    });
  }

  try {
    const recommendations = await getProductRecommendations(preferences);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
});

export const getHealthAdvice = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Query is required',
    });
  }

  try {
    const advice = await generateHealthAdvice(query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        advice,
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
});
