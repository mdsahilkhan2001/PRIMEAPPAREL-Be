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

        // Build query - show APPROVED products with at least one image
        let query = { 
            approvalStatus: 'APPROVED',
            images: { $exists: true, $ne: [] }  // Must have at least one image
        };

        // Search across multiple fields
        if (search && search.trim() !== '') {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { subCategory: { $regex: search, $options: 'i' } },
                { productType: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category !== 'all') {
            query.category = { $regex: category, $options: 'i' };
        }

        if (req.query.subCategory) {
            query.subCategory = { $regex: req.query.subCategory, $options: 'i' };
        }

        if (req.query.productType) {
            query.productType = { $regex: req.query.productType, $options: 'i' };
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

        console.log('--- getProducts Debug ---');
        console.log('Query Params:', req.query);
        console.log('Mongo Query:', JSON.stringify(query));

        // Execute query
        const products = await Product.find(query)
            .populate('seller', 'name email company')
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        // Get total count for pagination
        const total = await Product.countDocuments(query);

        // Check total in DB regardless of query
        const absoluteTotal = await Product.countDocuments({});
        console.log(`Found ${products.length} products matching query`);
        console.log(`Total matching query: ${total}`);
        console.log(`Absolute total in DB: ${absoluteTotal}`);
        console.log('-------------------------');

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
            const prevProduct = await Product.findOne({ _id: { $lt: product._id }, status: 'ACTIVE', approvalStatus: 'APPROVED' }).sort({ _id: -1 }).select('_id');
            const nextProduct = await Product.findOne({ _id: { $gt: product._id }, status: 'ACTIVE', approvalStatus: 'APPROVED' }).sort({ _id: 1 }).select('_id');

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
        const query = req.user.role === 'ADMIN' ? {} : { seller: req.user._id };
        const products = await Product.find(query).sort({ createdAt: -1 }).populate('seller', 'name company');
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
        console.log('User:', req.user);
        console.log('Files:', req.files);
        console.log('Body:', req.body);

        // Get uploaded files - store only filenames, static middleware will handle /uploads/ prefix
        const imageUrls = req.files['images'] ? req.files['images'].map(file => file.filename) : [];
        const videoUrl = req.files['video'] ? req.files['video'][0].filename : null;
        const techpackUrl = req.files['techpack'] ? req.files['techpack'][0].filename : null;
        const complianceDocsUrl = req.files['complianceDocs'] ? req.files['complianceDocs'][0].filename : null;

        // Parse JSON fields sent as strings
        const priceTiers = req.body.priceTiers ? JSON.parse(req.body.priceTiers) : [];
        const colors = req.body.colors ? JSON.parse(req.body.colors) : [];
        const sizes = req.body.sizes ? JSON.parse(req.body.sizes) : [];
        const customization = req.body.customization ? JSON.parse(req.body.customization) : [];
        const specifications = req.body.specifications ? JSON.parse(req.body.specifications) : {};
        const costing = req.body.costing ? JSON.parse(req.body.costing) : {};
        const measurements = req.body.measurements ? JSON.parse(req.body.measurements) : {};

        // Add compliance docs to costing if uploaded
        if (complianceDocsUrl) {
            costing.complianceDocs = complianceDocsUrl;
        }

        console.log('=== BACKEND RECEIVED DATA ===');
        console.log('req.body.sku:', req.body.sku);
        console.log('req.body.name:', req.body.name);
        console.log('User Role:', req.user.role);

        // Determine status based on role
        let approvalStatus = 'APPROVED';
        let status = req.body.status || 'ACTIVE';

        if (req.user.role === 'DESIGNER') {
            approvalStatus = 'PENDING';
            status = 'INACTIVE'; // Designers' products are inactive until approved
        }

        const productData = {
            name: req.body.name,
            sku: req.body.sku,
            description: req.body.description,
            shortDescription: req.body.shortDescription,
            category: req.body.category,
            subCategory: req.body.subCategory,
            productType: req.body.productType,
            images: imageUrls,
            video: videoUrl,
            techpack: techpackUrl,
            priceTiers,
            colors,
            sizes,
            measurements,
            moq: req.body.moq,
            leadTime: req.body.leadTime,
            sampleTime: req.body.sampleTime,
            incoterm: req.body.incoterm,
            customization,
            specifications,
            costing,
            approvalStatus,
            status,
            seller: req.user._id
        };

        console.log('Product data to create:', productData);
        console.log('SKU in productData:', productData.sku);

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
            // New images uploaded - store only filenames
            imageUrls = req.files['images'].map(file => file.filename);
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
            videoUrl = req.files['video'][0].filename;
        } else if (req.body.video === 'null' || req.body.video === '') {
            // Explicitly removed
            videoUrl = null;
        }

        // Handle techpack upload
        let techpackUrl = product.techpack;
        if (req.files && req.files['techpack'] && req.files['techpack'].length > 0) {
            techpackUrl = req.files['techpack'][0].filename;
        }

        // Handle compliance docs upload
        let complianceDocsUrl = product.costing?.complianceDocs;
        if (req.files && req.files['complianceDocs'] && req.files['complianceDocs'].length > 0) {
            complianceDocsUrl = req.files['complianceDocs'][0].filename;
        }

        // Update status and approval status from request or keep existing
        let newStatus = req.body.status || product.status;
        let newApprovalStatus = req.body.approvalStatus || product.approvalStatus;

        // Parse costing and add compliance docs
        const costing = req.body.costing ? JSON.parse(req.body.costing) : product.costing;
        if (complianceDocsUrl) {
            costing.complianceDocs = complianceDocsUrl;
        }

        // Parse JSON fields if they exist
        const updateData = {
            name: req.body.name || product.name,
            sku: req.body.sku || product.sku,
            description: req.body.description || product.description,
            shortDescription: req.body.shortDescription || product.shortDescription,
            category: req.body.category || product.category,
            subCategory: req.body.subCategory || product.subCategory,
            productType: req.body.productType || product.productType,
            images: imageUrls,
            video: videoUrl,
            techpack: techpackUrl,
            priceTiers: req.body.priceTiers ? JSON.parse(req.body.priceTiers) : product.priceTiers,
            colors: req.body.colors ? JSON.parse(req.body.colors) : product.colors,
            sizes: req.body.sizes ? JSON.parse(req.body.sizes) : product.sizes,
            measurements: req.body.measurements ? JSON.parse(req.body.measurements) : product.measurements,
            moq: req.body.moq || product.moq,
            leadTime: req.body.leadTime || product.leadTime,
            sampleTime: req.body.sampleTime || product.sampleTime,
            incoterm: req.body.incoterm || product.incoterm,
            customization: req.body.customization ? JSON.parse(req.body.customization) : product.customization,
            specifications: req.body.specifications ? JSON.parse(req.body.specifications) : product.specifications,
            costing: costing,
            status: newStatus,
            approvalStatus: newApprovalStatus,
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

// @desc    Fix all products status
// @route   GET /api/products/fix-db
// @access  Public
const fixProducts = async (req, res) => {
    try {
        const result = await Product.updateMany(
            {},
            {
                $set: {
                    status: 'ACTIVE',
                    approvalStatus: 'APPROVED'
                }
            }
        );

        const products = await Product.find({});

        res.json({
            message: 'Database fixed',
            updatedCount: result.modifiedCount,
            totalProducts: products.length,
            products: products.map(p => ({
                id: p._id,
                name: p.name,
                status: p.status,
                approvalStatus: p.approvalStatus
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending design approvals
// @route   GET /api/products/pending-designs
// @access  Private (Admin)
const getPendingDesigns = async (req, res) => {
    try {
        console.log('=== GET PENDING DESIGNS ===');
        console.log('Query params:', req.query);
        console.log('User:', req.user?.email, req.user?.role);

        const { status = 'PENDING' } = req.query;

        let query = {};

        // Build query based on status filter
        if (status !== 'ALL') {
            query.approvalStatus = status;
        }

        console.log('MongoDB query:', query);

        // Fetch all products matching the approval status
        const designs = await Product.find(query)
            .populate('seller', 'name email role')
            .sort({ createdAt: -1 });

        console.log(`Found ${designs.length} total products`);

        // Filter to only show products from designers
        const designerProducts = designs.filter(product => {
            const isDesigner = product.seller && product.seller.role === 'DESIGNER';
            console.log(`Product ${product.name}: seller role = ${product.seller?.role}, isDesigner = ${isDesigner}`);
            return isDesigner;
        });

        console.log(`Filtered to ${designerProducts.length} designer products`);
        console.log('===========================');

        res.json(designerProducts);
    } catch (error) {
        console.error('Error fetching pending designs:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: error.message, error: error.toString() });
    }
};

// @desc    Update product approval status
// @route   PUT /api/products/:id/approval
// @access  Private (Admin)
const updateApprovalStatus = async (req, res) => {
    try {
        const { approvalStatus, status, rejectionReason } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update approval status
        product.approvalStatus = approvalStatus;

        // Update product status if provided
        if (status) {
            product.status = status;
        }

        // Add rejection reason if provided
        if (rejectionReason) {
            product.rejectionReason = rejectionReason;
        }

        await product.save();

        res.json(product);
    } catch (error) {
        console.error('Error updating approval status:', error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    getSellerProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fixProducts,
    getPendingDesigns,
    updateApprovalStatus
};
