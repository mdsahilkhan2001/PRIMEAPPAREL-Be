const Production = require('../models/Production');
const Order = require('../models/Order');

exports.createProduction = async (req, res) => {
    try {
        const production = await Production.create(req.body);
        res.status(201).json({ success: true, data: production });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getProductionByOrder = async (req, res) => {
    try {
        const production = await Production.findOne({ order: req.params.orderId }).populate('order');
        if (!production) {
            return res.status(404).json({ success: false, error: 'Production record not found' });
        }
        res.status(200).json({ success: true, data: production });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.updateStage = async (req, res) => {
    try {
        const { stage, status, progress } = req.body;
        const update = {};
        update[`stages.${stage}.status`] = status;
        update[`stages.${stage}.progress`] = progress;

        if (status === 'IN_PROGRESS' && !req.body.startDate) {
            update[`stages.${stage}.startDate`] = Date.now();
        }
        if (status === 'COMPLETED') {
            update[`stages.${stage}.endDate`] = Date.now();
        }

        const production = await Production.findOneAndUpdate(
            { order: req.params.orderId },
            { $set: update },
            { new: true }
        );

        res.status(200).json({ success: true, data: production });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.addQCReport = async (req, res) => {
    try {
        const production = await Production.findOne({ order: req.params.orderId });
        if (!production) {
            return res.status(404).json({ success: false, error: 'Production record not found' });
        }

        production.qc.push(req.body);
        await production.save();

        res.status(200).json({ success: true, data: production });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
