const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    getSellerProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.route('/').get(getProducts);

// Protected routes - must be before /:id to avoid matching "my-products" as an id
router.route('/my-products').get(protect, authorize('SELLER', 'ADMIN'), getSellerProducts);

// Protected routes with file upload
router.route('/')
    .post(protect, authorize('SELLER', 'ADMIN'), upload.array('images', 10), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, authorize('SELLER', 'ADMIN'), upload.array('images', 10), updateProduct)
    .delete(protect, authorize('SELLER', 'ADMIN'), deleteProduct);

module.exports = router;
