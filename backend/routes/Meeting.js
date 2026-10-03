const router = require("express").Router();
const Meeting = require("../models/Meeting");
const { generateAgora } = require("../utils/agora");

// 🧍 User books a call
router.post("/book", async (req, res) => {
  const meeting = await Meeting.create({ topic: req.body.topic, userId: req.body.userId });
  res.json({ success: true, meeting });
});

// 👨 Admin accepts
router.post("/accept", async (req, res) => {
  const meeting = await Meeting.findById(req.body.id);
  if (!meeting) return res.status(404).json({ success: false, message: "Not found" });

  const channel = `call_${meeting._id}`;
  const { token, appId } = generateAgora(channel);
  meeting.status = "accepted";
  meeting.channelName = channel;
  meeting.token = token;
  meeting.meetingUrl = `${process.env.FRONTEND_URL}/call/${channel}`;
  await meeting.save();

  res.json({ success: true, appId, meeting });
});

// 🔗 Get meeting details (for joining)
router.get("/:channel", async (req, res) => {
  const m = await Meeting.findOne({ channelName: req.params.channel });
  if (!m) return res.status(404).json({ success: false });
  res.json({ success: true, appId: process.env.AGORA_APP_ID, token: m.token, channel: m.channelName });
});

module.exports = router;
