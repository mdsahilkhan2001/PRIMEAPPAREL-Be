const mongoose = require('mongoose');

const costingSchema = new mongoose.Schema({
    styleName: { type: String, required: true },
    styleNumber: { type: String },
    fabricCost: { type: Number, required: true },
    fabricConsumption: { type: Number, required: true },
    trimCost: { type: Number, default: 0 },
    cmCost: { type: Number, required: true }, // Cut & Make
    packingCost: { type: Number, default: 0 },
    overheadCost: { type: Number, default: 0 },
    profitMargin: { type: Number, default: 20 }, // Percentage
    currency: { type: String, default: 'USD' },
    exwPrice: { type: Number },
    totalPrice: { type: Number },
    notes: { type: String },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Pre-save hook to calculate prices
costingSchema.pre('save', function (next) {
    const baseCost = (this.fabricCost * this.fabricConsumption) + this.trimCost + this.cmCost + this.packingCost + this.overheadCost;
    const profitAmount = baseCost * (this.profitMargin / 100);
    this.exwPrice = baseCost + profitAmount;
    // Total price logic can be extended if quantity is involved, for now it's per piece
    this.totalPrice = this.exwPrice;
    next();
});

module.exports = mongoose.model('Costing', costingSchema);
