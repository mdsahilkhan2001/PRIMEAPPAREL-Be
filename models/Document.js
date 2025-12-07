const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    documentType: {
        type: String,
        enum: ['PI', 'CI', 'PACKING_LIST', 'AWB', 'TECHPACK', 'OTHER'],
        required: true
    },
    documentNumber: {
        type: String,
        required: true,
        unique: true
    },
    filePath: {
        type: String,
        required: true
    }, // PDF URL
    version: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['DRAFT', 'SENT', 'APPROVED', 'CANCELLED'],
        default: 'DRAFT'
    },

    // Additional metadata for different document types
    metadata: {
        // For CI
        hsnCodes: [String],
        awbNumber: String,
        freightCharges: Number,

        // For Packing List
        totalWeight: Number,
        totalCBM: Number,
        numberOfCartons: Number,
        cartonDetails: [{
            cartonNumber: String,
            dimensions: String,
            weight: Number,
            contents: String
        }],

        // For AWB
        trackingNumber: String,
        courier: String,
        estimatedDelivery: Date,

        // General
        notes: String
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    sentTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }], // Email tracking

    history: [{
        action: {
            type: String,
            enum: ['CREATED', 'SENT', 'VIEWED', 'DOWNLOADED', 'UPDATED', 'CANCELLED']
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String
    }]
}, {
    timestamps: true
});

// Generate document number based on type
documentSchema.pre('save', async function (next) {
    if (this.isNew && !this.documentNumber) {
        const year = new Date().getFullYear();
        const prefix = this.documentType === 'PI' ? 'PAE' :
            this.documentType === 'CI' ? 'PAE-CI' :
                this.documentType === 'PACKING_LIST' ? 'PAE-PL' :
                    'PAE-DOC';

        // Find last document of this type
        const lastDoc = await this.constructor.findOne({
            documentType: this.documentType
        }).sort({ createdAt: -1 });

        let sequence = 1;
        if (lastDoc && lastDoc.documentNumber) {
            const lastNumber = lastDoc.documentNumber.split('-').pop();
            sequence = parseInt(lastNumber) + 1;
        }

        this.documentNumber = `${prefix}-${year}-${String(sequence).padStart(3, '0')}`;
    }
    next();
});

// Add to history before save
documentSchema.methods.addHistory = function (action, userId, note = '') {
    this.history.push({ action, user: userId, note });
    return this.save();
};

module.exports = mongoose.model('Document', documentSchema);
