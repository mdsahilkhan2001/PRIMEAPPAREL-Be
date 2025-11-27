const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: 'Prime Apparel Exports'
    },
    siteLogo: {
        type: String,
        default: ''
    },
    supportEmail: {
        type: String,
        default: 'support@primeapparel.com'
    },
    supportPhone: {
        type: String,
        default: '+91 98765 43210'
    },
    officeAddress: {
        type: String,
        default: 'New Delhi, India'
    },
    socialLinks: {
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        linkedin: { type: String, default: '' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
