const Product = require('../models/Product');

// @desc    Get all products with search, filter, sort, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const {
            search = '',
            category = 'all',
            sort = 'newest',
            page = 1,
            limit = 12
        } = req.query;

        // Build query
        let query = { status: 'ACTIVE' };

        // Search across multiple fields
        if (search && search.trim() !== '') {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { subCategory: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category !== 'all') {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { category: { $regex: category, $options: 'i' } },
                    { subCategory: { $regex: category, $options: 'i' } }
                ]
            });
        }

        // Determine sort order
        let sortOption = {};
        switch (sort) {
            case 'price-low':
                sortOption = { 'priceTiers.0.price': 1 };
                break;
            case 'price-high':
                sortOption = { 'priceTiers.0.price': -1 };
                break;
            case 'name-asc':
                sortOption = { name: 1 };
                break;
            case 'name-desc':
                sortOption = { name: -1 };
                break;
            case 'newest':
            default:
                sortOption = { createdAt: -1 };
                break;
        }

        // Pagination
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        const products = await Product.find(query)
            .populate('seller', 'name email company')
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        // Get total count for pagination
        const total = await Product.countDocuments(query);

        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('seller', 'name email company');

        if (product) {
            // Find previous and next products
            const prevProduct = await Product.findOne({ _id: { $lt: product._id }, status: 'ACTIVE' }).sort({ _id: -1 }).select('_id');
            const nextProduct = await Product.findOne({ _id: { $gt: product._id }, status: 'ACTIVE' }).sort({ _id: 1 }).select('_id');

            res.json({
                ...product.toObject(),
                prevProductId: prevProduct ? prevProduct._id : null,
                nextProductId: nextProduct ? nextProduct._id : null
            });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get seller's products
// @route   GET /api/products/my-products
// @access  Private (Seller/Admin)
const getSellerProducts = async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Seller/Admin)
const createProduct = async (req, res) => {
    try {
        console.log('=== CREATE PRODUCT DEBUG ===');
        console.log('User:', req.user);
        console.log('Files:', req.files);
        console.log('Body:', req.body);

        // Get uploaded images and video
        const imageUrls = req.files['images'] ? req.files['images'].map(file => `/uploads/${file.filename}`) : [];
        const videoUrl = req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : null;

        // Parse JSON fields sent as strings
        const priceTiers = req.body.priceTiers ? JSON.parse(req.body.priceTiers) : [];
        const colors = req.body.colors ? JSON.parse(req.body.colors) : [];
        const sizes = req.body.sizes ? JSON.parse(req.body.sizes) : [];
        const customization = req.body.customization ? JSON.parse(req.body.customization) : [];
        const specifications = req.body.specifications ? JSON.parse(req.body.specifications) : {};

        const productData = {
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            subCategory: req.body.subCategory,
            images: imageUrls,
            video: videoUrl,
            priceTiers,
            colors,
            sizes,
            moq: req.body.moq,
            leadTime: req.body.leadTime,
            customization,
            specifications,
            status: req.body.status || 'ACTIVE',
            seller: req.user._id
        };

        console.log('Product data to create:', productData);

        const product = await Product.create(productData);

        console.log('Product created successfully:', product._id);
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        console.error('Error stack:', error.stack);
        res.status(400).json({ message: error.message, error: error.toString() });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller/Admin)
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user is the owner or admin
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to update this product' });
        }

        // Handle new image uploads or keep existing images
        let imageUrls = product.images; // Keep existing images by default
        if (req.files && req.files['images'] && req.files['images'].length > 0) {
            // New images uploaded
            imageUrls = req.files['images'].map(file => `/uploads/${file.filename}`);
        } else if (req.body.images) {
            // No new files, check if images field is provided
            try {
                imageUrls = JSON.parse(req.body.images);
            } catch (e) {
                // If not JSON, might be existing URLs
                imageUrls = product.images;
            }
        }

        // Handle video upload
        let videoUrl = product.video;
        if (req.files && req.files['video'] && req.files['video'].length > 0) {
            videoUrl = `/uploads/${req.files['video'][0].filename}`;
        } else if (req.body.video === 'null' || req.body.video === '') {
            // Explicitly removed
            videoUrl = null;
        }

        // Parse JSON fields if they exist
        const updateData = {
            name: req.body.name || product.name,
            description: req.body.description || product.description,
            category: req.body.category || product.category,
            subCategory: req.body.subCategory || product.subCategory,
            images: imageUrls,
            video: videoUrl,
            priceTiers: req.body.priceTiers ? JSON.parse(req.body.priceTiers) : product.priceTiers,
            colors: req.body.colors ? JSON.parse(req.body.colors) : product.colors,
            sizes: req.body.sizes ? JSON.parse(req.body.sizes) : product.sizes,
            moq: req.body.moq || product.moq,
            leadTime: req.body.leadTime || product.leadTime,
            customization: req.body.customization ? JSON.parse(req.body.customization) : product.customization,
            specifications: req.body.specifications ? JSON.parse(req.body.specifications) : product.specifications,
            status: req.body.status || product.status,
            updatedAt: Date.now()
        };

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller/Admin)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user is the owner or admin
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({ message: 'Product removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    getSellerProducts,
    createProduct,
    updateProduct,
    deleteProduct
};
