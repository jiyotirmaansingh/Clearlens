require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const connectDB = require("./config/db"); // 🔹 MongoDB connect
const sessionRoutes = require("./routes/sessionRoutes"); 
const { authRouter } = require("./routes/authRoutes");
const streakRoutes = require("./routes/StreakRoutes");
const leaderboardRoutes = require("./routes/LeaderboardRoute");

const app = express();

// 🔹 Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",           // ✅ Local frontend (Vite dev)
    "https://clear-lens-beta.vercel.app/"     // ✅ Production frontend on Vercel
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());

// 🔹 Routes
app.use("/api/sessions", sessionRoutes); 
app.use("/auth", authRouter);            
app.use("/api/streak", streakRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// 🔹 Chatbot route (Ollama → Mistral)
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "mistral",
      prompt: message,
      stream: false, // full response
    });

    const reply = response.data.response;
    res.json({ reply });

  } catch (err) {
    console.error(
      "❌ Error communicating with Ollama:",
      err.response ? err.response.data : err.message
    );
    res.status(500).json({ error: "Failed to get a response from the AI model." });
  }
});

// 🔹 Base route
app.get("/", (req, res) => {
  res.send("🚀 Welcome to ClearLens Backend (Auth + Chat + DB Connected)");
});

// 🔹 Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  await connectDB(); 
  console.log(`✅ MongoDB Connected`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
