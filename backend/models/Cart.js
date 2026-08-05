import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    total: {
      type: Number,
      default: 0,
    },
    itemCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total and item count
cartSchema.methods.calculateTotal = async function () {
  let total = 0;
  let itemCount = 0;

  for (const item of this.items) {
    const product = await mongoose.model('Product').findById(item.productId);
    if (product) {
      total += product.price * item.quantity;
      itemCount += item.quantity;
    }
  }

  this.total = total;
  this.itemCount = itemCount;
  return this;
};

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
