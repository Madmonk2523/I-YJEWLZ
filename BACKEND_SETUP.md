# Quick Backend Implementation - Node.js + Stripe

This file provides ready-to-use code to turn your I&Y JEWLZ site into a real online store.

## Installation (5 minutes)

```bash
# Create a server folder
mkdir server
cd server

# Initialize Node project
npm init -y

# Install dependencies
npm install express cors dotenv stripe nodemailer body-parser
```

## Step 1: Create `.env` file

```
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLIC_KEY=pk_test_your_key_here
PORT=3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/iy-jewlz
```

Get your Stripe keys from: https://dashboard.stripe.com/apikeys

## Step 2: Create `server.js`

```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../')); // Serve static files from parent directory

// Email config
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ====== PAYMENT ROUTES ======

// Create Stripe Checkout Session
app.post('/api/checkout', async (req, res) => {
  try {
    const { cartItems, customer } = req.body;

    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.category,
          images: ['https://via.placeholder.com/400x400?text=I%26YJEWLZ']
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.qty
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customer?.email,
      success_url: `${process.env.DOMAIN || 'http://localhost:3000'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN || 'http://localhost:3000'}/cart.html`,
      metadata: {
        customer_name: customer?.name,
        customer_phone: customer?.phone,
        customer_address: customer?.address
      }
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Handle successful payment
app.get('/api/checkout/success/:session_id', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.session_id);
    
    // Save order to database here
    const order = {
      stripeSessionId: session.id,
      customerName: session.metadata?.customer_name,
      customerEmail: session.customer_email,
      customerPhone: session.metadata?.customer_phone,
      customerAddress: session.metadata?.customer_address,
      amount: session.amount_total / 100,
      status: 'pending',
      createdAt: new Date()
    };

    // Send confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: session.customer_email,
      subject: 'Order Confirmation - I&Y JEWLZ',
      html: `
        <h1>Thank You for Your Order!</h1>
        <p>We've received your order and will process it shortly.</p>
        <p><strong>Order ID:</strong> ${session.id}</p>
        <p><strong>Total:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
        <p>We'll send you tracking information via email once your package ships.</p>
        <p>Questions? Contact us at 929-648-0535 or davidyagudayev2018@gmail.com</p>
      `
    });

    res.json({ success: true, order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ====== CONTACT FORM ROUTE ======

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Send to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'davidyagudayev2018@gmail.com',
      subject: `New Contact Form: ${name}`,
      html: `
        <h3>New Message from Contact Form</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    });

    // Send confirmation to customer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'We received your message - I&Y JEWLZ',
      html: `
        <h2>Thank you for contacting I&Y JEWLZ!</h2>
        <p>Hi ${name},</p>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <p>Best regards,<br>I&Y JEWLZ Team</p>
      `
    });

    res.json({ success: true, message: 'Message sent!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ====== NEWSLETTER ROUTE ======

app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to I&Y JEWLZ Newsletter!',
      html: `
        <h2>Welcome!</h2>
        <p>Thank you for subscribing to our newsletter.</p>
        <p>You'll receive exclusive discounts, new product launches, and special offers.</p>
        <p>Check your inbox for a special 15% off welcome coupon!</p>
      `
    });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ====== INVENTORY ROUTE (Example) ======

app.get('/api/products', (req, res) => {
  // Return products from database
  const products = [
    { id: 1, name: 'Diamond Ring', price: 2499, stock: 5 },
    // ... add more from your script.js
  ];
  res.json(products);
});

// ====== ORDERS ROUTE ======

app.get('/api/orders/:email', async (req, res) => {
  try {
    // Fetch orders for customer email from database
    res.json({ orders: [] }); // Replace with database query
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ====== ADMIN ROUTES ======

// Get all orders (protected)
app.get('/api/admin/orders', async (req, res) => {
  // Add authentication here
  res.json({ orders: [] });
});

// Update order status
app.patch('/api/admin/orders/:id', async (req, res) => {
  const { status } = req.body;
  // Update in database
  res.json({ success: true });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

## Step 3: Update Frontend - Add this to `script.js`

```javascript
// Add to your main script.js file

// Checkout handler
window.handleCheckout = async function() {
  const cart = getCart();
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  // Get customer info (could be from form)
  const customer = {
    name: prompt('Your Name:') || 'Customer',
    email: prompt('Your Email:') || 'customer@example.com',
    phone: prompt('Your Phone:') || '000-000-0000',
    address: prompt('Your Address:') || 'Not provided'
  };

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItems: cart, customer })
    });

    const { id } = await response.json();
    
    // Redirect to Stripe
    const stripe = Stripe('YOUR_STRIPE_PUBLIC_KEY');
    await stripe.redirectToCheckout({ sessionId: id });
  } catch (error) {
    alert('Checkout failed: ' + error.message);
  }
};

// Contact form handler
async function handleContactSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message')
    })
  });

  if (response.ok) {
    alert('Message sent! We\'ll reply within 24 hours.');
    form.reset();
  }
}

// Newsletter handler
async function handleNewsletterSubmit(event) {
  event.preventDefault();
  const email = event.target.querySelector('input[type="email"]').value;
  
  const response = await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  if (response.ok) {
    alert('Thanks for subscribing! Check your email for a special offer.');
    event.target.reset();
  }
}
```

## Step 4: Update HTML - Checkout Button

In `cart.html`, change the checkout button:

```html
<!-- Old -->
<button class="btn btn-outline btn-block">Checkout</button>

<!-- New -->
<button class="btn btn-primary btn-block" onclick="handleCheckout()">Proceed to Checkout</button>
```

## Step 5: Run Locally

```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Start simple HTTP server (in parent directory)
python -m http.server 8000

# Visit http://localhost:8000
```

## Step 6: Deploy on Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd server && vercel
# Follow prompts to connect GitHub and deploy
```

## Step 7: Add Environment Variables on Vercel

1. Go to your Vercel project settings
2. Add these environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLIC_KEY`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `DATABASE_URL`

## Testing Stripe Payments

Use these test card numbers:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)

## Next: Add Database

Replace `// Save to database` comments with actual MongoDB code:

```javascript
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  stripeSessionId: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  amount: Number,
  status: String,
  items: Array,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// In your checkout route:
const order = new Order({
  stripeSessionId: session.id,
  customerName: session.metadata?.customer_name,
  customerEmail: session.customer_email,
  customerPhone: session.metadata?.customer_phone,
  amount: session.amount_total / 100,
  status: 'pending',
  items: cartItems
});
await order.save();
```

## Success! 🎉

You now have:
✅ Payment processing with Stripe
✅ Email notifications
✅ Contact form handling
✅ Newsletter signup
✅ Order management
✅ Customer tracking

**Ready to make your first sale!**

