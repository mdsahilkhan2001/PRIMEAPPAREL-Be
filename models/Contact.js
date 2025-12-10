const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    // Basic contact information
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    phone: {
        type: String
    },
    countryCode: {
        type: String,
        default: '+91'
    },

    // Enterprise/Company Information
    companyName: {
        type: String
    },
    companyWebsite: {
        type: String
    },
    industry: {
        type: String,
        enum: ['Retail', 'Wholesale', 'E-commerce', 'Fashion Brand', 'Manufacturing', 'Other']
    },
    companySize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '500+']
    },

    // Inquiry Details
    inquiryType: {
        type: String,
        enum: [
            'General Inquiry',
            'Bulk Order Request',
            'Partnership Opportunity',
            'Sample Request',
            'Custom Manufacturing (OEM/ODM)',
            'Pricing Information',
            'Other'
        ],
        default: 'General Inquiry'
    },
    orderVolume: {
        type: String
    },
    preferredContactMethod: [{
        type: String,
        enum: ['email', 'phone', 'whatsapp']
    }],
    timeline: {
        type: String,
        enum: ['Urgent', 'Within 1 week', 'Within 1 month', 'Just exploring']
    },
    referralSource: {
        type: String,
        enum: ['Google Search', 'Social Media', 'Referral', 'Trade Show', 'Advertisement', 'Other']
    },

    // Message content
    subject: {
        type: String,
        required: [true, 'Subject is required']
    },
    message: {
        type: String,
        required: [true, 'Message is required']
    },

    // Attachments
    attachments: [{
        filename: String,
        url: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Status tracking
    status: {
        type: String,
        enum: ['NEW', 'READ', 'REPLIED'],
        default: 'NEW'
    },

    // Reply tracking
    replyMethod: {
        type: String,
        enum: ['EMAIL', 'WHATSAPP', 'PHONE', 'IN_PERSON', 'OTHER'],
        default: null
    },
    repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    repliedAt: {
        type: Date
    },
    replyNotes: {
        type: String
    },

    // Follow-up tracking
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpDate: {
        type: Date
    },

    // Reply history for audit trail
    replyHistory: [{
        method: {
            type: String,
            enum: ['EMAIL', 'WHATSAPP', 'PHONE', 'IN_PERSON', 'OTHER']
        },
        repliedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        repliedAt: {
            type: Date,
            default: Date.now
        },
        notes: String
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Contact', contactSchema);

