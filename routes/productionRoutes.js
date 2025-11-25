const express = require('express');
const router = express.Router();
const { createProduction, getProductionByOrder, updateStage, addQCReport } = require('../controllers/productionController');

router.post('/', createProduction);
router.get('/:orderId', getProductionByOrder);
router.put('/:orderId/stage', updateStage);
router.post('/:orderId/qc', addQCReport);

module.exports = router;
