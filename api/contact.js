const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Handle POST request
module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { name, phone, jewelry_type, service_needed, description } = req.body;

      // Validate
      if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required' });
      }

      // Format email
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

      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
      console.error('Email error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
