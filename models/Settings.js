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
        default: ''
    },
    supportPhone: {
        type: String,
        default: ''
    },
    officeAddress: {
        type: String,
        default: ''
    },
    socialLinks: {
        facebook: {
            type: String,
            default: ''
        },
        instagram: {
            type: String,
            default: ''
        },
        linkedin: {
            type: String,
            default: ''
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
