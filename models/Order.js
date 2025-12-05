const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Buyer reference
    piNumber: { type: String, unique: true },
    buyerDetails: {
        name: String,
        company: String,
        address: String,
        email: String,
        phone: String
    },
    products: [{
        styleName: String,
        styleNumber: String,
        quantity: Number,
        unitPrice: Number,
        totalPrice: Number,
        sizeBreakdown: String
    }],
    commercialTerm: {
        type: String,
        enum: ['EXW', 'FOB', 'CIF', 'CIP', 'DDP_AIR', 'DDP_SEA'],
        default: 'EXW'
    },
    paymentTerms: { type: String, default: '50% Advance, 50% Before Shipment' },
    bankDetails: { type: String }, // Could be a reference or embedded
    totalAmount: { type: Number },
    currency: { type: String, default: 'USD' },
    status: {
        type: String,
        enum: ['PI_GENERATED', 'ADVANCE_RECEIVED', 'PRODUCTION', 'QC_PASSED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default: 'PI_GENERATED'
    },
    timeline: {
        piDate: { type: Date, default: Date.now },
        advanceDate: Date,
        productionStartDate: Date,
        shipmentDate: Date
    },
    documents: {
        piUrl: String,
        invoiceUrl: String,
        packingListUrl: String,
        awbUrl: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
