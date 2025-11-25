const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
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

// Serve static files for PDFs and Uploads
app.use('/pdfs', express.static('public/pdfs'));
app.use('/uploads', express.static('public/uploads'));

app.get('/', (req, res) => {
  res.send('Prime Apparel Exports API is running');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
