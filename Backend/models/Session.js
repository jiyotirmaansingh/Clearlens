const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true }, // store just the day of session
  duration: { type: Number }, // optional: minutes focused
});

module.exports = mongoose.model("Session", sessionSchema);
