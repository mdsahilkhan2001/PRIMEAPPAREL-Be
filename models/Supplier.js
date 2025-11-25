const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactPerson: String,
    email: String,
    phone: String,
    address: String,
    category: { type: String, enum: ['FABRIC', 'TRIMS', 'MANUFACTURING', 'PACKING', 'LOGISTICS'] },
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        ifscCode: String
    },
    ledger: {
        totalBilled: { type: Number, default: 0 },
        totalPaid: { type: Number, default: 0 },
        balance: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
