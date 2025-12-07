const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    country: { type: String, required: true },
    productType: { type: String, required: true },
    quantity: { type: Number },
    budget: { type: String },
    message: { type: String },
    referenceImages: [{ type: String }], // URLs
    leadType: {
        type: String,
        enum: ['ODM', 'OEM', 'SAMPLE_REQUEST'],
        default: 'ODM' // Default to ODM for product inquiries
    },
    status: {
        type: String,
        enum: ['NEW', 'QUALIFIED', 'SCOPE_LOCKED', 'PI_SENT', 'ORDER_CONFIRMED', 'LOST'],
        default: 'NEW'
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    history: [{
        action: String,
        timestamp: { type: Date, default: Date.now },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
