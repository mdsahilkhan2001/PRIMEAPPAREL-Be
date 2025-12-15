const express = require('express');
const router = express.Router();
const { createOrder, generatePI, recordPayment, getBuyerOrders, getSellerOrders } = require('../controllers/orderController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.get('/my-orders', protect, getBuyerOrders);
router.get('/seller-orders', protect, getSellerOrders);
router.post('/', createOrder);
router.post('/:id/generate-pi', generatePI);
router.post('/:id/payment', upload.single('proof'), recordPayment);

module.exports = router;
