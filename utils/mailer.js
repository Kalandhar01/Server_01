const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPriceAlert = async (to, productTitle, currentPrice, targetPrice) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Price Alert: ${productTitle}`,
    text: `Good news! The product "${productTitle}" has reached your target price of ${targetPrice}. Current price: ${currentPrice}`,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendPriceAlert };
