// routes/LeaderboardRoute.js
const express = require("express");
const User = require("../models/User"); 
const router = express.Router();

// Example route: get leaderboard
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ score: -1 }).limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
