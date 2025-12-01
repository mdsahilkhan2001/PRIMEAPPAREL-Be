const mongoose = require('mongoose');

const customizationRequestSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    designType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    referenceImages: [{
        type: String // URLs to uploaded images
    }],
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    colors: [{
        name: String,
        hex: String
    }],
    sizes: [{
        type: String
    }],
    budget: {
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        }
    },
    quality: {
        type: String,
        enum: ['Standard', 'Premium', 'Luxury'],
        default: 'Standard'
    },
    deadline: {
        type: Date,
        required: true
    },
    additionalNotes: {
        type: String
    },
    status: {
        type: String,
        enum: ['PENDING', 'REVIEWING', 'QUOTED', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
        default: 'PENDING'
    },
    sellerQuote: {
        type: Number
    },
    sellerResponse: {
        type: String
    },
    quotedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
customizationRequestSchema.index({ buyer: 1, status: 1 });
customizationRequestSchema.index({ seller: 1, status: 1 });
customizationRequestSchema.index({ product: 1 });

module.exports = mongoose.model('CustomizationRequest', customizationRequestSchema);
