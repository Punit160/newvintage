const nodemailer = require('nodemailer');
const { emailTemplates } = require('./emailTemplates');

const sendEmail = async ({ email, subject, template, data, text }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let htmlContent = null;
  let textContent = text;

  // ✅ Use template if provided
  if (template && emailTemplates[template]) {
    const tpl = emailTemplates[template](data);
    htmlContent = tpl.html;
    textContent = tpl.text;

    // ✅ Use template subject if no explicit subject was passed
    if (!subject && tpl.subject) {
      subject = tpl.subject;
    }
  }

  // ✅ Ensure subject is never empty
  const finalSubject = subject || 'Vintage Health';

  return transporter.sendMail({
    from: `"Vintage App Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: finalSubject,
    text: textContent,
    html: htmlContent,
  });
};

module.exports = { sendEmail };