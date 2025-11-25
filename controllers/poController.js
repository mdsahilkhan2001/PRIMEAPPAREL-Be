const PurchaseOrder = require('../models/PurchaseOrder');
const Supplier = require('../models/Supplier');

exports.createPO = async (req, res) => {
    try {
        const po = await PurchaseOrder.create(req.body);

        // Update Supplier Ledger (Billed Amount)
        await Supplier.findByIdAndUpdate(po.supplier, {
            $inc: { 'ledger.totalBilled': po.totalAmount, 'ledger.balance': po.totalAmount }
        });

        res.status(201).json({ success: true, data: po });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getPOs = async (req, res) => {
    try {
        const pos = await PurchaseOrder.find().populate('supplier').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: pos.length, data: pos });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.recordPOPayment = async (req, res) => {
    try {
        const po = await PurchaseOrder.findById(req.params.id);
        if (!po) {
            return res.status(404).json({ success: false, error: 'PO not found' });
        }

        const { amount, method, reference } = req.body;

        po.payments.push({ amount, method, reference, date: Date.now() });

        // Check if fully paid
        const totalPaid = po.payments.reduce((acc, curr) => acc + curr.amount, 0);
        if (totalPaid >= po.totalAmount) {
            po.status = 'COMPLETED';
        } else {
            po.status = 'PARTIAL_RECEIVED';
        }

        await po.save();

        // Update Supplier Ledger (Paid Amount & Balance)
        await Supplier.findByIdAndUpdate(po.supplier, {
            $inc: { 'ledger.totalPaid': amount, 'ledger.balance': -amount }
        });

        res.status(200).json({ success: true, data: po });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
