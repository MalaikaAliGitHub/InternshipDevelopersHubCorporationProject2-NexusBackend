const express = require('express');
const router = express.Router();
const { initiatePayment, confirmPayment } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

router.post('/initiate', authMiddleware, initiatePayment);
router.post('/confirm', authMiddleware, confirmPayment);

module.exports = router;
