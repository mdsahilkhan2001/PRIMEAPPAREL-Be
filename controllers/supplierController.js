const Supplier = require('../models/Supplier');

exports.createSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.create(req.body);
        res.status(201).json({ success: true, data: supplier });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find().sort({ name: 1 });
        res.status(200).json({ success: true, count: suppliers.length, data: suppliers });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
