const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    console.log('[Mailer] Email not configured. Would have sent:', subject);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"VoiceRank AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('[Mailer] Email sent to:', to);
  } catch (err) {
    console.error('[Mailer] Failed to send email:', err.message);
  }
};

module.exports = { sendEmail };
