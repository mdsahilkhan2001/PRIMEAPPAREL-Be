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
<<<<<<< HEAD
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
=======
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
>>>>>>> aadf8a94f09d3d3e21408e6fe41a17f60baa30ca
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
