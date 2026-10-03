const emailTemplates = {
  passwordReset: ({ name, resetUrl }) => ({
    html: `
      <h2>Password Reset</h2>
      <p>Hi ${name},</p>
      <p>You requested to reset your password.</p>
      <a href="${resetUrl}" style="padding:12px 20px;background:#EF4444;color:white;text-decoration:none;border-radius:5px;">
        Reset Password
      </a>
      <p>This link expires in 30 minutes.</p>
    `,
    text: `Reset your password: ${resetUrl}`
  }),
  
reminder: ({ name, topic, startTime }) => ({
  subject: `Reminder: Your consultation with Vintage Health`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h3 style="color: #1a3b5d;">Vintage Health</h3>
      <p>Dear ${name},</p>
      <p>This is a reminder of your upcoming consultation with <strong>Jennifer Mooneyham, FNP-BC</strong>.</p>
      <p><strong>Topic:</strong> ${topic}<br>
      <strong>Date & Time:</strong> ${startTime}</p>
      <p>Please be available at that time. We look forward to speaking with you.</p>
      <p>Sincerely,<br>The Vintage Health Team</p>
      <hr style="border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #777;">Jennifer Mooneyham is a Family Nurse Practitioner with 28 years of experience, including 15 years in the U.S. Armed Forces, and founder of 4 The Family Healthcare.</p>
      <p style="font-size: 12px; color: #777;">Visit us: <a href="https://vintagehealthbody.com/">https://vintagehealthbody.com/</a></p>
    </div>
  `,
  text: `
Dear ${name},

This is a reminder of your upcoming consultation with Jennifer Mooneyham, FNP-BC.

Topic: ${topic}
Date & Time: ${startTime}

Please be available at that time. We look forward to speaking with you.

Sincerely,
The Vintage Health Team

---
Jennifer Mooneyham is a Family Nurse Practitioner with 28 years of experience, including 15 years in the U.S. Armed Forces, and founder of 4 The Family Healthcare.

Visit us: https://vintagehealthbody.com/
  `
})}

module.exports = { emailTemplates };
