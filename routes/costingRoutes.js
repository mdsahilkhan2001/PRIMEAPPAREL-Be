const express = require('express');
const router = express.Router();
const { createCosting, getCostings } = require('../controllers/costingController');

router.route('/')
    .post(createCosting)
    .get(getCostings);

module.exports = router;
