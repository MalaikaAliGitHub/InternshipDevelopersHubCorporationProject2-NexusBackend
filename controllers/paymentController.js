const Payment = require('../models/Payment');
const { v4: uuidv4 } = require('uuid');

exports.initiatePayment = async (req, res) => {
  try {
    console.log('🔥 initiatePayment body:', req.body);

    if (!req.user) {
      console.error('initiatePayment: missing req.user');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { service, amount } = req.body;

    if (!service || amount == null) {
      return res.status(400).json({ message: 'Service and amount are required' });
    }

    const transactionId = uuidv4();

    const payment = new Payment({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      },
      service,
      amount,
      transactionId,
      status: 'pending'
    });

    await payment.save();

    console.log('✅ Payment initiated saved:', payment.transactionId);

    return res.status(201).json({
      message: 'Payment initiated',
      transactionId: payment.transactionId,
      status: payment.status,
      service: payment.service,
      amount: payment.amount,
      user: { name: payment.user.name, email: payment.user.email }
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    return res.status(500).json({ message: 'Error initiating payment', error: error.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    console.log('🔥 confirmPayment body:', req.body);

    const { transactionId, status } = req.body;
    if (!transactionId || !status) {
      return res.status(400).json({ message: 'transactionId and status required' });
    }

    const payment = await Payment.findOne({ transactionId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    payment.status = status;
    await payment.save();

    console.log('✅ Payment confirmed:', transactionId, status);
    return res.status(200).json({ message: `Payment ${status}`, payment });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return res.status(500).json({ message: 'Error confirming payment', error: error.message });
  }
};
