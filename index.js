const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));

// Database Connection
const connectDB = require('./config/db');
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/costings', require('./routes/costingRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/production', require('./routes/productionRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/pos', require('./routes/poRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/customizations', require('./routes/customization/customizationRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));

// Serve static files for PDFs and Uploads
const path = require('path');
app.use('/pdfs', express.static(path.join(__dirname, 'public/pdfs')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.get('/', (req, res) => {
  res.send('Prime Apparel Exports API is running');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('=== SERVER ERROR ===');
  console.error('Error:', err);
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  console.error('Request body:', req.body);
  console.error('Request user:', req.user);

  res.status(err.status || 500).json({
    message: err.message || 'Something broke!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
