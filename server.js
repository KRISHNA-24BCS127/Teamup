// server.js - Teamup Full-Stack Platform Entrypoint
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const mongoose = require("mongoose");

// Models
const User = require("./models/User");
const Teammate = require("./models/Teammate");
const Session = require("./models/Session");
const TeamRequest = require("./models/TeamRequest");

// Parsing Utilities
const {
  extractSkills,
  extractGitHubLinks,
  extractProjects,
  extractAchievements,
  matchProjectsWithGitHub
} = require("./utils/parser");

// Seed Data
const { initialTeammates } = require("./scripts/seedData");

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

const app = express();

// Security middleware (production-safe defaults)
// - Stops Express from advertising its version (X-Powered-By)
// - Adds basic hardening headers; tuned to work with the static frontend
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return next();
});

// CORS — restrict to allowed origins when CORS_ORIGIN is set (comma-separated).
// Defaults to allowing the same-origin requests (no header needed) plus any
// explicitly configured origins. For production, set CORS_ORIGIN to your domain(s).
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin (same-origin, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve ONLY the public/ folder — never the project root (protects .env, source, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Ensure uploads directory exists
if (!fs.existsSync(path.join(__dirname, "uploads"))) {
  fs.mkdirSync(path.join(__dirname, "uploads"), { recursive: true });
}

// -------------------------------------------------------------
// In-Memory Storage (Fallback Mode when MongoDB is unavailable)
// -------------------------------------------------------------
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

const inMemorySessions = {};
const inMemoryTeamRequests = [];
const inMemoryUsers = [
  {
    id: "usr-demo-1",
    _id: "usr-demo-1",
    fullName: "Test User",
    email: "test@example.com",
    password: hashPassword("password123"),
    skills: ["JavaScript", "React", "Node.js", "Express"],
    bio: "Full-stack developer testing the Teamup platform.",
    availability: "Now",
    githubLinks: ["https://github.com/KRISHNA-24BCS127/Teamup"],
    projects: [
      {
        name: "Teamup Platform",
        description: "Hackathon project team finder with resume parser and smart matching.",
        technologies: ["Node.js", "Express", "MongoDB", "JavaScript"],
        githubUrl: "https://github.com/KRISHNA-24BCS127/Teamup"
      }
    ],
    achievements: [
      { title: "Hackathon 2025 Participant", type: "Hackathon" }
    ],
    avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
    createdAt: new Date().toISOString()
  }
];

let inMemoryTeammates = initialTeammates.map((item, idx) => ({
  id: `tm-${idx + 1}`,
  _id: `tm-${idx + 1}`,
  ...item
}));

// Helper to generate secure random token
const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// -------------------------------------------------------------
// Authentication Middleware
// -------------------------------------------------------------
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // 1. Check MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const session = await Session.findOne({ token });
        if (session) {
          if (new Date(session.expiresAt) < new Date()) {
            await Session.deleteOne({ token });
            return res.status(401).json({ success: false, message: "Session expired, please login again" });
          }

          const user = await User.findById(session.userId);
          if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
          }

          req.user = user;
          req.token = token;
          return next();
        }
      } catch (err) {
        console.warn("MongoDB auth check failed, checking in-memory sessions:", err.message);
      }
    }

    // 2. Check In-Memory sessions fallback
    const session = inMemorySessions[token];
    if (!session) {
      return res.status(401).json({ success: false, message: "Authentication required or invalid session" });
    }

    if (new Date(session.expiresAt) < new Date()) {
      delete inMemorySessions[token];
      return res.status(401).json({ success: false, message: "Session expired, please login again" });
    }

    const user = inMemoryUsers.find(u => u.id === session.userId || u._id === session.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(500).json({ success: false, message: "Server error during authentication" });
  }
};

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mode: mongoose.connection.readyState === 1 ? "MongoDB" : "In-Memory Fallback",
    time: new Date().toISOString()
  });
});

// Resume routes integration
const resumeRoutes = require("./routes/resume");
app.use("/api/resume", resumeRoutes);

// User Signup
app.post("/api/signup", upload.single("resume"), async (req, res) => {
  try {
    const { fullName, email, password, bio, availability } = req.body;
    let skills = req.body.skills || [];

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide full name, email, and password" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    // Resume parsing if file is attached
    let githubLinks = [];
    let projects = [];
    let achievements = [];

    if (req.file) {
      let text = "";
      const filePath = req.file.path;
      try {
        if (req.file.mimetype === "application/pdf") {
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(dataBuffer);
          text = pdfData.text;
        } else if (
          req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          req.file.mimetype === "application/msword"
        ) {
          const docData = await mammoth.extractRawText({ path: filePath });
          text = docData.value;
        }

        if (text) {
          const extractedSkills = extractSkills(text);
          if (extractedSkills.length > 0) {
            skills = Array.from(new Set([...(Array.isArray(skills) ? skills : [skills]), ...extractedSkills]));
          }
          githubLinks = extractGitHubLinks(text);
          const rawProjects = extractProjects(text);
          projects = matchProjectsWithGitHub(rawProjects, githubLinks);
          achievements = extractAchievements(text);
        }
      } catch (extractErr) {
        console.warn("Could not extract from uploaded resume:", extractErr.message);
      } finally {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } else if (typeof skills === "string") {
      skills = skills.split(",").map(s => s.trim()).filter(Boolean);
    }

    const hashedPassword = hashPassword(password);
    const normalizedEmail = email.toLowerCase().trim();

    // 1. MongoDB Mode
    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({ success: false, message: "A user with this email already exists" });
      }

      const newUser = new User({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        skills: Array.isArray(skills) ? skills : [skills],
        bio: bio || "",
        availability: availability || "Not specified",
        githubLinks,
        projects,
        achievements
      });

      await newUser.save();
      const { password: _, ...userWithoutPass } = newUser.toObject();

      return res.status(201).json({
        success: true,
        message: "Signup successful",
        user: userWithoutPass
      });
    }

    // 2. In-Memory Mode
    if (inMemoryUsers.find(u => u.email.toLowerCase() === normalizedEmail)) {
      return res.status(409).json({ success: false, message: "A user with this email already exists" });
    }

    const newId = `usr-${Date.now()}`;
    const newUser = {
      id: newId,
      _id: newId,
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      skills: Array.isArray(skills) ? skills : [skills],
      bio: bio || "",
      availability: availability || "Not specified",
      githubLinks,
      projects,
      achievements,
      avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
      createdAt: new Date().toISOString()
    };

    inMemoryUsers.push(newUser);
    const { password: _, ...userWithoutPass } = newUser;

    res.status(201).json({
      success: true,
      message: "Signup successful",
      user: userWithoutPass
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// User Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide both email and password" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const hashedPassword = hashPassword(password);
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // 1. MongoDB Mode
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: normalizedEmail, password: hashedPassword });
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      await Session.create({
        userId: user._id,
        token,
        expiresAt
      });

      inMemorySessions[token] = { userId: user._id.toString(), expiresAt };

      const { password: _, ...userWithoutPass } = user.toObject();
      return res.json({
        success: true,
        message: "Login successful",
        user: userWithoutPass,
        token,
        expiresAt
      });
    }

    // 2. In-Memory Mode
    const user = inMemoryUsers.find(u => u.email.toLowerCase() === normalizedEmail && u.password === hashedPassword);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    inMemorySessions[token] = {
      userId: user.id || user._id,
      expiresAt
    };

    const { password: _, ...userWithoutPass } = user;
    res.json({
      success: true,
      message: "Login successful",
      user: userWithoutPass,
      token,
      expiresAt
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// Current User Profile
app.get("/api/profile", authenticateUser, (req, res) => {
  try {
    const userData = req.user.toObject ? req.user.toObject() : { ...req.user };
    delete userData.password;

    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ success: false, message: "Error loading profile" });
  }
});

// Update Profile
app.put("/api/profile", authenticateUser, async (req, res) => {
  try {
    const { fullName, bio, skills, availability } = req.body;
    const user = req.user;

    if (fullName) user.fullName = fullName.trim();
    if (bio !== undefined) user.bio = bio;
    if (skills) user.skills = Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim()).filter(Boolean);
    if (availability) user.availability = availability;

    if (mongoose.connection.readyState === 1 && user.save) {
      user.updatedAt = new Date();
      await user.save();
      const { password: _, ...userData } = user.toObject();
      return res.json({ success: true, message: "Profile updated successfully", user: userData });
    }

    // In-memory update
    user.updatedAt = new Date().toISOString();
    const { password: _, ...userData } = { ...user };
    res.json({ success: true, message: "Profile updated successfully", user: userData });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
});

// Delete Account (permanent — removes the user and all their sessions)
app.delete("/api/profile", authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // 1. MongoDB Mode
    if (mongoose.connection.readyState === 1) {
      await Session.deleteMany({ userId });
      await User.findByIdAndDelete(userId);
      return res.json({ success: true, message: "Account deleted successfully" });
    }

    // 2. In-Memory Mode
    const idx = inMemoryUsers.findIndex(u => u.id === userId || u._id === userId);
    if (idx !== -1) {
      inMemoryUsers.splice(idx, 1);
    }
    Object.keys(inMemorySessions).forEach((t) => {
      if (inMemorySessions[t].userId === userId) {
        delete inMemorySessions[t];
      }
    });

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ success: false, message: "Error deleting account" });
  }
});

// Logout
app.post("/api/logout", authenticateUser, async (req, res) => {
  try {
    const token = req.token;
    if (mongoose.connection.readyState === 1) {
      await Session.deleteOne({ token });
    }
    delete inMemorySessions[token];

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Logout error" });
  }
});

// Search Teammates (Combines Teammate collection & User collection)
app.get("/api/search/teammates", async (req, res) => {
  try {
    const { skills, availability } = req.query;

    // 1. MongoDB Mode
    if (mongoose.connection.readyState === 1) {
      try {
        let query = {};
        if (skills && skills.trim()) {
          const escaped = skills.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          query.skills = { $regex: new RegExp(escaped, "i") };
        }
        if (availability && availability !== "Any Availability") {
          query.availability = availability;
        }

        const [teammates, users] = await Promise.all([
          Teammate.find(query).lean(),
          User.find(query).select("-password").lean()
        ]);

        const combined = [
          ...teammates.map(t => ({
            _id: t._id,
            id: t._id,
            name: t.name,
            skills: t.skills || [],
            availability: t.availability || "Not specified",
            bio: t.bio || "",
            avatar: t.avatar || "https://randomuser.me/api/portraits/lego/1.jpg",
            githubLinks: t.githubLinks || [],
            projects: t.projects || [],
            achievements: t.achievements || [],
            resumeUrl: t.resumeUrl || "",
            teamStatus: t.teamStatus || "available",
            teamName: t.teamName || ""
          })),
          ...users.map(u => ({
            _id: u._id,
            id: u._id,
            name: u.fullName,
            skills: u.skills || [],
            availability: u.availability || "Not specified",
            bio: u.bio || "",
            avatar: u.avatar || "https://randomuser.me/api/portraits/lego/1.jpg",
            githubLinks: u.githubLinks || [],
            projects: u.projects || [],
            achievements: u.achievements || [],
            teamStatus: u.teamStatus || "available",
            teamName: u.teamName || ""
          }))
        ];

        return res.json({ success: true, teammates: combined });
      } catch (mongoErr) {
        console.warn("MongoDB teammate search error, falling back to memory:", mongoErr.message);
      }
    }

    // 2. In-Memory Mode
    let allCandidates = [
      ...inMemoryTeammates,
      ...inMemoryUsers.map(u => ({
        id: u.id,
        _id: u._id,
        name: u.fullName,
        skills: u.skills,
        availability: u.availability,
        bio: u.bio,
        avatar: u.avatar || "https://randomuser.me/api/portraits/lego/1.jpg",
        githubLinks: u.githubLinks || [],
        projects: u.projects || [],
        achievements: u.achievements || [],
        teamStatus: u.teamStatus || "available",
        teamName: u.teamName || ""
      }))
    ];

    if (skills && skills.trim()) {
      const searchTerms = skills.toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
      allCandidates = allCandidates.filter(t => {
        const tSkills = (t.skills || []).map(s => s.toLowerCase());
        return searchTerms.some(term => tSkills.some(s => s.includes(term)));
      });
    }

    if (availability && availability !== "Any Availability") {
      allCandidates = allCandidates.filter(t => t.availability === availability);
    }

    res.json({ success: true, teammates: allCandidates });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Error performing search" });
  }
});

// Paginated Teammates list
app.get("/api/teammates", async (req, res) => {
  try {
    const { skill, availability, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));

    if (mongoose.connection.readyState === 1) {
      try {
        let filter = {};
        if (skill) {
          const escaped = skill.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          filter.skills = { $regex: new RegExp(escaped, "i") };
        }
        if (availability) {
          filter.availability = { $regex: new RegExp(availability.trim(), "i") };
        }

        const skip = (pageNum - 1) * limitNum;
        const [teammates, total] = await Promise.all([
          Teammate.find(filter).skip(skip).limit(limitNum).lean(),
          Teammate.countDocuments(filter)
        ]);

        return res.json({
          success: true,
          teammates,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum)
          }
        });
      } catch (err) {
        console.warn("MongoDB teammates error:", err.message);
      }
    }

    // In-memory pagination
    let filtered = [...inMemoryTeammates];
    if (skill) {
      filtered = filtered.filter(t => (t.skills || []).some(s => s.toLowerCase().includes(skill.toLowerCase())));
    }
    if (availability) {
      filtered = filtered.filter(t => (t.availability || "").toLowerCase() === availability.toLowerCase());
    }

    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      teammates: paginated,
      pagination: {
        total: filtered.length,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(filtered.length / limitNum)
      }
    });
  } catch (error) {
    console.error("Teammates error:", error);
    res.status(500).json({ success: false, message: "Error fetching teammates" });
  }
});

// Delete a Teammate entry (moderation / cleanup)
app.delete("/api/teammates/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. MongoDB Mode
    if (mongoose.connection.readyState === 1) {
      try {
        const deleted = await Teammate.findByIdAndDelete(id);
        if (!deleted) {
          return res.status(404).json({ success: false, message: "Teammate not found" });
        }
        return res.json({ success: true, message: "Teammate deleted successfully" });
      } catch (mongoErr) {
        console.warn("MongoDB teammate delete error, falling back to memory:", mongoErr.message);
      }
    }

    // 2. In-Memory Mode
    const idx = inMemoryTeammates.findIndex(t => t.id === id || t._id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "Teammate not found" });
    }
    inMemoryTeammates.splice(idx, 1);

    res.json({ success: true, message: "Teammate deleted successfully" });
  } catch (error) {
    console.error("Delete teammate error:", error);
    res.status(500).json({ success: false, message: "Error deleting teammate" });
  }
});

// -------------------------------------------------------------
// Team Requests (send / receive / accept / decline / cancel)
// -------------------------------------------------------------
const imFindUser = (id) =>
  inMemoryUsers.find((u) => u.id === id || u._id === id || String(u.id) === String(id) || String(u._id) === String(id));

// Send a team request to another user
app.post("/api/team-requests", authenticateUser, async (req, res) => {
  try {
    const { toUserId, message, teamName } = req.body;
    const fromId = String(req.user._id || req.user.id);

    if (!toUserId) {
      return res.status(400).json({ success: false, message: "toUserId is required" });
    }
    if (String(fromId) === String(toUserId)) {
      return res.status(400).json({ success: false, message: "You cannot send a team request to yourself" });
    }

    // 1. MongoDB Mode
    if (mongoose.connection.readyState === 1) {
      const target = await User.findById(toUserId);
      if (!target) {
        return res.status(404).json({ success: false, message: "Target user not found" });
      }
      const existing = await TeamRequest.findOne({
        status: "pending",
        $or: [
          { fromUserId: fromId, toUserId },
          { fromUserId: toUserId, toUserId: fromId }
        ]
      });
      if (existing) {
        return res.status(409).json({ success: false, message: "A pending request already exists between you two" });
      }
      if (target.teamStatus === "booked") {
        return res.status(409).json({ success: false, message: `${target.fullName} is already booked in a team` });
      }
      const created = await TeamRequest.create({
        fromUserId: fromId,
        toUserId,
        message: (message || "").slice(0, 300),
        teamName: teamName || ""
      });
      return res.status(201).json({ success: true, message: "Team request sent", request: created });
    }

    // 2. In-Memory Mode
    const target = imFindUser(toUserId);
    if (!target) {
      return res.status(404).json({ success: false, message: "Target user not found" });
    }
    const existing = inMemoryTeamRequests.find(
      r => r.status === "pending" &&
        ((r.fromUserId === fromId && r.toUserId === toUserId) ||
         (r.fromUserId === toUserId && r.toUserId === fromId))
    );
    if (existing) {
      return res.status(409).json({ success: false, message: "A pending request already exists between you two" });
    }
    if (target.teamStatus === "booked") {
      return res.status(409).json({ success: false, message: `${target.fullName} is already booked in a team` });
    }

    const newRequest = {
      _id: `req-${Date.now()}`,
      fromUserId: fromId,
      toUserId,
      message: (message || "").slice(0, 300),
      teamName: teamName || "",
      status: "pending",
      createdAt: new Date().toISOString(),
      respondedAt: null
    };
    inMemoryTeamRequests.push(newRequest);
    res.status(201).json({ success: true, message: "Team request sent", request: newRequest });
  } catch (error) {
    console.error("Send team request error:", error);
    res.status(500).json({ success: false, message: "Error sending team request" });
  }
});

// List my team requests (?box=in|out|all)
app.get("/api/team-requests", authenticateUser, async (req, res) => {
  try {
    const box = req.query.box || "all";
    const uid = String(req.user._id || req.user.id);
    const populateUser = (u) => u
      ? { _id: u._id || u.id, name: u.fullName || u.name || "User", avatar: u.avatar || "https://randomuser.me/api/portraits/lego/1.jpg", teamStatus: u.teamStatus || "available", teamName: u.teamName || "" }
      : { _id: null, name: "Unknown User", avatar: null, teamStatus: "available", teamName: "" };

    // 1. MongoDB Mode
    if (mongoose.connection.readyState === 1) {
      const filter = box === "in"
        ? { toUserId: uid }
        : box === "out"
          ? { fromUserId: uid }
          : { $or: [{ fromUserId: uid }, { toUserId: uid }] };

      const requests = await TeamRequest.find(filter).sort({ createdAt: -1 }).lean();
      const userIds = [...new Set(requests.flatMap(r => [String(r.fromUserId), String(r.toUserId)]))];
      const users = await User.find({ _id: { $in: userIds } }).select("fullName avatar teamStatus teamName").lean();
      const userMap = Object.fromEntries(users.map(u => [String(u._id), populateUser(u)]));

      const enriched = requests.map(r => ({
        ...r,
        fromUser: userMap[String(r.fromUserId)] || populateUser(null),
        toUser: userMap[String(r.toUserId)] || populateUser(null),
        direction: String(r.fromUserId) === uid ? "outgoing" : "incoming"
      }));
      return res.json({ success: true, requests: enriched });
    }

    // 2. In-Memory Mode
    let list = inMemoryTeamRequests.filter(r => r.fromUserId === uid || r.toUserId === uid);
    if (box === "in") list = list.filter(r => r.toUserId === uid);
    if (box === "out") list = list.filter(r => r.fromUserId === uid);
    list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const enriched = list.map(r => ({
      ...r,
      fromUser: populateUser(imFindUser(r.fromUserId)),
      toUser: populateUser(imFindUser(r.toUserId)),
      direction: r.fromUserId === uid ? "outgoing" : "incoming"
    }));
    res.json({ success: true, requests: enriched });
  } catch (error) {
    console.error("List team requests error:", error);
    res.status(500).json({ success: false, message: "Error loading team requests" });
  }
});

// Respond to a team request (accept | decline | cancel)
async function respondToTeamRequest(req, res, action) {
  try {
    const { id } = req.params;
    const uid = String(req.user._id || req.user.id);

    // 1. MongoDB Mode
    if (mongoose.connection.readyState === 1) {
      const request = await TeamRequest.findById(id);
      if (!request) {
        return res.status(404).json({ success: false, message: "Team request not found" });
      }
      const isRecipient = String(request.toUserId) === uid;
      const isSender = String(request.fromUserId) === uid;
      if (action === "cancel" ? !isSender : !isRecipient) {
        return res.status(403).json({
          success: false,
          message: action === "cancel" ? "Only the sender can cancel this request" : "Only the recipient can respond to this request"
        });
      }
      if (request.status !== "pending") {
        return res.status(409).json({ success: false, message: `Request already ${request.status}` });
      }

      if (action === "accept") {
        const [fromUser, toUser] = await Promise.all([
          User.findById(request.fromUserId),
          User.findById(request.toUserId)
        ]);
        const teamName = request.teamName || `${(fromUser?.fullName || "Someone").split(" ")[0]}'s Team`;

        await User.updateMany(
          { _id: { $in: [request.fromUserId, request.toUserId] } },
          { $set: { teamStatus: "booked", teamName, updatedAt: new Date() } }
        );

        // Auto-decline all other pending requests involving either member
        await TeamRequest.updateMany(
          {
            _id: { $ne: request._id },
            status: "pending",
            $or: [
              { fromUserId: { $in: [request.fromUserId, request.toUserId] } },
              { toUserId: { $in: [request.fromUserId, request.toUserId] } }
            ]
          },
          { $set: { status: "declined", respondedAt: new Date() } }
        );

        request.status = "accepted";
        request.teamName = teamName;
        request.respondedAt = new Date();
        await request.save();

        const updatedMe = await User.findById(uid).select("-password").lean();
        return res.json({ success: true, message: `Request accepted — you are now in "${teamName}"`, teamName, user: updatedMe });
      }

      request.status = action === "cancel" ? "cancelled" : "declined";
      request.respondedAt = new Date();
      await request.save();
      return res.json({ success: true, message: action === "cancel" ? "Request cancelled" : "Request declined" });
    }

    // 2. In-Memory Mode
    const request = inMemoryTeamRequests.find(r => r._id === id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Team request not found" });
    }
    const isRecipient = String(request.toUserId) === uid;
    const isSender = String(request.fromUserId) === uid;
    if (action === "cancel" ? !isSender : !isRecipient) {
      return res.status(403).json({
        success: false,
        message: action === "cancel" ? "Only the sender can cancel this request" : "Only the recipient can respond to this request"
      });
    }
    if (request.status !== "pending") {
      return res.status(409).json({ success: false, message: `Request already ${request.status}` });
    }

    if (action === "accept") {
      const fromUser = imFindUser(request.fromUserId);
      const teamName = request.teamName || `${(fromUser?.fullName || "Someone").split(" ")[0]}'s Team`;

      [request.fromUserId, request.toUserId].forEach(memberId => {
        const member = imFindUser(memberId);
        if (member) {
          member.teamStatus = "booked";
          member.teamName = teamName;
        }
      });

      // Auto-decline all other pending requests involving either member
      inMemoryTeamRequests.forEach(r => {
        if (r._id !== request._id && r.status === "pending") {
          const involved = [r.fromUserId, r.toUserId].some(x => x === request.fromUserId || x === request.toUserId);
          if (involved) {
            r.status = "declined";
            r.respondedAt = new Date().toISOString();
          }
        }
      });

      request.status = "accepted";
      request.teamName = teamName;
      request.respondedAt = new Date().toISOString();

      const me = imFindUser(uid);
      const { password: _pw, ...meSafe } = me || {};
      return res.json({ success: true, message: `Request accepted — you are now in "${teamName}"`, teamName, user: meSafe });
    }

    request.status = action === "cancel" ? "cancelled" : "declined";
    request.respondedAt = new Date().toISOString();
    res.json({ success: true, message: action === "cancel" ? "Request cancelled" : "Request declined" });
  } catch (error) {
    console.error(`Team request ${action} error:`, error);
    res.status(500).json({ success: false, message: "Error processing request" });
  }
}

app.post("/api/team-requests/:id/accept", authenticateUser, (req, res) => respondToTeamRequest(req, res, "accept"));
app.post("/api/team-requests/:id/decline", authenticateUser, (req, res) => respondToTeamRequest(req, res, "decline"));
app.post("/api/team-requests/:id/cancel", authenticateUser, (req, res) => respondToTeamRequest(req, res, "cancel"));

// Database status (diagnostic endpoint)
app.get("/api/db-status", authenticateUser, async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    let teammateCount = inMemoryTeammates.length;

    if (isConnected) {
      teammateCount = await Teammate.countDocuments();
    }

    res.json({
      success: true,
      mongoConnected: isConnected,
      mode: isConnected ? "MongoDB Atlas / Local" : "In-Memory Store",
      user: {
        id: req.user.id || req.user._id,
        name: req.user.fullName,
        email: req.user.email
      },
      stats: {
        teammateCount
      }
    });
  } catch (error) {
    console.error("DB status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// HTML Page Serving
// -------------------------------------------------------------
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "public", "signup.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));
app.get("/about", (req, res) => res.sendFile(path.join(__dirname, "public", "about.html")));
app.get("/db-status", (req, res) => res.sendFile(path.join(__dirname, "public", "db-status.html")));

// 404 Fallback for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// -------------------------------------------------------------
// Server Initialization
// -------------------------------------------------------------
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

async function start() {
  if (MONGODB_URI) {
    try {
      console.log("🔌 Attempting MongoDB connection...");
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });
      console.log("✅ MongoDB Connected successfully.");

      // Seed if empty
      const count = await Teammate.countDocuments();
      if (count === 0) {
        console.log("🌱 Database is empty. Seeding initial teammates...");
        await Teammate.insertMany(initialTeammates);
        console.log("✅ Seeding complete.");
      }
    } catch (err) {
      console.warn("⚠️ MongoDB connection failed:", err.message);
      console.log("🚀 Continuing seamlessly with In-Memory storage.");
    }
  } else {
    console.log("ℹ️ No MONGODB_URI provided. Starting in zero-config In-Memory mode.");
  }

  app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 Teamup Platform running on port ${PORT}`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`📋 Mode: ${mongoose.connection.readyState === 1 ? "MongoDB" : "In-Memory Store"}`);
    console.log(`=================================================\n`);
  });
}

start();

module.exports = app;
