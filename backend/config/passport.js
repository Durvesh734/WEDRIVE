const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Student = require("../models/Student");

// =====================
// TEACHER LOGIN STRATEGY
// =====================
passport.use(
  "teacher-google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;

      if (!email.endsWith("@slrtce.in")) {
        return done(null, false);
      }

      return done(null, profile);
    }
  )
);

// =====================
// STUDENT DRIVE STRATEGY
// =====================
passport.use(
  "student-google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/student/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
        try {
            const studentId = req.session.studentId;

            const student = await Student.findById(studentId);
            if (!student) return done(null, false);

            const loggedInEmail = profile.emails[0].value;

            // 🔐 Email Verification Check
            if (loggedInEmail !== student.email) {
            console.log("Email mismatch during authorization");
            return done(null, false);
            }

            // Store refresh token
            student.refreshToken = refreshToken;
            student.status = "Approved";
            await student.save();

            return done(null, profile);
        } catch (error) {
            return done(error, null);
        }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
