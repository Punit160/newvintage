// // routes/blockedDates.js
// const router = require("express").Router();
// const BlockedDate = require("../models/BlockedDate");

// /* ================= ADMIN: ADD BLOCK ================= */
// router.post("/", async (req, res) => {
//   try {
//     let { fromDate, toDate, reason } = req.body;

//     if (!fromDate || !toDate) {
//       return res.status(400).json({
//         success: false,
//         message: "fromDate and toDate are required",
//       });
//     }

//     const from = new Date(fromDate);
//     const to = new Date(toDate);

//     // ❌ Invalid date
//     if (isNaN(from) || isNaN(to)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid date format",
//       });
//     }

//     // ❌ Wrong range
//     if (from > to) {
//       return res.status(400).json({
//         success: false,
//         message: "fromDate cannot be greater than toDate",
//       });
//     }

//     // ✅ Normalize (important for consistency)
//     from.setHours(0, 0, 0, 0);
//     to.setHours(23, 59, 59, 999);

//     // ❌ Prevent duplicate / overlapping ranges
//     const overlap = await BlockedDate.findOne({
//       $or: [
//         { fromDate: { $lte: to }, toDate: { $gte: from } },
//       ],
//     });

//     if (overlap) {
//       return res.status(400).json({
//         success: false,
//         message: "Date range overlaps with existing blocked dates",
//       });
//     }

//     const blocked = await BlockedDate.create({
//       fromDate: from,
//       toDate: to,
//       reason: reason || "",
//     });

//     res.json({ success: true, blocked });
//   } catch (err) {
//     console.error("Block date error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to block dates",
//     });
//   }
// });

// /* ================= USER: GET BLOCKED ================= */
// router.get("/", async (req, res) => {
//   try {
//     const data = await BlockedDate.find().sort({ fromDate: 1 });

//     res.json({
//       success: true,
//       data: data.map(item => ({
//         _id: item._id,
//         fromDate: item.fromDate,
//         toDate: item.toDate,
//       })),
//     });
//   } catch (err) {
//     console.error("Fetch blocked error:", err);

//     // 🔥 NEVER break mobile
//     res.json({
//       success: true,
//       data: [], // always safe fallback
//     });
//   }
// });

// /* ================= ADMIN: DELETE ================= */
// router.delete("/:id", async (req, res) => {
//   try {
//     const deleted = await BlockedDate.findByIdAndDelete(req.params.id);

//     if (!deleted) {
//       return res.status(404).json({
//         success: false,
//         message: "Blocked date not found",
//       });
//     }

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Delete failed",
//     });
//   }
// });

// module.exports = router;

// const router = require("express").Router();
// const BlockedDate = require("../models/BlockedDate");

// /* ================= ADMIN: ADD BLOCK ================= */
// router.post("/", async (req, res) => {
//   try {
//     const { type, date, fromDate, toDate, daysOfWeek, reason } = req.body;

//     // ================= SINGLE DATE =================
//     if (type === "single") {
//       if (!date) {
//         return res.status(400).json({
//           success: false,
//           message: "date is required",
//         });
//       }

//       const d = new Date(date);

//       if (isNaN(d)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid date format",
//         });
//       }

//       d.setHours(0, 0, 0, 0);

//       // ❌ prevent duplicate
//       const exists = await BlockedDate.findOne({
//         type: "single",
//         date: d,
//       });

//       if (exists) {
//         return res.status(400).json({
//           success: false,
//           message: "Date already blocked",
//         });
//       }

//       const blocked = await BlockedDate.create({
//         type: "single",
//         date: d,
//         reason: reason || "",
//       });

//       return res.json({ success: true, blocked });
//     }

//     // ================= RANGE =================
//     if (type === "range") {
//       if (!fromDate || !toDate) {
//         return res.status(400).json({
//           success: false,
//           message: "fromDate and toDate are required",
//         });
//       }

//       const from = new Date(fromDate);
//       const to = new Date(toDate);

//       if (isNaN(from) || isNaN(to)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid date format",
//         });
//       }

//       if (from > to) {
//         return res.status(400).json({
//           success: false,
//           message: "fromDate cannot be greater than toDate",
//         });
//       }

//       from.setHours(0, 0, 0, 0);
//       to.setHours(23, 59, 59, 999);

//       // ❌ overlap check
//       const overlap = await BlockedDate.findOne({
//         type: "range",
//         fromDate: { $lte: to },
//         toDate: { $gte: from },
//       });

//       if (overlap) {
//         return res.status(400).json({
//           success: false,
//           message: "Date range overlaps",
//         });
//       }

//       const blocked = await BlockedDate.create({
//         type: "range",
//         fromDate: from,
//         toDate: to,
//         reason: reason || "",
//       });

//       return res.json({ success: true, blocked });
//     }

//     // ================= WEEKDAY =================
//     if (type === "weekday") {
//       if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: "daysOfWeek is required",
//         });
//       }

//       // remove duplicates
//       const cleanDays = [...new Set(daysOfWeek)];

//       // validate 0–6
//       const invalid = cleanDays.filter(
//         (d) => typeof d !== "number" || d < 0 || d > 6
//       );

//       if (invalid.length > 0) {
//         return res.status(400).json({
//           success: false,
//           message: `Invalid days: ${invalid.join(",")}`,
//         });
//       }

//       // find existing weekday config
//       let existing = await BlockedDate.findOne({ type: "weekday" });

//       if (!existing) {
//         const blocked = await BlockedDate.create({
//           type: "weekday",
//           daysOfWeek: cleanDays,
//           reason: reason || "",
//         });

//         return res.json({ success: true, blocked });
//       }

//       // merge days
//       const merged = [...new Set([...existing.daysOfWeek, ...cleanDays])];

//       if (merged.length === existing.daysOfWeek.length) {
//         return res.status(400).json({
//           success: false,
//           message: "Days already blocked",
//         });
//       }

//       existing.daysOfWeek = merged;
//       if (reason) existing.reason = reason;

//       await existing.save();

//       return res.json({ success: true, blocked: existing });
//     }

//     return res.status(400).json({
//       success: false,
//       message: "Invalid type (single | range | weekday)",
//     });

//   } catch (err) {
//     console.error("Block error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to block",
//     });
//   }
// });


// /* ================= USER: GET BLOCKED ================= */
// router.get("/", async (req, res) => {
//   try {
//     const data = await BlockedDate.find().sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       data,
//     });
//   } catch (err) {
//     console.error("Fetch blocked error:", err);

//     // 🔥 NEVER break mobile
//     res.json({
//       success: true,
//       data: [],
//     });
//   }
// });


// /* ================= ADMIN: DELETE ================= */
// router.delete("/:id", async (req, res) => {
//   try {
//     const deleted = await BlockedDate.findByIdAndDelete(req.params.id);

//     if (!deleted) {
//       return res.status(404).json({
//         success: false,
//         message: "Blocked item not found",
//       });
//     }

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Delete failed",
//     });
//   }
// });


// /* ================= ADMIN: REMOVE WEEKDAY ================= */
// router.put("/remove-weekday", async (req, res) => {
//   try {
//     const { daysOfWeek } = req.body;

//     if (!Array.isArray(daysOfWeek) || !daysOfWeek.length) {
//       return res.status(400).json({
//         success: false,
//         message: "daysOfWeek required",
//       });
//     }

//     const existing = await BlockedDate.findOne({ type: "weekday" });

//     if (!existing) {
//       return res.status(404).json({
//         success: false,
//         message: "No weekday block found",
//       });
//     }

//     existing.daysOfWeek = existing.daysOfWeek.filter(
//       (d) => !daysOfWeek.includes(d)
//     );

//     await existing.save();

//     res.json({ success: true, blocked: existing });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Remove failed",
//     });
//   }
// });

// module.exports = router;


// const router = require("express").Router();
// const BlockedDate = require("../models/BlockedDate");

// /* ================= ADMIN: ADD BLOCK ================= */
// router.post("/", async (req, res) => {
//   try {
//     const { type, date, fromDate, toDate, daysOfWeek, reason } = req.body;

//     // ================= SINGLE DATE =================
//     if (type === "single") {
//       if (!date) {
//         return res.status(400).json({
//           success: false,
//           message: "date is required",
//         });
//       }

//       const d = new Date(date);

//       if (isNaN(d)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid date format",
//         });
//       }

//       d.setHours(0, 0, 0, 0);

//       // ❌ prevent duplicate
//       const exists = await BlockedDate.findOne({
//         type: "single",
//         date: d,
//       });

//       if (exists) {
//         return res.status(400).json({
//           success: false,
//           message: "Date already blocked",
//         });
//       }

//       const blocked = await BlockedDate.create({
//         type: "single",
//         date: d,
//         reason: reason || "",
//       });

//       return res.json({ success: true, blocked });
//     }

//     // ================= RANGE =================
//     if (type === "range") {
//       if (!fromDate || !toDate) {
//         return res.status(400).json({
//           success: false,
//           message: "fromDate and toDate are required",
//         });
//       }

//       const from = new Date(fromDate);
//       const to = new Date(toDate);

//       if (isNaN(from) || isNaN(to)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid date format",
//         });
//       }

//       if (from > to) {
//         return res.status(400).json({
//           success: false,
//           message: "fromDate cannot be greater than toDate",
//         });
//       }

//       from.setHours(0, 0, 0, 0);
//       to.setHours(23, 59, 59, 999);

//       // ❌ overlap check
//       const overlap = await BlockedDate.findOne({
//         type: "range",
//         fromDate: { $lte: to },
//         toDate: { $gte: from },
//       });

//       if (overlap) {
//         return res.status(400).json({
//           success: false,
//           message: "Date range overlaps",
//         });
//       }

//       const blocked = await BlockedDate.create({
//         type: "range",
//         fromDate: from,
//         toDate: to,
//         reason: reason || "",
//       });

//       return res.json({ success: true, blocked });
//     }

//     // ================= WEEKDAY =================
//     if (type === "weekday") {
//       if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: "daysOfWeek is required",
//         });
//       }

//       // remove duplicates
//       const cleanDays = [...new Set(daysOfWeek)];

//       // validate 0–6
//       const invalid = cleanDays.filter(
//         (d) => typeof d !== "number" || d < 0 || d > 6
//       );

//       if (invalid.length > 0) {
//         return res.status(400).json({
//           success: false,
//           message: `Invalid days: ${invalid.join(",")}`,
//         });
//       }

//       // find existing weekday config
//       let existing = await BlockedDate.findOne({ type: "weekday" });

//       if (!existing) {
//         const blocked = await BlockedDate.create({
//           type: "weekday",
//           daysOfWeek: cleanDays,
//           reason: reason || "",
//         });

//         return res.json({ success: true, blocked });
//       }

//       // merge days
//       const merged = [...new Set([...existing.daysOfWeek, ...cleanDays])];

//       if (merged.length === existing.daysOfWeek.length) {
//         return res.status(400).json({
//           success: false,
//           message: "Days already blocked",
//         });
//       }

//       existing.daysOfWeek = merged;
//       if (reason) existing.reason = reason;

//       await existing.save();

//       return res.json({ success: true, blocked: existing });
//     }

//     return res.status(400).json({
//       success: false,
//       message: "Invalid type (single | range | weekday)",
//     });

//   } catch (err) {
//     console.error("Block error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to block",
//     });
//   }
// });


// /* ================= USER: GET BLOCKED ================= */
// router.get("/", async (req, res) => {
//   try {
//     const data = await BlockedDate.find().sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       data,
//     });
//   } catch (err) {
//     console.error("Fetch blocked error:", err);

//     // 🔥 NEVER break mobile
//     res.json({
//       success: true,
//       data: [],
//     });
//   }
// });


// /* ================= ADMIN: DELETE ================= */
// router.delete("/:id", async (req, res) => {
//   try {
//     const deleted = await BlockedDate.findByIdAndDelete(req.params.id);

//     if (!deleted) {
//       return res.status(404).json({
//         success: false,
//         message: "Blocked item not found",
//       });
//     }

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Delete failed",
//     });
//   }
// });


// /* ================= ADMIN: REMOVE WEEKDAY ================= */
// router.put("/remove-weekday", async (req, res) => {
//   try {
//     const { daysOfWeek } = req.body;

//     if (!Array.isArray(daysOfWeek) || !daysOfWeek.length) {
//       return res.status(400).json({
//         success: false,
//         message: "daysOfWeek required",
//       });
//     }

//     const existing = await BlockedDate.findOne({ type: "weekday" });

//     if (!existing) {
//       return res.status(404).json({
//         success: false,
//         message: "No weekday block found",
//       });
//     }

//     existing.daysOfWeek = existing.daysOfWeek.filter(
//       (d) => !daysOfWeek.includes(d)
//     );

//     await existing.save();

//     res.json({ success: true, blocked: existing });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Remove failed",
//     });
//   }
// });

// module.exports = router;

const router = require("express").Router();
const BlockedDate = require("../models/BlockedDate");
const { adminAuth } = require("../middleware/auth");

/* ================= HELPER ================= */
const isValidTime = (t) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(t);
/* ================= ADMIN: ADD BLOCK ================= */
router.post("/", adminAuth, async (req, res) => {
  try {
    let {
      type,
      date,
      fromDate,
      toDate,
      daysOfWeek,
      startTime,
      endTime,
      reason,
    } = req.body;

    // ✅ Validate time
    if (startTime && !isValidTime(startTime)) {
      return res.status(400).json({ success: false, message: "Invalid startTime" });
    }
    if (endTime && !isValidTime(endTime)) {
      return res.status(400).json({ success: false, message: "Invalid endTime" });
    }
    if (startTime && endTime && startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "startTime must be less than endTime",
      });
    }

    // ================= SINGLE =================
    if (type === "single") {
      if (!date) {
        return res.status(400).json({ success: false, message: "date required" });
      }

      // const d = new Date(date);
      // d.setHours(0, 0, 0, 0);
      const d = new Date(date + "T00:00:00+05:30");

      const exists = await BlockedDate.findOne({
        type: "single",
        date: d,
        startTime,
        endTime,
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Same date/time already blocked",
        });
      }

      const blocked = await BlockedDate.create({
        type,
        date: d,
        startTime,
        endTime,
        reason,
      });

      return res.json({ success: true, blocked });
    }

    // ================= RANGE =================
    if (type === "range") {
      if (!fromDate || !toDate) {
        return res.status(400).json({ success: false, message: "fromDate & toDate required" });
      }

      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (from > to) {
        return res.status(400).json({ success: false, message: "Invalid range" });
      }

      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);

      const overlap = await BlockedDate.findOne({
        type: "range",
        fromDate: { $lte: to },
        toDate: { $gte: from },
      });

      if (overlap) {
        return res.status(400).json({
          success: false,
          message: "Range overlap exists",
        });
      }

      const blocked = await BlockedDate.create({
        type,
        fromDate: from,
        toDate: to,
        startTime,
        endTime,
        reason,
      });

      return res.json({ success: true, blocked });
    }

    // ================= WEEKDAY =================
    if (type === "weekday") {
      if (!Array.isArray(daysOfWeek) || !daysOfWeek.length) {
        return res.status(400).json({ success: false, message: "daysOfWeek required" });
      }

      const clean = [...new Set(daysOfWeek)];

      if (clean.some(d => d < 0 || d > 6)) {
        return res.status(400).json({
          success: false,
          message: "Invalid weekday values",
        });
      }

      const blocked = await BlockedDate.create({
        type,
        daysOfWeek: clean,
        startTime,
        endTime,
        reason,
      });

      return res.json({ success: true, blocked });
    }

    res.status(400).json({ success: false, message: "Invalid type" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= GET ================= */
router.get("/", async (req, res) => {
  try {
    const data = await BlockedDate.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch {
    res.json({ success: true, data: [] });
  }
});

/* ================= DELETE ================= */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const deleted = await BlockedDate.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

module.exports = router;