const express = require('express');
const cors = require('cors');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: { name: 'Pro-Zugang Rechnungstool' },
        unit_amount: 499,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: 'http://localhost:5173?success=true&session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'http://localhost:5173?canceled=true',
  });

  res.json({ url: session.url, sessionId: session.id });
});

app.use('/', require('./stripeWebhook'));
app.listen(4242, () => console.log('Server läuft auf Port 4242'));
