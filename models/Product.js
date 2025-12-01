const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    images: [{
        type: String, // URL to image
        required: true
    }],
    video: {
        type: String, // URL to video (optional)
        required: false
    },
    priceTiers: [{
        minQty: { type: Number, required: true },
        maxQty: { type: Number }, // Optional for last tier (e.g. 1000+)
        price: { type: Number, required: true }
    }],
    colors: [{
        name: String,
        hex: String,
        image: String // Optional specific image for this color
    }],
    sizes: [{
        type: String
    }],
    moq: {
        type: Number,
        required: true,
        default: 1
    },
    leadTime: {
        type: String, // e.g., "7-15 days"
        required: true
    },
    customization: [{
        type: String // e.g., "Logo", "Packaging", "Graphic"
    }],
    specifications: {
        material: String,
        fabricType: String,
        technics: String,
        feature: String,
        origin: String
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['DRAFT', 'ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);
