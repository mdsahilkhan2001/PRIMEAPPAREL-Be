const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ status: 'ACTIVE' }).populate('seller', 'name email company');
        res.json(products);
    } catch (error) {
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
            res.json(product);
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

        // Get uploaded images
        const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

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
        if (req.files && req.files.length > 0) {
            // New images uploaded
            imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        } else if (req.body.images) {
            // No new files, check if images field is provided
            try {
                imageUrls = JSON.parse(req.body.images);
            } catch (e) {
                // If not JSON, might be existing URLs
                imageUrls = product.images;
            }
        }

        // Parse JSON fields if they exist
        const updateData = {
            name: req.body.name || product.name,
            description: req.body.description || product.description,
            category: req.body.category || product.category,
            subCategory: req.body.subCategory || product.subCategory,
            images: imageUrls,
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
