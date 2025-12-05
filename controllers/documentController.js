const Document = require('../models/Document');
const Order = require('../models/Order');
const { generatePDF } = require('../services/pdfService');
const { getPITemplate, getCITemplate, getPackingListTemplate } = require('../templates/documentTemplates');

// @desc    Get all documents for an order
// @route   GET /api/documents/order/:orderId
// @access  Private
exports.getOrderDocuments = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Check access permissions
        if (req.user.role === 'BUYER' && order.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const documents = await Document.find({ orderId: req.params.orderId })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: documents.length, data: documents });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Generate Proforma Invoice (PI)
// @route   POST /api/documents/generate-pi/:orderId
// @access  Private (Seller/Admin)
exports.generatePI = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('lead')
            .populate('userId', 'name email phone company');

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Check if PI already exists
        let document = await Document.findOne({
            orderId: order._id,
            documentType: 'PI'
        });

        if (document) {
            // Update version
            document.version += 1;
        } else {
            // Create new document record
            document = new Document({
                orderId: order._id,
                documentType: 'PI',
                createdBy: req.user.id,
                status: 'DRAFT'
            });
        }

        // Generate HTML from template
        const htmlContent = getPITemplate(order, document.documentNumber);

        // Generate PDF
        const fileName = `${document.documentNumber}-v${document.version}.pdf`;
        const pdfPath = await generatePDF(htmlContent, fileName);

        // Save document
        document.filePath = `/pdfs/${fileName}`;
        await document.save();

        // Add to history
        await document.addHistory('CREATED', req.user.id, 'PI generated');

        // Update order
        if (!order.documents.piUrl) {
            order.documents.piUrl = document.filePath;
            order.piNumber = document.documentNumber;
            order.status = 'PI_GENERATED';
            await order.save();
        }

        res.status(200).json({
            success: true,
            data: document,
            pdfUrl: document.filePath
        });
    } catch (error) {
        console.error('PI Generation Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Generate Commercial Invoice (CI)
// @route   POST /api/documents/generate-ci/:orderId
// @access  Private (Seller/Admin)
exports.generateCI = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('lead')
            .populate('userId', 'name email phone company');

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Get additional data from request body
        const { awbNumber, freightCharges, hsnCodes } = req.body;

        // Create new document record
        const document = new Document({
            orderId: order._id,
            documentType: 'CI',
            createdBy: req.user.id,
            status: 'DRAFT',
            metadata: {
                awbNumber,
                freightCharges,
                hsnCodes: hsnCodes || []
            }
        });

        // Generate HTML from template
        const htmlContent = getCITemplate(order, document.documentNumber, {
            awbNumber,
            freightCharges,
            hsnCodes
        });

        // Generate PDF
        const fileName = `${document.documentNumber}.pdf`;
        const pdfPath = await generatePDF(htmlContent, fileName);

        // Save document
        document.filePath = `/pdfs/${fileName}`;
        await document.save();
        await document.addHistory('CREATED', req.user.id, 'CI generated');

        // Update order
        order.documents.invoiceUrl = document.filePath;
        await order.save();

        res.status(200).json({
            success: true,
            data: document,
            pdfUrl: document.filePath
        });
    } catch (error) {
        console.error('CI Generation Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Generate Packing List
// @route   POST /api/documents/generate-packing-list/:orderId
// @access  Private (Seller/Admin)
exports.generatePackingList = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('lead')
            .populate('userId', 'name email phone company');

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        const { cartonDetails, totalWeight, totalCBM } = req.body;

        const document = new Document({
            orderId: order._id,
            documentType: 'PACKING_LIST',
            createdBy: req.user.id,
            status: 'DRAFT',
            metadata: {
                cartonDetails: cartonDetails || [],
                totalWeight,
                totalCBM,
                numberOfCartons: cartonDetails?.length || 0
            }
        });

        // Generate HTML from template
        const htmlContent = getPackingListTemplate(order, document.documentNumber, {
            cartonDetails,
            totalWeight,
            totalCBM
        });

        // Generate PDF
        const fileName = `${document.documentNumber}.pdf`;
        const pdfPath = await generatePDF(htmlContent, fileName);

        document.filePath = `/pdfs/${fileName}`;
        await document.save();
        await document.addHistory('CREATED', req.user.id, 'Packing list generated');

        // Update order
        order.documents.packingListUrl = document.filePath;
        await order.save();

        res.status(200).json({
            success: true,
            data: document,
            pdfUrl: document.filePath
        });
    } catch (error) {
        console.error('Packing List Generation Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Upload AWB/Tracking document
// @route   POST /api/documents/upload-awb/:orderId
// @access  Private (Seller/Admin)
exports.uploadAWB = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        const { trackingNumber, courier, estimatedDelivery, awbUrl } = req.body;

        const document = new Document({
            orderId: order._id,
            documentType: 'AWB',
            documentNumber: trackingNumber,
            createdBy: req.user.id,
            filePath: awbUrl || '',
            status: 'SENT',
            metadata: {
                trackingNumber,
                courier,
                estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null
            }
        });

        await document.save();
        await document.addHistory('CREATED', req.user.id, `AWB uploaded - ${courier}`);

        // Update order
        order.documents.awbUrl = document.filePath;
        order.status = 'SHIPPED';
        await order.save();

        res.status(200).json({ success: true, data: document });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get all documents (Admin only)
// @route   GET /api/documents/all
// @access  Private/Admin
exports.getAllDocuments = async (req, res) => {
    try {
        const { type, status } = req.query;
        const filter = {};

        if (type) filter.documentType = type;
        if (status) filter.status = status;

        const documents = await Document.find(filter)
            .populate('orderId')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get buyer's documents
// @route   GET /api/documents/my-orders
// @access  Private (Buyer)
exports.getBuyerDocuments = async (req, res) => {
    try {
        // Get all orders for this buyer
        const orders = await Order.find({ userId: req.user.id });
        const orderIds = orders.map(order => order._id);

        // Get all documents for these orders
        const documents = await Document.find({
            orderId: { $in: orderIds }
        })
            .populate('orderId', 'piNumber status totalAmount')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private
exports.downloadDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id)
            .populate('orderId');

        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        // Check permissions
        if (req.user.role === 'BUYER') {
            if (document.orderId.userId.toString() !== req.user.id) {
                return res.status(403).json({ success: false, error: 'Access denied' });
            }
        }

        // Add to history
        await document.addHistory('DOWNLOADED', req.user.id);

        res.status(200).json({
            success: true,
            downloadUrl: document.filePath
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update document status
// @route   PUT /api/documents/:id/status
// @access  Private (Seller/Admin)
exports.updateDocumentStatus = async (req, res) => {
    try {
        const { status, note } = req.body;

        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        document.status = status;
        await document.save();
        await document.addHistory('UPDATED', req.user.id, `Status changed to ${status}. ${note || ''}`);

        res.status(200).json({ success: true, data: document });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// End of controller
