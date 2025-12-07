const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: [true, 'Please add a unique Item Code / Design Number'],
        unique: true,
        trim: true
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
    productType: {
        type: String,
        required: false
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
    shortDescription: {
        type: String,
        required: false // Optional, can be derived from description
    },
    techpack: {
        type: String, // URL to PDF file
        required: false
    },
    specifications: {
        material: String,
        fabricType: String,
        gsm: String, // New field
        technics: String, // Print/Embroidery type
        feature: String,
        origin: String,
        trims: String // New field
    },
    measurements: {
        type: Map,
        of: String // Flexible object for measurement table (e.g., { "Chest": "S: 38, M: 40", "Length": "S: 28, M: 29" })
    },
    incoterm: {
        type: String,
        default: 'FOB'
    },
    sampleTime: {
        type: String // e.g., "7 days"
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    costing: {
        fabricCost: Number,
        cmCost: Number,
        trimCost: Number,
        overheadCost: Number,
        hsCode: String,
        packagingSpecs: String,
        toleranceRule: String,
        complianceNeeded: {
            type: Boolean,
            default: false
        },
        complianceDocs: String, // URL to uploaded compliance document
        aqlStandard: {
            type: String,
            enum: ['2.5', '4.0'],
            default: '2.5'
        }
    },
    approvalStatus: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'APPROVED'
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
