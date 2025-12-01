const CustomizationRequest = require('../../models/customization/CustomizationRequest');
const Product = require('../../models/Product');

// @desc    Create new customization request
// @route   POST /api/customizations
// @access  Private (Buyer)
const createCustomizationRequest = async (req, res) => {
    try {
        const {
            productId,
            designType,
            description,
            quantity,
            colors,
            sizes,
            budget,
            quality,
            deadline,
            additionalNotes
        } = req.body;

        // Get product and seller info
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Get uploaded reference images
        const referenceImages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        // Parse JSON fields if needed
        const parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
        const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        const parsedBudget = typeof budget === 'string' ? JSON.parse(budget) : budget;

        const customizationRequest = await CustomizationRequest.create({
            product: productId,
            buyer: req.user._id,
            seller: product.seller,
            designType,
            description,
            referenceImages,
            quantity: Number(quantity),
            colors: parsedColors || [],
            sizes: parsedSizes || [],
            budget: parsedBudget,
            quality,
            deadline,
            additionalNotes
        });

        const populatedRequest = await CustomizationRequest.findById(customizationRequest._id)
            .populate('product', 'name images')
            .populate('buyer', 'name email')
            .populate('seller', 'name email company');

        res.status(201).json(populatedRequest);
    } catch (error) {
        console.error('Error creating customization request:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get buyer's customization requests
// @route   GET /api/customizations/my-requests
// @access  Private (Buyer)
const getBuyerRequests = async (req, res) => {
    try {
        const requests = await CustomizationRequest.find({ buyer: req.user._id })
            .populate('product', 'name images category')
            .populate('seller', 'name company')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error('Error fetching buyer requests:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get seller's customization requests
// @route   GET /api/customizations/seller-requests
// @access  Private (Seller/Admin/Designer)
const getSellerRequests = async (req, res) => {
    try {
        let query = {};

        // If user is a SELLER, only show requests for their products
        if (req.user.role === 'SELLER') {
            query = { seller: req.user._id };
        }
        // DESIGNER and ADMIN can see all requests (or you can add specific logic here)

        const requests = await CustomizationRequest.find(query)
            .populate('product', 'name images category')
            .populate('buyer', 'name email')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error('Error fetching seller requests:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single customization request by ID
// @route   GET /api/customizations/:id
// @access  Private (Buyer/Seller/Admin)
const getRequestById = async (req, res) => {
    try {
        const request = await CustomizationRequest.findById(req.params.id)
            .populate('product', 'name images category priceTiers moq')
            .populate('buyer', 'name email phone')
            .populate('seller', 'name email company phone');

        if (!request) {
            return res.status(404).json({ message: 'Customization request not found' });
        }

        // Check if user is authorized (buyer, seller, or admin)
        if (
            request.buyer._id.toString() !== req.user._id.toString() &&
            request.seller._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'ADMIN'
        ) {
            return res.status(403).json({ message: 'Not authorized to view this request' });
        }

        res.json(request);
    } catch (error) {
        console.error('Error fetching request:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update customization request (seller adds quote, buyer/seller updates status)
// @route   PUT /api/customizations/:id
// @access  Private (Buyer/Seller/Admin)
const updateCustomizationRequest = async (req, res) => {
    try {
        const request = await CustomizationRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Customization request not found' });
        }

        // Check authorization
        const isBuyer = request.buyer.toString() === req.user._id.toString();
        const isSeller = request.seller.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'ADMIN';
        const isDesigner = req.user.role === 'DESIGNER';

        if (!isBuyer && !isSeller && !isAdmin && !isDesigner) {
            return res.status(403).json({ message: 'Not authorized to update this request' });
        }

        // Seller/Designer/Admin can add quote and response
        if (isSeller || isAdmin || isDesigner) {
            if (req.body.sellerQuote !== undefined) {
                request.sellerQuote = req.body.sellerQuote;
                request.quotedAt = new Date();
                request.status = 'QUOTED';
            }
            if (req.body.sellerResponse) {
                request.sellerResponse = req.body.sellerResponse;
            }
        }

        // Buyer can accept/reject quotes
        if (isBuyer || isAdmin) {
            if (req.body.status === 'ACCEPTED' || req.body.status === 'REJECTED' || req.body.status === 'CANCELLED') {
                request.status = req.body.status;
            }
        }

        // Seller/Designer/Admin can update status
        if ((isSeller || isAdmin || isDesigner) && req.body.status) {
            request.status = req.body.status;
        }

        await request.save();

        const updatedRequest = await CustomizationRequest.findById(request._id)
            .populate('product', 'name images category')
            .populate('buyer', 'name email')
            .populate('seller', 'name email company');

        res.json(updatedRequest);
    } catch (error) {
        console.error('Error updating customization request:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete customization request
// @route   DELETE /api/customizations/:id
// @access  Private (Buyer/Admin)
const deleteCustomizationRequest = async (req, res) => {
    try {
        const request = await CustomizationRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Customization request not found' });
        }

        // Only buyer or admin can delete
        if (
            request.buyer.toString() !== req.user._id.toString() &&
            req.user.role !== 'ADMIN'
        ) {
            return res.status(403).json({ message: 'Not authorized to delete this request' });
        }

        await CustomizationRequest.findByIdAndDelete(req.params.id);

        res.json({ message: 'Customization request deleted successfully' });
    } catch (error) {
        console.error('Error deleting customization request:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCustomizationRequest,
    getBuyerRequests,
    getSellerRequests,
    getRequestById,
    updateCustomizationRequest,
    deleteCustomizationRequest
};
