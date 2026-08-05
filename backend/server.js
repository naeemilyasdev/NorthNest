import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/admin.routes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Setting from './models/Setting.js';

dotenv.config();

const app = express();

app.set('trust proxy', 1);
app.use(helmet());

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        process.env.CORS_ORIGIN,
      ].filter(Boolean);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contact', contactRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const ensureDefaultAdmin = async () => {
  const existingAdmin = await User.findOne({ email: 'admin@northnest.com' }).select('+password');

  if (existingAdmin) {
    let updated = false;

    if (!existingAdmin.name) {
      existingAdmin.name = 'Admin User';
      updated = true;
    }

    if (!existingAdmin.firstName) {
      existingAdmin.firstName = 'Admin';
      updated = true;
    }

    if (!existingAdmin.lastName) {
      existingAdmin.lastName = 'User';
      updated = true;
    }

    if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      updated = true;
    }

    const isDefaultPassword = await existingAdmin.comparePassword('Admin123!');
    if (!isDefaultPassword) {
      existingAdmin.password = 'Admin123!';
      updated = true;
    }

    if (updated) {
      await existingAdmin.save();
      console.log('Default admin account ensured and reset.');
    }

    return existingAdmin;
  }

  const admin = await User.create({
    name: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@northnest.com',
    password: 'Admin123!',
    role: 'admin',
  });

  console.log('Default admin ready: admin@northnest.com / Admin123!');

  const products = [
    {
      name: 'Himalayan Wild Honey',
      description: 'Pure wildflower honey harvested from high-altitude Himalayan hives.',
      price: 1290,
      category: 'Honey',
      image: 'https://images.unsplash.com/photo-1587049352851-8d4e892a1153?auto=format&fit=crop&w=900&q=80',
      stock: 24,
      vendor: admin._id,
      isActive: true,
    },
    {
      name: 'Organic Almond Mix',
      description: 'A premium blend of roasted almonds, walnuts, and cashews from mountain orchards.',
      price: 890,
      category: 'Dry Fruits',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
      stock: 18,
      vendor: admin._id,
      isActive: true,
    },
    {
      name: 'Mountain Tea Ritual',
      description: 'A calming herbal tea crafted from native Himalayan botanicals.',
      price: 690,
      category: 'Tea',
      image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=900&q=80',
      stock: 15,
      vendor: admin._id,
      isActive: true,
    },
    {
      name: 'Apricot & Almond Delight',
      description: 'Sweet dried apricots with crunchy nuts for a nourishing Himalayan snack.',
      price: 720,
      category: 'Dry Fruits',
      image: 'https://images.unsplash.com/photo-1524594154900-2e8ded384f1a?auto=format&fit=crop&w=900&q=80',
      stock: 22,
      vendor: admin._id,
      isActive: true,
    },
    {
      name: 'Namkeen Chai Spice Mix',
      description: 'A savory tea blend with traditional Himalayan spices to brighten your chai.',
      price: 450,
      category: 'Tea',
      image: 'https://images.unsplash.com/photo-1611691543816-0a6303cf72b2?auto=format&fit=crop&w=900&q=80',
      stock: 20,
      vendor: admin._id,
      isActive: true,
    },
    {
      name: 'Shilajeet Resin',
      description: 'Pure Himalayan shilajeet resin to support strength, vitality, and natural energy.',
      price: 2499,
      category: 'Supplements',
      image: 'https://images.unsplash.com/photo-1600180758895-31f4e6b6a1a1?auto=format&fit=crop&w=900&q=80',
      stock: 10,
      vendor: admin._id,
      isActive: true,
    },
    {
      name: 'Himalayan Herbal Oil',
      description: 'Cold-pressed mountain oil infused with aromatic herbs for wellness and nourishment.',
      price: 1090,
      category: 'Oils',
      image: 'https://images.unsplash.com/photo-1498819508721-1352facbea6d?auto=format&fit=crop&w=900&q=80',
      stock: 12,
      vendor: admin._id,
      isActive: true,
    },
    {
      name: 'Spiced Nut Chikki',
      description: 'Crunchy Himalayan nut brittle with a hint of spice for a delicious snack.',
      price: 520,
      category: 'Dry Fruits',
      image: 'https://images.unsplash.com/photo-1523986371872-9d3ba2e2f6b0?auto=format&fit=crop&w=900&q=80',
      stock: 16,
      vendor: admin._id,
      isActive: true,
    },
  ];

  await Product.insertMany(products);
};

const seedProducts = async (adminUser) => {
  const existingCount = await Product.countDocuments();
  if (existingCount > 0) {
    return;
  }

  const products = [
    {
      name: 'Himalayan Wild Honey',
      description: 'Pure wildflower honey harvested from high-altitude Himalayan hives.',
      price: 1290,
      category: 'Honey',
      image: 'https://images.unsplash.com/photo-1587049352851-8d4e892a1153?auto=format&fit=crop&w=900&q=80',
      stock: 24,
      vendor: adminUser._id,
      isActive: true,
    },
    {
      name: 'Organic Almond Mix',
      description: 'A premium blend of roasted almonds, walnuts, and cashews from mountain orchards.',
      price: 890,
      category: 'Dry Fruits',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
      stock: 18,
      vendor: adminUser._id,
      isActive: true,
    },
    {
      name: 'Mountain Tea Ritual',
      description: 'A calming herbal tea crafted from native Himalayan botanicals.',
      price: 690,
      category: 'Tea',
      image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=900&q=80',
      stock: 15,
      vendor: adminUser._id,
      isActive: true,
    },
    {
      name: 'Apricot & Almond Delight',
      description: 'Sweet dried apricots with crunchy nuts for a nourishing Himalayan snack.',
      price: 720,
      category: 'Dry Fruits',
      image: 'https://images.unsplash.com/photo-1524594154900-2e8ded384f1a?auto=format&fit=crop&w=900&q=80',
      stock: 22,
      vendor: adminUser._id,
      isActive: true,
    },
    {
      name: 'Namkeen Chai Spice Mix',
      description: 'A savory tea blend with traditional Himalayan spices to brighten your chai.',
      price: 450,
      category: 'Tea',
      image: 'https://images.unsplash.com/photo-1611691543816-0a6303cf72b2?auto=format&fit=crop&w=900&q=80',
      stock: 20,
      vendor: adminUser._id,
      isActive: true,
    },
    {
      name: 'Shilajeet Resin',
      description: 'Pure Himalayan shilajeet resin to support strength, vitality, and natural energy.',
      price: 2499,
      category: 'Supplements',
      image: 'https://images.unsplash.com/photo-1600180758895-31f4e6b6a1a1?auto=format&fit=crop&w=900&q=80',
      stock: 10,
      vendor: adminUser._id,
      isActive: true,
    },
    {
      name: 'Himalayan Herbal Oil',
      description: 'Cold-pressed mountain oil infused with aromatic herbs for wellness and nourishment.',
      price: 1090,
      category: 'Oils',
      image: 'https://images.unsplash.com/photo-1498819508721-1352facbea6d?auto=format&fit=crop&w=900&q=80',
      stock: 12,
      vendor: adminUser._id,
      isActive: true,
    },
    {
      name: 'Spiced Nut Chikki',
      description: 'Crunchy Himalayan nut brittle with a hint of spice for a delicious snack.',
      price: 520,
      category: 'Dry Fruits',
      image: 'https://images.unsplash.com/photo-1523986371872-9d3ba2e2f6b0?auto=format&fit=crop&w=900&q=80',
      stock: 16,
      vendor: adminUser._id,
      isActive: true,
    },
  ];

  await Product.insertMany(products);
};

const startServer = async () => {
  try {
    await connectDB();
    const adminUser = await ensureDefaultAdmin();
    await seedProducts(adminUser);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('Default admin ready: admin@northnest.com / Admin123!');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', async () => {
  console.log('Server shutting down...');
  process.exit(0);
});
