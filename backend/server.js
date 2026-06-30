const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import Routes
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/student");
const companyRoutes = require("./routes/company");
const jobRoutes = require("./routes/job");
const applicationRoutes = require("./routes/application");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

// ==============================
// Serve React Frontend
// ==============================

const frontendPath = path.join(__dirname, "../frontend/dist");

// Serve static React files
app.use(express.static(frontendPath));

// React routes
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});