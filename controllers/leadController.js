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
        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
