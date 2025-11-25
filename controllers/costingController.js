const Costing = require('../models/Costing');

exports.createCosting = async (req, res) => {
    try {
        // Add creator to req.body
        req.body.createdBy = req.user.id;

        const costing = await Costing.create(req.body);
        res.status(201).json({ success: true, data: costing });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getCostings = async (req, res) => {
    try {
        const costings = await Costing.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: costings.length, data: costings });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
