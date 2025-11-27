const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getSettings)
    .put(protect, authorize('ADMIN'), updateSettings);

module.exports = router;
