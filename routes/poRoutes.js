const express = require('express');
const router = express.Router();
const { createPO, getPOs, recordPOPayment } = require('../controllers/poController');

router.route('/')
    .post(createPO)
    .get(getPOs);

router.post('/:id/payment', recordPOPayment);

module.exports = router;
