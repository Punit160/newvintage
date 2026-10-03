 // services/reminderService.js
const Meeting = require('../models/Meeting');
const { sendEmail } = require('../utils/sendEmail');


const sendReminders = async () => {
  const now = new Date();

  // 🔥 Wider safe window (22h → 26h)
const lower = new Date(now.getTime() + 21 * 60 * 60 * 1000); // +21 hours
const upper = new Date(now.getTime() + 27 * 60 * 60 * 1000); // +27 hours
  const meetings = await Meeting.find({
    status: 'accepted',
    startTime: { $gte: lower, $lte: upper },
    reminderSent: { $ne: true }
  }).populate('userId', 'email name');

  if (!meetings.length) {
    console.log('No reminders needed');
    return;
  }

  let sent = 0;

  await Promise.all(
    meetings.map(async (m) => {
      try {
        await sendEmail({
          email: m.userId.email,
          template: 'reminder',
          data: {
            name: m.userId.name || 'Customer',
            topic: m.topic,
           
            startTime: new Date(m.startTime).toLocaleString('en-IN', {
  timeZone: 'Asia/Kolkata',
  dateStyle: 'full',
  timeStyle: 'short'
})
            
          }
        });

        m.reminderSent = true;
        await m.save();
        sent++;
      } catch (err) {
        console.error('Email failed:', err.message);
      }
    })
  );

  console.log(`✅ Sent ${sent} reminders`);
};

module.exports = { sendReminders };