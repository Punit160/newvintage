const cron = require("node-cron");
const Meeting = require("../models/Meeting");

// Runs every minute
cron.schedule("* * * * *", async () => {
  const now = new Date();

  try {
    await Meeting.updateMany(
      {
        status: "accepted",
        expireAt: { $lt: now },
      },
      {
        $set: {
          status: "ended",
          endedAt: now,
        },
      }
    );
  } catch (err) {
    console.error("[CRON ERROR]", err.message);
  }
});
