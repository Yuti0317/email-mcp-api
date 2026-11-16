const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { subject, content, sender, senderName, sender_name, sendemame } =
    req.body || req.query || {};

  if (!subject || !content) {
    return res.status(400).json({ error: '缺少 subject 或 content 参数' });
  }

  const displayName =
    sender || senderName || sender_name || sendemame || 'AI Companion';

  // 自動相容你原本填在 Vercel 的變數名稱，或是新的 Gmail 變數名稱
  const gmailUser = process.env.GMAIL_USER || process.env.QQ_EMAIL;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.QQ_AUTH_CODE;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"${displayName}" <${gmailUser}>`,
      to: process.env.TO_EMAIL || gmailUser,
      subject: subject,
      text: content,
    });

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
