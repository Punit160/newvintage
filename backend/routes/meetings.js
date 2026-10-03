// const router = require("express").Router();
// const Meeting = require("../models/Meeting");
// const { generateAgora } = require("../models/utils/agora");

// // -------------------- 1️⃣ Book a meeting --------------------
// router.post("/book", async (req, res) => {
//   try {
//     const meeting = await Meeting.create({
//       topic: req.body.topic,
//       userId: req.body.userId,
//       status: "pending",
//     });
//     res.json({ success: true, meeting });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // -------------------- 2️⃣ Get meeting by ID (for polling) --------------------
// router.get("/byid/:id", async (req, res) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id);
//     if (!meeting)
//       return res.status(404).json({ success: false, message: "Meeting not found" });

//     res.json({
//       success: true,
//       meeting: {
//         _id: meeting._id,
//         topic: meeting.topic,
//         status: meeting.status,
//         channelName: meeting.channelName,
//         token: meeting.token,
//         appId: meeting.appId,
//         meetingUrl: meeting.meetingUrl,
//         startTime: meeting.startTime,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // -------------------- 3️⃣ Get all meetings --------------------
// router.get("/", async (req, res) => {
//   try {
//     const meetings = await Meeting.find()
//       .populate({
//         path: "userId" // just to be extra safe
//       })
//       .sort({ createdAt: -1 });

//     res.json({ success: true, meetings });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });


// // -------------------- 4️⃣ Admin accepts meeting --------------------
// router.put("/:id/accept", async (req, res) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id);
//     if (!meeting)
//       return res.status(404).json({ success: false, message: "Meeting not found" });

//     const channel = `call_${meeting._id}`;
//     const { token, appId } = generateAgora(channel);

//     meeting.status = "accepted";
//     meeting.channelName = channel;
//     meeting.token = token;
//     meeting.appId = appId;
//     meeting.meetingUrl = `${process.env.FRONTEND_URL}/call/${channel}`;
//     meeting.startTime = new Date();

//     await meeting.save();

//     res.json({
//       success: true,
//       meeting: {
//         _id: meeting._id,
//         topic: meeting.topic,
//         status: meeting.status,
//         channelName: meeting.channelName,
//         token: meeting.token,
//         appId: meeting.appId,
//         meetingUrl: meeting.meetingUrl,
//         startTime: meeting.startTime,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // -------------------- 5️⃣ Admin declines meeting --------------------
// router.put("/:id/decline", async (req, res) => {
//   try {
//     const meeting = await Meeting.findByIdAndUpdate(
//       req.params.id,
//       { status: "declined", declinedAt: new Date() },
//       { new: true }
//     );
//     if (!meeting) return res.status(404).json({ success: false });
//     res.json({ success: true, meeting });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // -------------------- 6️⃣ Get meeting details by channel --------------------
// router.get("/channel/:channel", async (req, res) => {
//   try {
//     const meeting = await Meeting.findOne({ channelName: req.params.channel });
//     if (!meeting)
//       return res.status(404).json({ success: false, message: "Meeting not found" });

//     res.json({
//       success: true,
//       meeting: {
//         appId: meeting.appId,
//         token: meeting.token,
//         channelName: meeting.channelName,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
// // -------------------- 7️⃣ Mark meeting as ended --------------------
// router.put("/:id/end", async (req, res) => {
//   try {
//     const meeting = await Meeting.findByIdAndUpdate(
//       req.params.id,
//       { status: "ended", endedAt: new Date() }, // add optional endedAt
//       { new: true }
//     );

//     if (!meeting)
//       return res.status(404).json({ success: false, message: "Meeting not found" });

//     res.json({ success: true, meeting });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });


// module.exports = router;



// const router = require("express").Router();
// const Meeting = require("../models/Meeting");
// const { generateAgora } = require("../models/utils/agora");

// // -------------------- 1️⃣ Book a consultation --------------------
// router.post("/book", async (req, res) => {
//   try {
//     const { topic, userId, startTime } = req.body;

//     // Validate inputs
//     if (!topic || !userId || !startTime) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Topic, userId, and start time are required" 
//       });
//     }

//     const startDate = new Date(startTime);
//     const now = new Date();

//     // 1️⃣ Booking should be in future
//     if (startDate <= now) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Start time must be in the future" 
//       });
//     }

//     // 2️⃣ Must be scheduled at least 7 days in advance
//     const minAdvance = new Date();
//     minAdvance.setDate(minAdvance.getDate() + 7);
//     if (startDate < minAdvance) {
//       return res.status(400).json({
//         success: false,
//         message: "Face-to-face consultations must be scheduled at least 7 days in advance",
//       });
//     }

//     // 3️⃣ Booking cannot be more than 30 days (1 month) in advance
//     const maxAdvance = new Date();
//     maxAdvance.setDate(maxAdvance.getDate() + 30);
//     if (startDate > maxAdvance) {
//       return res.status(400).json({
//         success: false,
//         message: "You can only book consultations up to 30 days (1 month) in advance",
//       });
//     }

//     // 4️⃣ Check if user already has a pending/accepted consultation
//     const existingMeeting = await Meeting.findOne({
//       userId,
//       status: { $in: ['pending', 'accepted'] },
//     });

//     if (existingMeeting) {
//       return res.status(400).json({
//         success: false,
//         message: "You already have a pending or scheduled consultation. Please complete or cancel it first.",
//       });
//     }

//     // Create consultation
//     const meeting = await Meeting.create({
//       topic,
//       userId,
//       status: "pending",
//       startTime: startDate,
//       duration: 30, // 30 minutes consultation
//       type: "face-to-face",
//     });

//     res.json({ success: true, meeting });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // -------------------- 2️⃣ Get consultation by ID (for polling) --------------------
// router.get("/byid/:id", async (req, res) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id);
//     if (!meeting)
//       return res.status(404).json({ success: false, message: "Consultation not found" });

//     res.json({
//       success: true,
//       meeting: {
//         _id: meeting._id,
//         topic: meeting.topic,
//         status: meeting.status,
//         channelName: meeting.channelName,
//         token: meeting.token,
//         appId: meeting.appId,
//         meetingUrl: meeting.meetingUrl,
//         startTime: meeting.startTime,
//         duration: meeting.duration || 30,
//         type: meeting.type || "face-to-face",
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // -------------------- 3️⃣ Get all consultations (with filters) --------------------
// router.get("/", async (req, res) => {
//   try {
//     const { userId, status } = req.query;
    
//     let query = {};
//     if (userId) query.userId = userId;
//     if (status) query.status = status;

//     const meetings = await Meeting.find(query)
//       .populate('userId', 'name email') // adjust fields as needed
//       .sort({ startTime: -1 });

//     res.json({ success: true, meetings });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // -------------------- 4️⃣ Get user's active consultation --------------------
// router.get("/user/:userId/active", async (req, res) => {
//   try {
//     const meeting = await Meeting.findOne({
//       userId: req.params.userId,
//       status: { $in: ['pending', 'accepted'] },
//     }).sort({ createdAt: -1 });

//     if (!meeting) {
//       return res.json({ success: true, meeting: null });
//     }

//     // Check if consultation has expired (more than 30 minutes after start time)
//     const now = new Date();
//     const meetingEnd = new Date(meeting.startTime);
//     meetingEnd.setMinutes(meetingEnd.getMinutes() + 30);

//     if (now > meetingEnd && meeting.status === 'accepted') {
//       meeting.status = 'ended';
//       meeting.endedAt = now;
//       await meeting.save();
//       return res.json({ success: true, meeting: null });
//     }

//     res.json({ success: true, meeting });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // -------------------- 5️⃣ Admin accepts consultation --------------------
// router.put("/:id/accept", async (req, res) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id);
//     if (!meeting)
//       return res.status(404).json({ success: false, message: "Consultation not found" });

//     if (meeting.status !== 'pending') {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Only pending consultations can be accepted" 
//       });
//     }

//     const channel = `consultation_${meeting._id}`;
//     const { token, appId } = generateAgora(channel);

//     meeting.status = "accepted";
//     meeting.channelName = channel;
//     meeting.token = token;
//     meeting.appId = appId;
//     meeting.meetingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/call/${channel}`;
//     meeting.acceptedAt = new Date();

//     await meeting.save();

//     res.json({
//       success: true,
//       meeting: {
//         _id: meeting._id,
//         topic: meeting.topic,
//         status: meeting.status,
//         channelName: meeting.channelName,
//         token: meeting.token,
//         appId: meeting.appId,
//         meetingUrl: meeting.meetingUrl,
//         startTime: meeting.startTime,
//         duration: meeting.duration || 30,
//         type: meeting.type || "face-to-face",
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // -------------------- 6️⃣ Admin declines consultation --------------------
// router.put("/:id/decline", async (req, res) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id);
//     if (!meeting) 
//       return res.status(404).json({ success: false, message: "Consultation not found" });

//     if (meeting.status !== 'pending') {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Only pending consultations can be declined" 
//       });
//     }

//     meeting.status = 'declined';
//     meeting.declinedAt = new Date();
//     await meeting.save();

//     res.json({ success: true, meeting });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // -------------------- 7️⃣ Get consultation details by channel --------------------
// router.get("/channel/:channel", async (req, res) => {
//   try {
//     const meeting = await Meeting.findOne({ channelName: req.params.channel });
//     if (!meeting)
//       return res.status(404).json({ success: false, message: "Consultation not found" });

//     res.json({
//       success: true,
//       meeting: {
//         appId: meeting.appId,
//         token: meeting.token,
//         channelName: meeting.channelName,
//         topic: meeting.topic,
//         startTime: meeting.startTime,
//         duration: meeting.duration || 30,
//         type: meeting.type || "face-to-face",
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // -------------------- 8️⃣ Mark consultation as ended --------------------
// router.put("/:id/end", async (req, res) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id);
    
//     if (!meeting)
//       return res.status(404).json({ success: false, message: "Consultation not found" });

//     meeting.status = "ended";
//     meeting.endedAt = new Date();
//     await meeting.save();

//     res.json({ success: true, meeting });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // -------------------- 9️⃣ Cancel consultation (by user) --------------------
// router.delete("/:id", async (req, res) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id);
    
//     if (!meeting)
//       return res.status(404).json({ success: false, message: "Consultation not found" });

//     // Only allow cancellation of pending or accepted consultations
//     if (!['pending', 'accepted'].includes(meeting.status)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Cannot cancel this consultation" 
//       });
//     }

//     meeting.status = "cancelled";
//     meeting.cancelledAt = new Date();
//     await meeting.save();

//     res.json({ success: true, message: "Consultation cancelled successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // -------------------- 🔟 Cleanup expired consultations (cron job helper) --------------------
// router.post("/cleanup-expired", async (req, res) => {
//   try {
//     const now = new Date();
//     const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

//     const result = await Meeting.updateMany(
//       {
//         status: 'accepted',
//         startTime: { $lt: thirtyMinutesAgo }
//       },
//       {
//         $set: { 
//           status: 'ended',
//           endedAt: now
//         }
//       }
//     );

//     res.json({ 
//       success: true, 
//       message: `Cleaned up ${result.modifiedCount} expired consultations` 
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// module.exports = router;




const router = require("express").Router();
const BlockedDate = require("../models/BlockedDate");
const Meeting = require("../models/Meeting");
const { generateAgora } = require("../models/utils/agora");
const { sendEmail } = require("../utils/sendEmail");
const getDateIST = (date) =>
  new Date(date).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
// -------------------- 1️⃣ Book a consultation --------------------
// router.post("/book", async (req, res) => {
//   try {
//     const { topic, userId, startTime } = req.body;

//     // Validate inputs
//     if (!topic || !userId || !startTime) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Topic, userId, and start time are required" 
//       });
//     }

//     const startDate = new Date(startTime);
//     const now = new Date();

//     // 1️⃣ Booking should be in future
//     if (startDate <= now) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Start time must be in the future" 
//       });
//     }

//     // 2️⃣ Must be scheduled at least 7 days in advance
//     const minAdvance = new Date();
//     minAdvance.setDate(minAdvance.getDate() + 7);
//     if (startDate < minAdvance) {
//       return res.status(400).json({
//         success: false,
//         message: "Face-to-face consultations must be scheduled at least 7 days in advance",
//       });
//     }

//     // 3️⃣ Booking cannot be more than 30 days (1 month) in advance
//     const maxAdvance = new Date();
//     maxAdvance.setDate(maxAdvance.getDate() + 30);
//     if (startDate > maxAdvance) {
//       return res.status(400).json({
//         success: false,
//         message: "You can only book consultations up to 30 days (1 month) in advance",
//       });
//     }

//     // 4️⃣ Check if user already has a pending/accepted consultation
//     const existingMeeting = await Meeting.findOne({
//       userId,
//       status: { $in: ['pending', 'accepted'] },
//     });

//     if (existingMeeting) {
//       return res.status(400).json({
//         success: false,
//         message: "You already have a pending or scheduled consultation. Please complete or cancel it first.",
//       });
//     }

//     // Create consultation
//     const meeting = await Meeting.create({
//       topic,
//       userId,
//       status: "pending",
//       startTime: startDate,
//       duration: 30, // 30 minutes consultation
//       type: "face-to-face",
//     });

//     res.json({ success: true, meeting });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
// -------------------- 1️⃣ Book a consultation --------------------
// GET booked slots for a date (30-min slots)
router.get("/slots", async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ success: false, message: "Date required" });
  }

  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(`${date}T23:59:59.999Z`);

  const meetings = await Meeting.find({
    status: { $in: ["pending", "accepted"] },
    startTime: { $gte: dayStart, $lte: dayEnd },
  }).sort({ startTime: 1 });

  const slots = meetings.map(m => ({
    start: m.startTime,
    end: m.expireAt,
  }));

  res.json({ success: true, slots });
});


router.post("/book", async (req, res) => {
  
  try {
    const { topic, userId, startTime } = req.body;

    /* -------------------- BASIC VALIDATION -------------------- */

    if (!topic || !userId || !startTime) {
      return res.status(400).json({
        success: false,
        message: "Topic, userId and startTime are required",
      });
    }

    const preferredStart = new Date(startTime);
    const now = new Date();

    if (preferredStart <= now) {
      return res.status(400).json({
        success: false,
        message: "Start time must be in the future",
      });
    }

    // 7 days advance
    const minAdvance = new Date();
    minAdvance.setDate(minAdvance.getDate() + 7);
    if (preferredStart < minAdvance) {
      return res.status(400).json({
        success: false,
        message: "Consultation must be booked at least 7 days in advance",
      });
    }

    // max 30 days
    const maxAdvance = new Date();
    maxAdvance.setDate(maxAdvance.getDate() + 30);
    if (preferredStart > maxAdvance) {
      return res.status(400).json({
        success: false,
        message: "You can only book up to 30 days in advance",
      });
    }

    // one active consultation per user
    const existingUserMeeting = await Meeting.findOne({
      userId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingUserMeeting) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a pending or accepted consultation. Please complete or cancel it first.",
      });
    }
/* -------------------- BLOCKED DATE CHECK (SAFE) -------------------- */

let blockedRanges = [];

try {
  blockedRanges = await BlockedDate.find();
} catch (err) {
  console.error("Blocked date fetch failed:", err);
  blockedRanges = [];
}
const getISTDateTime = (date) =>
  new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
/* ================= HELPER ================= */
// const isTimeBlocked = (dateTime, block) => {
//   const ist = getISTDateTime(dateTime);

//   const day = ist.getDay();
//   const dateStr = ist.toISOString().split("T")[0];
//   const timeStr = ist.toTimeString().slice(0, 5);

//   // ⏰ TIME CHECK
//   if (block.startTime && block.endTime) {
//     const current = toMinutes(timeStr);
//     const start = toMinutes(block.startTime);
//     const end = toMinutes(block.endTime);

//     if (!(current >= start && current < end)) {
//       return false;
//     }
//   }

//   // 📅 SINGLE
//   if (block.type === "single" && block.date) {
//     const blockDate = getISTDateTime(block.date)
//       .toISOString()
//       .split("T")[0];
//     return dateStr === blockDate;
//   }

//   // 📆 RANGE
//   if (block.type === "range" && block.fromDate && block.toDate) {
//     return (
//       ist >= getISTDateTime(block.fromDate) &&
//       ist <= getISTDateTime(block.toDate)
//     );
//   }

//   // 🔁 WEEKDAY
//   if (block.type === "weekday") {
//     return block.daysOfWeek?.includes(day);
//   }

//   return false;
// };
const isTimeBlocked = (dateTime, block) => {
  const ist = getISTDateTime(dateTime);

  const day = ist.getDay();
  // const dateStr = ist.toISOString().split("T")[0];
  const dateStr = getDateIST(ist);
  const timeStr = ist.toTimeString().slice(0, 5);

  const current = toMinutes(timeStr);

  /* ================= SINGLE ================= */
  if (block.type === "single" && block.date) {
  const blockDate = getDateIST(block.date);

    if (dateStr !== blockDate) return false;

    // ✅ If time exists → allow ONLY inside time
    if (block.startTime && block.endTime) {
      const start = toMinutes(block.startTime);
      const end = toMinutes(block.endTime);

      // ❌ outside allowed window → BLOCK
      return !(current >= start && current < end);
    }

    // ❌ no time → full day blocked
    return true;
  }

  /* ================= RANGE ================= */
  // if (block.type === "range" && block.fromDate && block.toDate) {
  //   const inRange =
  //     ist >= getISTDateTime(block.fromDate) &&
  //     ist <= getISTDateTime(block.toDate);

  //   if (!inRange) return false;

  //   if (block.startTime && block.endTime) {
  //     const start = toMinutes(block.startTime);
  //     const end = toMinutes(block.endTime);

  //     return !(current >= start && current < end);
  //   }

  //   return true;
  // }

if (block.type === "range" && block.fromDate && block.toDate) {
  const inRange =
    ist >= getISTDateTime(block.fromDate) &&
    ist <= getISTDateTime(block.toDate);

  if (!inRange) return false;

  // ✅ If time exists → allow ONLY inside time
  if (block.startTime && block.endTime) {
    const start = toMinutes(block.startTime);
    const end = toMinutes(block.endTime);

    return !(current >= start && current < end);
  }

  // ❌ No time → full day blocked
  return true;
}
  /* ================= WEEKDAY ================= */
  if (block.type === "weekday") {
    if (!block.daysOfWeek?.includes(day)) return false;

    if (block.startTime && block.endTime) {
      const start = toMinutes(block.startTime);
      const end = toMinutes(block.endTime);

      return !(current >= start && current < end);
    }

    return true;
  }

  return false;
};

/* ================= FINAL CHECK ================= */
const isBlocked = blockedRanges.some(block =>
  isTimeBlocked(preferredStart, block)
);

if (isBlocked) {
  return res.status(400).json({
    success: false,
    message: "This date/time is blocked by admin",
  });
}
    /* -------------------- SLOT CALCULATION (FIXED) -------------------- */

    const SLOT_MINUTES = 30;

    // restrict search to same day
    const dayStart = new Date(preferredStart);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(preferredStart);
    dayEnd.setHours(23, 59, 59, 999);

    // fetch all meetings for that day
    const meetings = await Meeting.find({
      status: { $in: ["pending", "accepted"] },
      startTime: { $gte: dayStart, $lte: dayEnd },
    }).sort({ startTime: 1 });

    // find next free slot
    let actualStartTime = preferredStart;

    for (const m of meetings) {
      const meetingEnd = new Date(m.expireAt);

      // if overlap, move to end of this meeting
      if (actualStartTime < meetingEnd) {
        actualStartTime = meetingEnd;
      }
    }

    // calculate expiry
    const expireAt = new Date(actualStartTime);
    expireAt.setMinutes(expireAt.getMinutes() + SLOT_MINUTES);

    /* -------------------- CREATE MEETING -------------------- */

    const meeting = await Meeting.create({
      topic,
      userId,
      status: "pending",
      startTime: actualStartTime,
      expireAt,
      type: "face-to-face",
    });

    /* -------------------- RESPONSE -------------------- */

    return res.json({
      success: true,
      message: "Consultation booked successfully",
      meeting: {
        _id: meeting._id,
        topic: meeting.topic,
        status: meeting.status,
        startTime: meeting.startTime,
        endTime: meeting.expireAt,
      },
    });

  } catch (err) {
    console.error("Booking error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while booking consultation",
    });
  }
});


// -------------------- 2️⃣ Get consultation by ID (for polling) --------------------
router.get("/byid/:id", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting)
      return res.status(404).json({ success: false, message: "Consultation not found" });

    res.json({
      success: true,
      meeting: {
        _id: meeting._id,
        topic: meeting.topic,
        status: meeting.status,
        channelName: meeting.channelName,
        token: meeting.token,
        appId: meeting.appId,
        meetingUrl: meeting.meetingUrl,
        startTime: meeting.startTime,
        duration: meeting.duration || 30,
        type: meeting.type || "face-to-face",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------- 3️⃣ Get all consultations (with filters) --------------------
router.get("/", async (req, res) => {
  try {
    const { userId, status } = req.query;
    
    let query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const meetings = await Meeting.find(query)
      .populate('userId', 'name email') // adjust fields as needed
      .sort({ startTime: -1 });

    res.json({ success: true, meetings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------- 4️⃣ Get user's active consultation --------------------
router.get("/user/:userId/active", async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      userId: req.params.userId,
      status: { $in: ['pending', 'accepted'] },
    }).sort({ createdAt: -1 });

    if (!meeting) {
      return res.json({ success: true, meeting: null });
    }

    // Check if consultation has expired (more than 30 minutes after start time)
    const now = new Date();
    const meetingEnd = new Date(meeting.startTime);
    meetingEnd.setMinutes(meetingEnd.getMinutes() + 30);

    if (now > meetingEnd && meeting.status === 'accepted') {
      meeting.status = 'ended';
      meeting.endedAt = now;
      await meeting.save();
      return res.json({ success: true, meeting: null });
    }

    res.json({ success: true, meeting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// -------------------- 🔐 Validate before joining call --------------------
// -------------------- 🔐 Validate before joining call --------------------


// router.get("/join/:id", async (req, res) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id);

//     if (!meeting) {
//       return res.status(404).json({
//         success: false,
//         message: "Meeting not found"
//       });
//     }

//     // Check expiration
//     if (meeting.expireAt && new Date() > new Date(meeting.expireAt)) {
      
//       // Mark expired if not done already
//       if (meeting.status !== "expired") {
//         meeting.status = "expired";
//         meeting.endedAt = new Date();
//         await meeting.save();
//       }

//       return res.status(410).json({
//         success: false,
//         expired: true,
//         message: "This meeting link has expired"
//       });
//     }

//     // 🟢 Still valid → allow join
//     return res.json({
//       success: true,
//       allowed: true,
//       meeting
//     });

//   } catch (err) {
//     res.status(500).json({ 
//       success: false, 
//       message: err.message 
//     });
//   }
// });
router.get("/join/:id", async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);

  if (!meeting || meeting.status !== "accepted") {
    return res.status(400).json({ message: "Meeting not available" });
  }

  const now = new Date();

  // ❌ Too early
  if (now < new Date(meeting.startTime)) {
    return res.status(403).json({
      message: "Consultation has not started yet",
    });
  }

  // ❌ Expired
  if (now > new Date(meeting.expireAt)) {
    meeting.status = "ended";
    meeting.endedAt = now;
    await meeting.save();

    return res.status(410).json({
      message: "Consultation expired",
    });
  }

  const expireInSeconds =
    Math.floor(new Date(meeting.expireAt).getTime() / 1000) -
    Math.floor(Date.now() / 1000);

  const { token, appId } = generateAgora(
    meeting.channelName,
    expireInSeconds
  );

  res.json({
    success: true,
    token,
    appId,
    channelName: meeting.channelName,
  });
});


// -------------------- 5️⃣ Admin accepts consultation --------------------
// -------------------- 5️⃣ Admin accepts consultation --------------------
router.put("/:id/accept", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    if (meeting.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending consultations can be accepted",
      });
    }

    // ✅ Create channel name
    const channel = `consultation_${meeting._id}`;

    // ✅ Calculate expiry = startTime + 30 minutes
    const expireAt = new Date(meeting.startTime);
    expireAt.setMinutes(expireAt.getMinutes() + 30);

    // ✅ Update meeting (NO TOKEN HERE)
    meeting.status = "accepted";
    meeting.channelName = channel;
    meeting.acceptedAt = new Date();
    meeting.expireAt = expireAt;
    meeting.meetingUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/call/${channel}`;

    await meeting.save();

    res.json({
      success: true,
      meeting,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/status/:id", async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);

  if (!meeting) {
    return res.json({ valid: false });
  }

  const now = new Date();

  if (now > meeting.expireAt) {
    return res.json({ expired: true });
  }

  res.json({
    valid: true,
    status: meeting.status,
    startTime: meeting.startTime,
  });
});


// -------------------- 6️⃣ Admin declines consultation --------------------
router.put("/:id/decline", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) 
      return res.status(404).json({ success: false, message: "Consultation not found" });

    if (meeting.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: "Only pending consultations can be declined" 
      });
    }

    meeting.status = 'declined';
    meeting.declinedAt = new Date();
    await meeting.save();

    res.json({ success: true, meeting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------- 7️⃣ Get consultation details by channel --------------------
router.get("/channel/:channel", async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ channelName: req.params.channel });
    if (!meeting)
      return res.status(404).json({ success: false, message: "Consultation not found" });

    res.json({
      success: true,
      meeting: {
        appId: meeting.appId,
        token: meeting.token,
        channelName: meeting.channelName,
        topic: meeting.topic,
        startTime: meeting.startTime,
        duration: meeting.duration || 30,
        type: meeting.type || "face-to-face",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------- 8️⃣ Mark consultation as ended --------------------
router.put("/:id/end", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting)
      return res.status(404).json({ success: false, message: "Consultation not found" });

    meeting.status = "ended";
    meeting.endedAt = new Date();
    await meeting.save();

    res.json({ success: true, meeting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------- 9️⃣ Cancel consultation (by user) --------------------
router.delete("/:id", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting)
      return res.status(404).json({ success: false, message: "Consultation not found" });

    // Only allow cancellation of pending or accepted consultations
    if (!['pending', 'accepted'].includes(meeting.status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot cancel this consultation" 
      });
    }

    meeting.status = "cancelled";
    meeting.cancelledAt = new Date();
    await meeting.save();

    res.json({ success: true, message: "Consultation cancelled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------- Hard Delete (one / many / all) --------------------
router.delete("/", async (req, res) => {
  try {
    const { id, ids, all } = req.body;

    // 🔴 Delete ALL
    if (all === true) {
      const result = await Meeting.deleteMany({});
      return res.json({
        success: true,
        deletedCount: result.deletedCount,
        type: "all",
      });
    }

    // 🔴 Delete MANY
    if (Array.isArray(ids) && ids.length > 0) {
      const result = await Meeting.deleteMany({ _id: { $in: ids } });
      return res.json({
        success: true,
        deletedCount: result.deletedCount,
        type: "many",
      });
    }

    // 🔴 Delete ONE
    if (id) {
      const meeting = await Meeting.findByIdAndDelete(id);
      if (!meeting) {
        return res
          .status(404)
          .json({ success: false, message: "Meeting not found" });
      }

      return res.json({
        success: true,
        message: "Meeting deleted",
        type: "one",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid delete request",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------- 🔟 Cleanup expired consultations (cron job helper) --------------------
router.post("/cleanup-expired", async (req, res) => {
  try {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    const result = await Meeting.updateMany(
      {
        status: 'accepted',
        startTime: { $lt: thirtyMinutesAgo }
      },
      {
        $set: { 
          status: 'ended',
          endedAt: now
        }
      }
    );

    res.json({ 
      success: true, 
      message: `Cleaned up ${result.modifiedCount} expired consultations` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ ADMIN CREATE – direct accepted meeting
router.post("/admin-create", async (req, res) => {
  try {
    const { topic, userId, startTime, expireAt, status } = req.body;

    // Basic validation
    if (!topic || !userId || !startTime) {
      return res.status(400).json({
        success: false,
        message: "Topic, userId, and startTime are required"
      });
    }

    // Create meeting (admin bypasses user constraints like 7‑day advance)
    const meeting = await Meeting.create({
      topic,
      userId,
      startTime: new Date(startTime),
      expireAt: expireAt ? new Date(expireAt) : new Date(new Date(startTime).getTime() + 30 * 60000),
      status: status || "accepted",           // admin‑created meetings are usually accepted
      type: "face-to-face",
      // channelName will be set below after we have the _id
    });

    // If the meeting is accepted, set all acceptance fields
    if (meeting.status === "accepted") {
      meeting.channelName = `consultation_${meeting._id}`;
      meeting.acceptedAt = new Date();
      meeting.meetingUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/call/${meeting.channelName}`;
      // ensure expireAt is correctly set (already done above, but double‑check)
      if (!expireAt) {
        meeting.expireAt = new Date(meeting.startTime.getTime() + 30 * 60000);
      }
      await meeting.save();
    }

    res.json({ success: true, meeting });
  } catch (err) {
    console.error("Admin create error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ ADMIN EDIT – robust update with auto‑fixes
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { topic, startTime, expireAt, status } = req.body;

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const wasAccepted = meeting.status === "accepted";
    const becomingAccepted = status === "accepted" && !wasAccepted;

    // Apply updates
    if (topic) meeting.topic = topic;

    if (startTime) {
      meeting.startTime = new Date(startTime);
      // If this is an accepted meeting and no explicit expireAt was sent, recalc expiry
      if (!expireAt && (wasAccepted || becomingAccepted)) {
        meeting.expireAt = new Date(meeting.startTime.getTime() + 30 * 60000);
      }
    }

    if (expireAt) meeting.expireAt = new Date(expireAt);
    if (status) meeting.status = status;

    // Handle becoming accepted now
    if (becomingAccepted) {
      meeting.acceptedAt = new Date();
      meeting.channelName = `consultation_${meeting._id}`;
      meeting.meetingUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/call/${meeting.channelName}`;
      if (!expireAt && meeting.startTime) {
        meeting.expireAt = new Date(meeting.startTime.getTime() + 30 * 60000);
      }
    }
    // If already accepted, ensure fields are consistent (fix legacy data)
    else if (meeting.status === "accepted") {
      if (!meeting.channelName || !meeting.channelName.startsWith(`consultation_${meeting._id}`)) {
        meeting.channelName = `consultation_${meeting._id}`;
        meeting.meetingUrl = `${process.env.FRONTEND_URL}/call/${meeting.channelName}`;
      }
      if (!meeting.acceptedAt) meeting.acceptedAt = new Date();
      // If expireAt is not set correctly, fix it (should never happen, but safe)
      if (!meeting.expireAt && meeting.startTime) {
        meeting.expireAt = new Date(meeting.startTime.getTime() + 30 * 60000);
      }
    }

    await meeting.save();
    res.json({ success: true, meeting });
  } catch (err) {
    console.error("Admin update error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;