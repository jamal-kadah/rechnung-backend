const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
let paidUsers = new Set();

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    paidUsers.add(session.id);
    console.log("✅ Zahlung erhalten:", session.id);
  }

  res.status(200).json({ received: true });
});

router.get('/access/:sessionId', (req, res) => {
  res.json({ access: paidUsers.has(req.params.sessionId) });
});

module.exports = router;
