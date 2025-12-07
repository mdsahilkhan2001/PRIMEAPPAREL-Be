const Settings = require('../models/Settings');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();

        // If no settings exist, create default
        if (!settings) {
            settings = await Settings.create({});
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings();
        }

        settings.siteName = req.body.siteName || settings.siteName;
        settings.siteLogo = req.body.siteLogo || settings.siteLogo;
        settings.supportEmail = req.body.supportEmail || settings.supportEmail;
        settings.supportPhone = req.body.supportPhone || settings.supportPhone;
        settings.officeAddress = req.body.officeAddress || settings.officeAddress;

        if (req.body.socialLinks) {
            settings.socialLinks = {
                ...settings.socialLinks,
                ...req.body.socialLinks
            };
        }

        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSettings,
    updateSettings
};

const Settings = require('../models/Settings');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();

        // If no settings exist, create default settings
        if (!settings) {
            settings = await Settings.create({});
        }

        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create(req.body);
        } else {
            settings = await Settings.findOneAndUpdate(
                {},
                req.body,
                { new: true, runValidators: true }
            );
        }

        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSettings,
    updateSettings
};
