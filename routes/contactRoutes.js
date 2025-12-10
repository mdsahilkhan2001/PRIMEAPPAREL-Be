const express = require('express');
const router = express.Router();
const {
    createContact,
    getAllContacts,
    getContactStats,
    updateContactStatus,
    markAsReplied,
    deleteContact
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(createContact)
    .get(protect, authorize('SELLER', 'ADMIN'), getAllContacts);

router.route('/stats')
    .get(protect, authorize('SELLER', 'ADMIN'), getContactStats);

router.route('/:id')
    .delete(protect, authorize('SELLER', 'ADMIN'), deleteContact);

router.route('/:id/status')
    .patch(protect, authorize('SELLER', 'ADMIN'), updateContactStatus);

router.route('/:id/reply')
    .patch(protect, authorize('SELLER', 'ADMIN'), markAsReplied);

module.exports = router;
