import mongoose from 'mongoose';
import { PRODUCT_CATEGORIES } from '../config/constants.js';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: 0,
    },
    category: {
      type: String,
      enum: PRODUCT_CATEGORIES,
      required: [true, 'Category is required'],
    },
    image: {
      type: String,
      required: [true, 'Product image is required'],
    },
    images: [
      {
        type: String,
      },
    ],
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: 0,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        comment: String,
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    origin: {
      region: String,
      altitude: String,
      harvestSeason: String,
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    vendor: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });

// Calculate average rating
productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
  } else {
    const avgRating = this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.reviews.length;
    this.rating = Math.round(avgRating * 10) / 10;
  }
};

const Product = mongoose.model('Product', productSchema);
export default Product;
