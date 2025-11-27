const express = require('express');
const router = express.Router();
const { createLead, getLeads, updateLead, getMyLeads } = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.get('/my-leads', protect, getMyLeads);

router.route('/')
    .post(protect, upload.array('referenceImages', 5), createLead)
    .get(protect, authorize('ADMIN', 'SELLER'), getLeads);

router.route('/:id')
    .put(updateLead);

module.exports = router;
