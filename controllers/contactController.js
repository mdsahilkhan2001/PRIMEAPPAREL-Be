const Contact = require('../models/Contact');

// @desc    Create new contact message
// @route   POST /api/contacts
// @access  Public
exports.createContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        const contact = await Contact.create({
            name,
            email,
            phone,
            subject,
            message
        });

        res.status(201).json({
            success: true,
            data: contact,
            message: 'Message sent successfully'
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Get all contact messages
// @route   GET /api/contacts
// @access  Private (Seller/Admin)
exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Update contact status
// @route   PATCH /api/contacts/:id/status
// @access  Private (Seller/Admin)
exports.updateContactStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['NEW', 'READ', 'REPLIED'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                error: 'Message not found'
            });
        }

        res.status(200).json({
            success: true,
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Delete contact message
// @route   DELETE /api/contacts/:id
// @access  Private (Seller/Admin)
exports.deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                error: 'Message not found'
            });
        }

        await contact.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
            message: 'Message deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};
