const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },

    approvals: {
        fabric: { status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }, date: Date, notes: String },
        color: { status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }, date: Date, notes: String },
        size: { status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }, date: Date, notes: String },
        branding: { status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }, date: Date, notes: String },
        ppSample: { status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }, date: Date, imageUrl: String, notes: String }
    },

    stages: {
        cutting: {
            status: { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], default: 'NOT_STARTED' },
            progress: { type: Number, default: 0 },
            startDate: Date,
            endDate: Date
        },
        stitching: {
            status: { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], default: 'NOT_STARTED' },
            progress: { type: Number, default: 0 },
            startDate: Date,
            endDate: Date
        },
        finishing: {
            status: { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], default: 'NOT_STARTED' },
            progress: { type: Number, default: 0 },
            startDate: Date,
            endDate: Date
        },
        packing: {
            status: { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], default: 'NOT_STARTED' },
            progress: { type: Number, default: 0 },
            startDate: Date,
            endDate: Date
        }
    },

    qc: [{
        type: { type: String, enum: ['INLINE', 'TOP', 'FINAL'] },
        status: { type: String, enum: ['PASS', 'FAIL', 'PENDING'], default: 'PENDING' },
        date: { type: Date, default: Date.now },
        aql: { type: Number, default: 2.5 },
        defects: [{ description: String, count: Number }],
        reportUrl: String,
        images: [String]
    }],

    shipment: {
        courier: String,
        trackingNumber: String,
        etd: Date, // Estimated Time of Departure
        eta: Date, // Estimated Time of Arrival
        invoiceUrl: String,
        packingListUrl: String,
        awbUrl: String,
        status: { type: String, enum: ['PENDING', 'SHIPPED', 'DELIVERED'], default: 'PENDING' }
    }
}, { timestamps: true });

module.exports = mongoose.model('Production', productionSchema);
