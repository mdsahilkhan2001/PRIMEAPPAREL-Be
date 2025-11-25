const express = require('express');
const router = express.Router();
const { createSupplier, getSuppliers } = require('../controllers/supplierController');

router.route('/')
    .post(createSupplier)
    .get(getSuppliers);

module.exports = router;
