import Product from '../models/Product.js';
import { HTTP_STATUS } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateProductDescription } from '../services/geminiService.js';

export const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, search, sortBy = '-createdAt' } = req.query;

  const query = { isActive: true };

  if (category && category !== 'all') {
    query.category = category;
  }

  if (search) {
    const trimmedSearch = String(search).trim();
    if (trimmedSearch) {
      const regex = new RegExp(trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { name: regex },
        { description: regex },
        { category: regex },
      ];
    }
  }

  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .sort(sortBy)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('vendor', 'firstName lastName');

  const total = await Product.countDocuments(query);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: products,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('vendor', 'firstName lastName email phone')
    .populate('reviews.userId', 'firstName lastName profileImage');

  if (!product) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Product not found',
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: product,
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  req.body.vendor = req.userId;

  // Generate description using Gemini if not provided
  if (!req.body.description) {
    try {
      req.body.description = await generateProductDescription(req.body.name, req.body.category);
    } catch (error) {
      console.error('Failed to generate description:', error);
    }
  }

  const product = await Product.create(req.body);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Product created successfully',
    data: product,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Product not found',
    });
  }

  const isAdmin = req.user?.role === 'admin';
  if (product.vendor.toString() !== req.userId && !isAdmin) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Not authorized to update this product',
    });
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Product updated successfully',
    data: product,
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Product not found',
    });
  }

  const isAdmin = req.user?.role === 'admin';
  if (product.vendor.toString() !== req.userId && !isAdmin) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Not authorized to delete this product',
    });
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Check if user already reviewed
  const existingReview = product.reviews.find((r) => r.userId.toString() === req.userId);

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
  } else {
    product.reviews.push({
      userId: req.userId,
      rating,
      comment,
    });
  }

  product.updateRating();
  await product.save();

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Review added successfully',
    data: product,
  });
});
