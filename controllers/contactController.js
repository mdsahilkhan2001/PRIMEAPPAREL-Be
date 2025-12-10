const Contact = require('../models/Contact');

// @desc    Create new contact message
// @route   POST /api/contacts
// @access  Public
exports.createContact = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            countryCode,
            companyName,
            companyWebsite,
            industry,
            companySize,
            inquiryType,
            orderVolume,
            preferredContactMethod,
            timeline,
            referralSource,
            subject,
            message,
            attachments
        } = req.body;

        const contact = await Contact.create({
            name,
            email,
            phone,
            countryCode,
            companyName,
            companyWebsite,
            industry,
            companySize,
            inquiryType,
            orderVolume,
            preferredContactMethod,
            timeline,
            referralSource,
            subject,
            message,
            attachments
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
        const contacts = await Contact.find()
            .populate('repliedBy', 'name email')
            .populate('replyHistory.repliedBy', 'name email')
            .sort({ createdAt: -1 });

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

// @desc    Get contact statistics
// @route   GET /api/contacts/stats
// @access  Private (Seller/Admin)
exports.getContactStats = async (req, res) => {
    try {
        const total = await Contact.countDocuments();

        // Count by status
        const byStatus = await Contact.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Count by reply method
        const byReplyMethod = await Contact.aggregate([
            { $match: { replyMethod: { $ne: null } } },
            { $group: { _id: '$replyMethod', count: { $sum: 1 } } }
        ]);

        // Pending follow-ups
        const pendingFollowUps = await Contact.countDocuments({
            followUpRequired: true,
            followUpDate: { $gte: new Date() }
        });

        // Overdue follow-ups
        const overdueFollowUps = await Contact.countDocuments({
            followUpRequired: true,
            followUpDate: { $lt: new Date() }
        });

        // Calculate average response time (for replied messages)
        const repliedMessages = await Contact.find({
            status: 'REPLIED',
            repliedAt: { $exists: true }
        }).select('createdAt repliedAt');

        let avgResponseTime = 0;
        if (repliedMessages.length > 0) {
            const totalTime = repliedMessages.reduce((acc, msg) => {
                return acc + (new Date(msg.repliedAt) - new Date(msg.createdAt));
            }, 0);
            avgResponseTime = Math.round(totalTime / repliedMessages.length / (1000 * 60 * 60)); // in hours
        }

        res.status(200).json({
            success: true,
            data: {
                total,
                byStatus: byStatus.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                byReplyMethod: byReplyMethod.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                avgResponseTime: `${avgResponseTime} hours`,
                pendingFollowUps,
                overdueFollowUps
            }
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

// @desc    Mark contact as replied with tracking
// @route   PATCH /api/contacts/:id/reply
// @access  Private (Seller/Admin)
exports.markAsReplied = async (req, res) => {
    try {
        const { replyMethod, notes, followUpRequired, followUpDate } = req.body;

        if (!['EMAIL', 'WHATSAPP', 'PHONE', 'IN_PERSON', 'OTHER'].includes(replyMethod)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid reply method'
            });
        }

        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                error: 'Message not found'
            });
        }

        // Update reply tracking
        contact.status = 'REPLIED';
        contact.replyMethod = replyMethod;
        contact.repliedBy = req.user._id;
        contact.repliedAt = new Date();
        contact.replyNotes = notes || '';
        contact.followUpRequired = followUpRequired || false;
        contact.followUpDate = followUpDate || null;

        // Add to reply history
        contact.replyHistory.push({
            method: replyMethod,
            repliedBy: req.user._id,
            repliedAt: new Date(),
            notes: notes || ''
        });

        await contact.save();

        // Populate user references before sending response
        await contact.populate('repliedBy', 'name email');
        await contact.populate('replyHistory.repliedBy', 'name email');

        res.status(200).json({
            success: true,
            data: contact,
            message: 'Reply tracked successfully'
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
