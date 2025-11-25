const express = require('express');
const router = express.Router();
const { createOrder, generatePI, recordPayment } = require('../controllers/orderController');
const upload = require('../middleware/uploadMiddleware');

router.post('/', createOrder);
router.post('/:id/generate-pi', generatePI);
router.post('/:id/payment', upload.single('proof'), recordPayment);

module.exports = router;
