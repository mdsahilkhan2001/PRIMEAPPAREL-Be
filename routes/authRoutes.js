const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword,
    getAllUsers,
    deleteUser,
    updateUser
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Admin User Management Routes
router.route('/users')
    .get(protect, authorize('ADMIN'), getAllUsers);

router.route('/users/:id')
    .delete(protect, authorize('ADMIN'), deleteUser)
    .put(protect, authorize('ADMIN'), updateUser);

module.exports = router;
