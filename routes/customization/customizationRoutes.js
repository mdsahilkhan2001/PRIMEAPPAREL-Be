const express = require('express');
const router = express.Router();
const {
    createCustomizationRequest,
    getBuyerRequests,
    getSellerRequests,
    getRequestById,
    updateCustomizationRequest,
    deleteCustomizationRequest
} = require('../../controllers/customization/customizationController');
const { protect, authorize } = require('../../middleware/authMiddleware');
const upload = require('../../middleware/uploadMiddleware');

// Buyer routes
router.post('/', protect, upload.array('referenceImages', 5), createCustomizationRequest);
router.get('/my-requests', protect, getBuyerRequests);

// Seller routes
router.get('/seller-requests', protect, authorize('SELLER', 'ADMIN', 'DESIGNER'), getSellerRequests);

// Shared routes
router.get('/:id', protect, getRequestById);
router.put('/:id', protect, updateCustomizationRequest);
router.delete('/:id', protect, deleteCustomizationRequest);

module.exports = router;
