const express = require("express");
const Leaderboard = require("../models/Leaderboard");

const router = express.Router();

// Get top users (sorted by focus time)
router.get("/", async (req, res) => {
  try {
    const leaders = await Leaderboard.find()
      .sort({ totalFocusTime: -1 }) // highest first
      .limit(20); // top 20
    res.json(leaders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard", error: err });
  }
});

router.post("/update", async (req, res) => {
  try {
    const { userId, username, focusTime } = req.body;

    let user = await Leaderboard.findOne({ userId });

    if (user) {
      user.totalFocusTime += focusTime;
      user.sessionsCompleted += 1;
      await user.save();
    } else {
      user = await Leaderboard.create({
        userId,
        username,
        totalFocusTime: focusTime,
        sessionsCompleted: 1,
      });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error updating leaderboard", error: err });
  }
});

module.exports = router;
