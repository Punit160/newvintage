const express = require("express");
const { body, validationResult } = require("express-validator");
// const Journal = require('../models/Symptom');
const Journal = require('../models/Symptom'); // ✅ CORRECT

const { auth } = require("../middleware/auth");
const moment = require("moment");

const router = express.Router();

/**
 * @route   POST /api/journal/add
 * @desc    Add or update a daily journal entry
 * @access  Private
 */
router.post(
  "/add",
  [auth, body("text").notEmpty().withMessage("Journal text is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { text, date } = req.body;
      const entryDate = date
        ? moment(date).startOf("day").toDate()
        : moment().startOf("day").toDate();

      // Check if entry exists for today
      let journal = await Journal.findOne({
        user: req.user._id,
        date: entryDate,
      });

      if (journal) {
        journal.text = text;
        await journal.save();
        return res.json({
          success: true,
          message: "Journal updated successfully",
          data: journal,
        });
      }

      // Create new entry
      const newJournal = await Journal.create({
        user: req.user._id,
        date: entryDate,
        text,
      });

      res
        .status(201)
        .json({
          success: true,
          message: "Journal saved successfully",
          data: newJournal,
        });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Journal already exists for this day. Try updating instead.",
        });
      }
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Server error saving journal" });
    }
  }
);

/**
 * @route   GET /api/journal/my-journals
 * @desc    Get all journal entries for the user
 * @access  Private
 */
router.get("/my-journals", auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate)
        query.date.$gte = moment(startDate).startOf("day").toDate();
      if (endDate) query.date.$lte = moment(endDate).endOf("day").toDate();
    }

    const journals = await Journal.find(query).sort({ date: -1 });
    res.json({ success: true, data: journals });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching journals" });
  }
});

/**
 * @route   DELETE /api/journal/:date
 * @desc    Delete a journal entry by date
 * @access  Private
 */
router.delete("/:date", auth, async (req, res) => {
  try {
    const targetDate = moment(req.params.date).startOf("day").toDate();

    const deleted = await Journal.findOneAndDelete({
      user: req.user._id,
      date: targetDate,
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "No journal found for this date" });
    }

    res.json({ success: true, message: "Journal deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error deleting journal" });
  }
});

/**
 * @route   GET /api/journal/today
 * @desc    Get today’s journal entry
 * @access  Private
 */
router.get("/today", auth, async (req, res) => {
  try {
    const today = moment().startOf("day").toDate();

    const journal = await Journal.findOne({
      user: req.user._id,
      date: { $gte: today, $lt: moment(today).add(1, "day").toDate() },
    });

    if (!journal) {
      return res.json({
        success: true,
        message: "No journal entry for today",
        data: null,
      });
    }

    res.json({
      success: true,
      message: "Today’s journal retrieved successfully",
      data: journal,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error retrieving today’s journal",
      });
  }
});

module.exports = router;
