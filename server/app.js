const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/error-handling");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;

// INITIALIZE EXPRESS APP
const app = express();
const PORT = process.env.PORT || 5005;

// Set up custom error handling middleware:
app.use(notFoundHandler);
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/cohort-tools-api")
  .then((x) =>
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  )
  .catch((err) => console.error("Error connecting to mongo", err));

// MIDDLEWARE
app.use(cors({ origin: ["http://localhost:5173"] }));
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CREATE SCHEMA
const studentsSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  linkedinUrl: { type: String, default: "" },
  languages: {
    type: String,
    enum: [
      "English",
      "Spanish",
      "French",
      "German",
      "Portuguese",
      "Dutch",
      "Other",
    ],
  },
  program: {
    type: String,
    enum: ["Web Dev", "UX/UI", "Data Analytics", "Cybersecurity"],
  },
  background: { type: String, default: "" },
  image: { type: String, default: "https://i.imgur.com/r8bo8u7.png" },
  cohort: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cohort",
    required: true,
  },
  projects: { type: String, enum: [] },
});

const cohortsSchema = new Schema({
  cohortSlug: { type: String, required: true, unique: true },
  cohortName: { type: String, required: true },
  program: {
    type: String,
    enum: ["Web Dev", "UX/UI", "Data Analytics", "Cybersecurity"],
  },
  format: {
    type: String,
    enum: ["Full Time", "Part Time"],
  },
  campus: {
    type: String,
    enum: [
      "Madrid",
      "Barcelona",
      "Miami",
      "Paris",
      "Berlin",
      "Amsterdam",
      "Lisbon",
      "Remote",
    ],
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  inProgress: { type: Boolean, default: false },
  programManager: { type: String, required: true },
  leadTeacher: { type: String, required: true },
  totalHours: { type: Number, default: 360 },
});

// CREATE MODEL
const Student = mongoose.model("Student", studentsSchema);
const Cohort = mongoose.model("Cohort", cohortsSchema);

// EXPORT THE MODELS
module.exports = { Student, Cohort };

// ROUTES
app.post("/api/students", (req, res) => {
  Student.create(req.body)
    .then((createdStudent) => {
      console.log("Student created ->", createdStudent);
      res.status(201).json(createdStudent);
    })
    .catch((error) => {
      console.error("Error while creating the student ->", error);
      res.status(500).json({ error: "Failed to create the student" });
    });
});

app.get("/api/students", (req, res) => {
  Student.find({})
    .populate("cohort")
    .then((students) => {
      console.log("Retrieved students ->", students);
      res.status(200).json(students);
    })
    .catch((error) => {
      console.error("Error while retrieving students ->", error);
      res.status(500).json({ error: "Failed to retrieve students" });
    });
});

app.get("/api/students/cohort/:cohortId", (req, res) => {
  const cohortId = req.params.cohortId;

  Student.find({ cohort: cohortId })
    .populate("cohort")
    .then((students) => {
      console.log("Retrieved students  ->", students);
      res.status(200).json(students);
    })
    .catch((error) => {
      console.error("Error while retrieving students ->", error);
      res.status(500).json({ error: "Failed to retrieve students" });
    });
});

app.get("/api/students/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  Student.findById(studentId)
    .populate("cohort")
    .then((student) => {
      console.log("Retrieved student  ->", student);
      res.status(200).json(student);
    })
    .catch((error) => {
      console.error("Error while retrieving student ->", error);
      res.status(500).json({ error: "Failed to retrieve student" });
    });
});

app.put("/api/students/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  Student.findByIdAndUpdate(studentId, req.body, { new: true })
    .then((updatedStudent) => {
      console.log("Updated student ->", updatedStudent);

      res.status(200).json(updatedStudent);
    })
    .catch((error) => {
      console.error("Error while updating the student ->", error);
      res.status(500).json({ error: "Failed to update the student" });
    });
});

app.delete("/api/students/:studentId", (req, res) => {
  Student.findByIdAndDelete(req.params.studentId)
    .then((result) => {
      console.log("Student deleted!");
      res.status(204).send(); // Send back only status code 204 indicating that resource is deleted
    })
    .catch((error) => {
      console.error("Error while deleting the student ->", error);
      res.status(500).json({ error: "Deleting student failed" });
    });
});
//COHORT ROUTES

app.post("/api/cohorts", (req, res) => {
  Cohort.create(req.body)
    .then((createdCohort) => {
      console.log("Cohort created ->", createdCohort);
      res.status(201).json(createdCohort);
    })
    .catch((error) => {
      console.error("Error while creating the cohort ->", error);
      res.status(500).json({ error: "Failed to create the cohort" });
    });
});

//retrieve all cohorts
app.get("/api/cohorts", (req, res) => {
  Cohort.find({})
    .then((cohorts) => {
      console.log("Retrieved cohorts ->", cohorts);
      res.status(200).json(cohorts);
    })
    .catch((error) => {
      console.error("Error while retrieving cohorts ->", error);
      res.status(500).json({ error: "Failed to retrieve cohorts" });
    });
});

app.get("/api/cohorts/:cohortId", (req, res) => {
  const cohortId = req.params.cohortId;

  Cohort.findById(cohortId)
    .then((cohort) => {
      console.log("Retrieved cohort  ->", cohort);
      res.status(200).json(cohort);
    })
    .catch((error) => {
      console.error("Error while retrieving cohort ->", error);
      res.status(500).json({ error: "Failed to retrieve cohort" });
    });
});

app.put("/api/cohorts/:cohortId", (req, res) => {
  const cohortId = req.params.cohortId;

  Cohort.findByIdAndUpdate(cohortId, req.body, { new: true })
    .then((updatedCohort) => {
      console.log("Updated cohort ->", updatedCohort);

      res.status(200).json(updatedCohort);
    })
    .catch((error) => {
      console.error("Error while updating the cohort ->", error);
      res.status(500).json({ error: "Failed to update the cohort" });
    });
});

app.delete("/api/cohorts/:cohortId", (req, res) => {
  Cohort.findByIdAndDelete(req.params.cohortId)
    .then((result) => {
      console.log("Cohort deleted!");
      res.status(204).send();
    })
    .catch((error) => {
      console.error("Error while deleting the cohort ->", error);
      res.status(500).json({ error: "Deleting cohort failed" });
    });
});

app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/views/docs.html");
});

app.get("/api/cohorts", (req, res) => {
  res.sendFile(__dirname + "/cohorts.json");
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
