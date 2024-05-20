const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/error-handling");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5005;

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/cohort-tools-api")
  .then((x) =>
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  )
  .catch((err) => console.error("Error connecting to mongo", err));

// Middleware
app.use(cors({ origin: ["http://localhost:5173"] }));
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
const studentRoutes = require("./routes/students");
const cohortRoutes = require("./routes/cohorts");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

app.use("/api/students", studentRoutes);
app.use("/api/cohorts", cohortRoutes);
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);

// Documentation route
app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/views/docs.html");
});

// Error handling middleware (should be at the end)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
