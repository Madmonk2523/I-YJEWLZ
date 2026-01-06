const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// POST /api/contact - Handle form submissions
app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, jewelry_type, service_needed, description } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    // Format email body
    const emailBody = `
JEWELRY REPAIR REQUEST
━━━━━━━━━━━━━━━━━━━━━━━
Name: ${name}
Phone: ${phone || 'Not provided'}
Jewelry Type: ${jewelry_type || 'Not specified'}
Service Needed: ${service_needed || 'Not specified'}
━━━━━━━━━━━━━━━━━━━━━━━

Description:
${description}

━━━━━━━━━━━━━━━━━━━━━━━
Sent: ${new Date().toLocaleString()}
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'chasemallor@gmail.com',
      subject: 'Jewelry Repair Request',
      text: emailBody
    });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
