const fs = require("fs");
const {
  createDriveClient,
  getOrCreateFolder,
} = require("./config/driveService");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const csv = require("csv-parser");
require("dotenv").config();

// Models
const Student = require("./models/Student");
const File = require("./models/File");

// Passport Config
require("./config/passport");

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "ganapati_bappa_morya",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// =====================
// MONGODB CONNECTION
// =====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err));

// =====================
// MULTER CONFIG
// =====================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// =====================
// ROUTES
// =====================

// Root Test Route
app.get("/", (req, res) => {
  res.send("SLRTCE Drive Manager Backend Running 🚀");
});

// =====================
// TEACHER GOOGLE AUTH
// =====================

app.get(
  "/auth/google",
  passport.authenticate("teacher-google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("teacher-google", {
    failureRedirect: "http://localhost:5173",
  }),
  (req, res) => {
    res.redirect("http://localhost:5173/dashboard");
  }
);

// =====================
// STUDENT DRIVE AUTH
// =====================

// Callback FIRST (important)
app.get(
  "/auth/student/callback",
  passport.authenticate("student-google", {
    failureRedirect: "http://localhost:5173/dashboard?auth=failed",
  }),
  (req, res) => {
    res.redirect("http://localhost:5173/dashboard?auth=success");
  }
);

// Start Student Authorization
app.get("/auth/student/:id", (req, res, next) => {
  req.session.studentId = req.params.id;

  passport.authenticate("student-google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/drive.file"],
    accessType: "offline",
    prompt: "consent",
  })(req, res, next);
});

// =====================
// ADD STUDENT
// =====================
app.post("/students", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email.endsWith("@slrtce.in")) {
      return res.status(400).json({
        message: "System is only built for SLRTCE organization",
      });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const newStudent = new Student({ email });
    await newStudent.save();

    res.status(201).json({
      message: "Student added successfully",
      student: newStudent,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// Parse CSV File
// =====================

app.post("/students/bulk", upload.single("file"), async (req, res) => {
  try {
    const results = [];
    const validEmails = [];
    const invalidEmails = [];
    const duplicateEmails = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => {
        const email = (data.email || Object.values(data)[0] || "")
          .trim()
          .toLowerCase();

        if (!email.endsWith("@slrtce.in")) {
          invalidEmails.push(email);
        } else {
          validEmails.push(email);
        }
      })
      .on("end", async () => {
        for (const email of validEmails) {
          const existing = await Student.findOne({ email });
          if (existing) {
            duplicateEmails.push(email);
          } else {
            await new Student({ email }).save();
          }
        }

        fs.unlinkSync(req.file.path);

        res.json({
          message: "CSV processed successfully",
          added: validEmails.length - duplicateEmails.length,
          invalid: invalidEmails,
          duplicates: duplicateEmails,
        });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// GET ALL STUDENTS
// =====================
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// DELETE STUDENTS
// =====================
app.delete("/students", async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({
        message: "No students selected for deletion",
      });
    }

    await Student.deleteMany({
      _id: { $in: studentIds },
    });

    res.json({
      message: "Selected students deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// FILE DISTRIBUTION
// =====================
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    let { studentIds } = req.body;

    if (typeof studentIds === "string") {
      studentIds = JSON.parse(studentIds);
    }

    const students = await Student.find({
      _id: { $in: studentIds },
      status: "Approved",
    });

    if (students.length === 0) {
      return res.status(400).json({
        message: "No approved students found",
      });
    }

    const driveResults = [];

    for (const student of students) {
      const drive = createDriveClient(student.refreshToken);

      const folderId = await getOrCreateFolder(drive);

      const fileMetadata = {
        name: req.file.originalname,
        parents: [folderId],
      };

      const media = {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path),
      };

      const uploadedFile = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id",
      });

      driveResults.push({
        studentEmail: student.email,
        driveFileId: uploadedFile.data.id,
      });
    }

    const newFile = new File({
      fileName: req.file.originalname,
      uploadedBy: "Teacher",
      recipients: studentIds,
      driveFileIds: driveResults,
    });

    await newFile.save();

    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: "File distributed successfully ✅",
      results: driveResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
