<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# North Nest - Premium Organic Products Platform

A production-ready MERN stack e-commerce application for premium organic products sourced from the Himalayas, featuring AI-powered recommendations using Google Gemini API.

## 🎯 Project Overview

North Nest is a full-featured e-commerce platform built with modern technologies:
- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express.js + MongoDB + Mongoose
- **Database**: MongoDB
- **Authentication**: JWT + bcryptjs
- **AI Integration**: Google Gemini API for recommendations and health advice
- **Security**: Helmet, CORS, Rate Limiting, Input Validation

## 📁 Project Structure

```
purely-himalayan/
├── backend/
│   ├── config/              # Database and constants configuration
│   ├── controllers/         # Request handlers for all routes
│   ├── middleware/          # Auth, validation, and error handling
│   ├── models/              # MongoDB schemas (User, Product, Order, Cart)
│   ├── routes/              # API endpoint routes
│   ├── services/            # Gemini AI service
│   ├── utils/               # JWT, response formatting, validators
│   ├── uploads/             # File upload directory
│   ├── .env                 # Environment variables
│   └── server.js            # Express server setup
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── layouts/         # Layout components
│   │   ├── context/         # React Context (Auth, Cart)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── utils/           # Utilities (formatters, validators, toast)
│   │   ├── config/          # Frontend constants
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── .env                 # Environment variables
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── package.json         # Frontend dependencies
│
├── index.html               # HTML entry point
├── package.json             # Root dependencies
└── README.md               # This file
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- Google Gemini API Key

### 1. Clone & Navigate
```bash
cd purely-himalayan
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file with required variables
# Update MongoDB URI and Gemini API Key in .env

# Start backend server (runs on port 5000)
npm run dev
```

### 3. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
# VITE_API_BASE_URL=http://localhost:5000/api

# Start frontend dev server (runs on port 5173)
npm run dev
```

### 4. Full Stack Development
```bash
# From root directory, run both servers concurrently
npm install
npm run dev
```

## 🔑 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/purely-himalayan
JWT_SECRET=your_strong_jwt_secret_key
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🏗️ API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products (with filters/pagination)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Protected)
- `PUT /api/products/:id` - Update product (Protected)
- `DELETE /api/products/:id` - Delete product (Protected)
- `POST /api/products/:id/reviews` - Add product review (Protected)

### Cart
- `GET /api/cart` - Get user cart (Protected)
- `POST /api/cart/add` - Add to cart (Protected)
- `PUT /api/cart/update` - Update cart item (Protected)
- `POST /api/cart/remove` - Remove from cart (Protected)
- `DELETE /api/cart/clear` - Clear cart (Protected)

### Orders
- `POST /api/orders` - Create order (Protected)
- `GET /api/orders` - Get user orders (Protected)
- `GET /api/orders/:id` - Get order details (Protected)
- `PUT /api/orders/:id/status` - Update order status (Protected)
- `POST /api/orders/:id/cancel` - Cancel order (Protected)

### AI Features
- `POST /api/ai/recommendations` - Get AI product recommendations
- `POST /api/ai/advice` - Get health advice about products

## 📦 Key Features

### Frontend Features
- ✅ Responsive design (mobile-first)
- ✅ User authentication & authorization
- ✅ Product browsing with filters & search
- ✅ Shopping cart management
- ✅ Checkout & order placement
- ✅ Order history & tracking
- ✅ User profile management
- ✅ Product reviews & ratings
- ✅ Smooth animations (Framer Motion)
- ✅ Toast notifications
- ✅ Protected routes

### Backend Features
- ✅ RESTful API architecture
- ✅ JWT authentication
- ✅ Password hashing with bcryptjs
- ✅ MongoDB database with Mongoose
- ✅ Input validation
- ✅ Error handling middleware
- ✅ Rate limiting
- ✅ CORS security
- ✅ Google Gemini AI integration
- ✅ Product recommendations
- ✅ Health advice generation

## 🎨 UI/UX Components

### Common Components
- Button (multiple variants)
- Input (with validation)
- Textarea
- Loading spinner
- Product card
- Header/Navigation
- Footer
- Protected route wrapper

### Pages
- Home page
- Products listing
- Product detail
- Shopping cart
- Checkout
- Login/Register
- User profile
- Orders history

## 🔐 Security Features

1. **Authentication**: JWT-based authentication
2. **Password Security**: bcryptjs hashing
3. **Input Validation**: Express validator
4. **CORS**: Configured for specific origins
5. **Helmet**: Security headers
6. **Rate Limiting**: DDoS protection
7. **Protected Routes**: Middleware for authorization
8. **Environment Variables**: Sensitive data protection

## 🚢 Production Deployment

### Backend Deployment (Heroku, AWS, Railway, etc.)
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Frontend Deployment (Vercel, Netlify, etc.)
```bash
# Build for production
cd frontend
npm run build

# Deploy dist/ folder
```

## 📝 Code Quality

- ES6+ syntax
- Functional React components with hooks
- Clean separation of concerns
- Reusable components
- DRY principles
- Meaningful variable names
- Proper error handling
- Loading states
- Input validation

## 🛠️ Available Scripts

### Root
```bash
npm run dev           # Run both frontend and backend
npm install          # Install all dependencies
```

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Frontend
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 📚 Technologies Used

- **Frontend**: React, Vite, React Router, Axios, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs
- **Security**: Helmet, CORS, express-rate-limit, express-validator
- **AI**: Google Generative AI (Gemini)
- **Development**: ESLint, Prettier, Git

## 🤝 Contributing

This is a production-ready template. Follow these principles:
- Keep components small and reusable
- Maintain consistent code style
- Write meaningful commit messages
- Test before deploying
- Update README for changes

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Verify connection string in .env
- Check firewall settings

### CORS Errors
- Verify CORS_ORIGIN in backend .env
- Check if frontend URL matches

### API Errors
- Check server logs
- Verify environment variables
- Ensure all required fields in requests

### Frontend Issues
- Clear node_modules and reinstall
- Clear browser cache
- Check Vite dev server is running

## 📞 Support

For issues or questions, check the logs and verify your setup matches the requirements above.

---

**Built with ❤️ - A Production-Ready MERN E-Commerce Platform**
