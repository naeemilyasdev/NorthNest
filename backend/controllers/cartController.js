import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { HTTP_STATUS } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.userId }).populate('items.productId');

  if (!cart) {
    cart = await Cart.create({ userId: req.userId });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: cart,
  });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Product id is required',
    });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Product not found',
    });
  }

  let cart = await Cart.findOne({ userId: req.userId });

  if (!cart) {
    cart = await Cart.create({
      userId: req.userId,
      items: [],
    });
  }

  const existingItem = cart.items.find((item) => item.productId?.toString() === product._id.toString());

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      productId: product._id,
      quantity,
    });
  }

  await cart.calculateTotal();
  await cart.save();

  const updatedCart = await cart.populate('items.productId');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Item added to cart',
    data: updatedCart,
  });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({ userId: req.userId });

  if (!cart) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Cart not found',
    });
  }

  if (quantity <= 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Quantity must be greater than 0',
    });
  }

  const item = cart.items.find((item) => item.productId.toString() === productId);

  if (!item) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Product not in cart',
    });
  }

  item.quantity = quantity;

  await cart.calculateTotal();
  await cart.save();

  const updatedCart = await cart.populate('items.productId');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Cart item updated',
    data: updatedCart,
  });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const cart = await Cart.findOne({ userId: req.userId });

  if (!cart) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Cart not found',
    });
  }

  cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

  await cart.calculateTotal();
  await cart.save();

  const updatedCart = await cart.populate('items.productId');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Item removed from cart',
    data: updatedCart,
  });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.userId });

  if (!cart) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Cart not found',
    });
  }

  cart.items = [];
  cart.total = 0;
  cart.itemCount = 0;
  await cart.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Cart cleared',
    data: cart,
  });
});
