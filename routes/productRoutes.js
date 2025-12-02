const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    getSellerProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fixProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.route('/fix-db').get(fixProducts);
router.route('/').get(getProducts);

// Protected routes - must be before /:id to avoid matching "my-products" as an id
router.route('/my-products').get(protect, authorize('SELLER', 'DESIGNER', 'ADMIN'), getSellerProducts);

// Protected routes with file upload
router.route('/')
    .post(protect, authorize('SELLER', 'DESIGNER', 'ADMIN'), upload.fields([
        { name: 'images', maxCount: 10 },
        { name: 'video', maxCount: 1 },
        { name: 'techpack', maxCount: 1 },
        { name: 'complianceDocs', maxCount: 1 }
    ]), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, authorize('SELLER', 'DESIGNER', 'ADMIN'), upload.fields([
        { name: 'images', maxCount: 10 },
        { name: 'video', maxCount: 1 },
        { name: 'techpack', maxCount: 1 },
        { name: 'complianceDocs', maxCount: 1 }
    ]), updateProduct)
    .delete(protect, authorize('SELLER', 'DESIGNER', 'ADMIN'), deleteProduct);

module.exports = router;
