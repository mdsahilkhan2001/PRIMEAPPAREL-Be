const Lead = require('../models/Lead');

// @desc    Create a new lead (Public)
// @route   POST /api/leads
// @access  Public
exports.createLead = async (req, res) => {
    try {
        const { name, email, phone, country, productType, quantity, budget, message, referenceImages } = req.body;

        // If user is a buyer, assign userId. If seller/admin, userId is optional (manual entry)
        const userId = req.user.role === 'BUYER' ? req.user.id : (req.body.userId || null);

        const lead = await Lead.create({
            name,
            email,
            phone,
            country,
            productType,
            quantity,
            budget,
            message,
            referenceImages,
            userId, // Can be null for manually added leads
            assignedTo: req.user.role === 'SELLER' ? req.user.id : null // Auto-assign if seller creates it
        });

        res.status(201).json({ success: true, data: lead });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get current user leads
// @route   GET /api/leads/my-leads
// @access  Private
exports.getMyLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: leads.length, data: leads });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private (Admin/Sales)
exports.getLeads = async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: leads.length, data: leads });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Update lead status
// @route   PUT /api/leads/:id
// @access  Private (Admin/Sales)
exports.updateLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!lead) {
            return res.status(404).json({ success: false, error: 'Lead not found' });
        }

        // Auto-create order when status changes to ORDER_CONFIRMED
        if (req.body.status === 'ORDER_CONFIRMED' && lead.userId) {
            const Order = require('../models/Order');

            // Check if order already exists for this lead
            const existingOrder = await Order.findOne({ lead: lead._id });

            if (!existingOrder) {
                // Generate PI number
                const piNumber = `PI-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

                // Create order
                await Order.create({
                    lead: lead._id,
                    userId: lead.userId, // Link to buyer
                    piNumber: piNumber,
                    buyerDetails: {
                        name: lead.name,
                        email: lead.email,
                        phone: lead.phone ? `${lead.countryCode || ''} ${lead.phone}` : '',
                        address: lead.country
                    },
                    products: [{
                        styleName: lead.productType,
                        quantity: lead.quantity || 0,
                        unitPrice: 0, // To be updated by seller
                        totalPrice: 0,
                        sizeBreakdown: 'To be confirmed'
                    }],
                    totalAmount: 0, // To be updated
                    status: 'PI_GENERATED',
                    timeline: {
                        piDate: new Date()
                    }
                });

                console.log(`✅ Order created automatically for lead ${lead._id}`);
            }
        }

        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
