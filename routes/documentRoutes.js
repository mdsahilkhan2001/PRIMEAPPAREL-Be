const express = require('express');
const router = express.Router();
const {
    getOrderDocuments,
    generatePI,
    generateCI,
    generatePackingList,
    uploadAWB,
    getAllDocuments,
    getBuyerDocuments,
    downloadDocument,
    updateDocumentStatus
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public/Buyer routes
router.get('/my-orders', protect, getBuyerDocuments);
router.get('/:id/download', protect, downloadDocument);

// Seller/Admin routes - Get documents for specific order
router.get('/order/:orderId', protect, authorize('SELLER', 'ADMIN'), getOrderDocuments);

// Document generation routes (Seller/Admin only)
router.post('/generate-pi/:orderId', protect, authorize('SELLER', 'ADMIN'), generatePI);
router.post('/generate-ci/:orderId', protect, authorize('SELLER', 'ADMIN'), generateCI);
router.post('/generate-packing-list/:orderId', protect, authorize('SELLER', 'ADMIN'), generatePackingList);
router.post('/upload-awb/:orderId', protect, authorize('SELLER', 'ADMIN'), uploadAWB);

// Document status update
router.put('/:id/status', protect, authorize('SELLER', 'ADMIN'), updateDocumentStatus);

// Admin only routes
router.get('/all', protect, authorize('ADMIN'), getAllDocuments);

module.exports = router;
