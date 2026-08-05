import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { HTTP_STATUS, ORDER_STATUS, PAYMENT_STATUS } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const normalizeProductId = (value) => {
  if (!value) return null;
  if (typeof value === 'object') {
    return value._id ? value._id.toString() : null;
  }
  return String(value);
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(normalizeProductId(value));

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Order must have at least one item',
    });
  }

  if (!shippingAddress || typeof shippingAddress !== 'object') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Shipping address is required',
    });
  }

  const requiredAddressFields = ['street', 'city', 'state', 'country', 'zipCode'];
  const missingAddressField = requiredAddressFields.find((field) => !shippingAddress[field]);

  if (missingAddressField) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: `Shipping address ${missingAddressField} is required`,
    });
  }

  if (!paymentMethod) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Payment method is required',
    });
  }

  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const productId = normalizeProductId(item.productId);

    if (!productId || !isValidObjectId(productId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Invalid product id provided: ${item.productId}`,
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: `Product ${productId} not found`,
      });
    }

    if (product.stock < item.quantity) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Not enough stock for ${product.name}`,
      });
    }

    orderItems.push({
      productId: product._id,
      quantity: item.quantity,
      price: product.price,
      total: product.price * item.quantity,
    });

    subtotal += product.price * item.quantity;

    // Reduce product stock
    product.stock -= item.quantity;
    await product.save();
  }

  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax
  const shippingCost = subtotal > 500 ? 0 : 50;
  const total = subtotal + tax + shippingCost;

  const order = await Order.create({
    orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    userId: req.userId,
    items: orderItems,
    shippingAddress,
    subtotal,
    tax,
    shippingCost,
    total,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.COMPLETED,
  });

  // Clear user cart
  await Cart.findOneAndUpdate({ userId: req.userId }, { items: [], total: 0, itemCount: 0 });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Order created successfully',
    data: order,
  });
});

export const getOrders = asyncHandler(async (req, res) => {
  const filter = req.user?.role === 'admin' ? {} : { userId: req.userId };

  const orders = await Order.find(filter)
    .populate('userId', 'firstName lastName email')
    .sort('-createdAt')
    .lean();

  const validProductIds = new Set();
  for (const order of orders) {
    for (const item of order.items) {
      const productId = normalizeProductId(item.productId);
      if (isValidObjectId(productId)) {
        validProductIds.add(productId);
      }
    }
  }

  const products = await Product.find({ _id: { $in: Array.from(validProductIds) } }).select('name image price').lean();
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  for (const order of orders) {
    for (const item of order.items) {
      const productId = normalizeProductId(item.productId);
      if (productId && productMap.has(productId)) {
        item.productId = productMap.get(productId);
      }
    }
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: orders,
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('userId', 'firstName lastName email phone')
    .lean();

  if (!order) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Order not found',
    });
  }

  const itemsToPopulate = order.items
    .filter((item) => isValidObjectId(item.productId))
    .map((item) => item.productId.toString());

  const products = await Product.find({ _id: { $in: itemsToPopulate } }).select('name image price').lean();
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  for (const item of order.items) {
    const productId = normalizeProductId(item.productId);
    if (productId && productMap.has(productId)) {
      item.productId = productMap.get(productId);
    }
  }

  if (!order) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Order not found',
    });
  }

  if (order.userId._id.toString() !== req.userId && req.user.role !== 'admin') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Not authorized to view this order',
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: order,
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Only admins can update order status',
    });
  }

  const { orderStatus } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Order not found',
    });
  }

  order.orderStatus = orderStatus;
  await order.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Order status updated successfully',
    data: order,
  });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Order not found',
    });
  }

  if (order.userId.toString() !== req.userId && req.user.role !== 'admin') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Not authorized to cancel this order',
    });
  }

  if (order.orderStatus !== ORDER_STATUS.PENDING) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Can only cancel pending orders',
    });
  }

  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }

  order.orderStatus = ORDER_STATUS.CANCELLED;
  order.paymentStatus = PAYMENT_STATUS.REFUNDED;
  await order.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Order not found',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Only admins can delete orders',
    });
  }

  await order.remove();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Order deleted successfully',
  });
});
