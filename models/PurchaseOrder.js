const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
    poNumber: { type: String, unique: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    type: { type: String, enum: ['FABRIC', 'TRIM', 'MANUFACTURING'], required: true },
    linkedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

    items: [{
        description: String,
        quantity: Number,
        unit: String,
        rate: Number,
        amount: Number
    }],

    totalAmount: { type: Number, required: true },
    deliveryDate: Date,
    status: { type: String, enum: ['DRAFT', 'SENT', 'PARTIAL_RECEIVED', 'COMPLETED', 'CANCELLED'], default: 'DRAFT' },

    payments: [{
        amount: Number,
        date: { type: Date, default: Date.now },
        method: String,
        reference: String,
        proofUrl: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
