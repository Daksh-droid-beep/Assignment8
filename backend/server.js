const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const taskRoutes = require("./routes/taskRoutes");
const errorHandler = require("./middlewares/errorMiddleware");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors()); // Allow requests from frontend
app.use(express.json()); // Parse JSON request bodies

// API Routes
app.use("/api/tasks", taskRoutes);

// Fallback Route for non-existent endpoints
app.use("*", (req, res) => {
  res.status(404).json({ message: `API Endpoint ${req.originalUrl} not found` });
});

// Centralized error handling (Must be defined last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Task Backend running in ${process.env.NODE_ENV || "development"} mode`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
