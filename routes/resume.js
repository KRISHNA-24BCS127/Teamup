// routes/resume.js - Resume Parsing & Teammate Matching Routes
const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const mongoose = require("mongoose");
const User = require("../models/User");
const {
  extractSkills,
  extractGitHubLinks,
  extractProjects,
  extractAchievements,
  matchProjectsWithGitHub
} = require("../utils/parser");

const upload = multer({ dest: "uploads/" });

// POST /api/resume/extract - Extract skills, projects, links from uploaded resume file
router.post("/extract", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No resume file uploaded" });
    }

    let text = "";
    const filePath = req.file.path;

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

    // Always clean up temp file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Could not extract text from the file" });
    }

    const skills = extractSkills(text);
    const githubLinks = extractGitHubLinks(text);
    const rawProjects = extractProjects(text);
    const projects = matchProjectsWithGitHub(rawProjects, githubLinks);
    const achievements = extractAchievements(text);

    res.json({
      success: true,
      data: {
        skills,
        githubLinks,
        projects,
        achievements,
        textSnippet: text.substring(0, 300)
      }
    });
  } catch (err) {
    console.error("Resume file extraction error:", err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: "Error extracting resume data: " + err.message });
  }
});

// POST /api/resume/parse-resume - Parse text & find matching teammates
router.post("/parse-resume", async (req, res) => {
  try {
    const { userId, text, name } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: "No resume text provided" });
    }

    const skills = extractSkills(text);
    const githubLinks = extractGitHubLinks(text);
    const rawProjects = extractProjects(text);
    const projects = matchProjectsWithGitHub(rawProjects, githubLinks);

    let matches = [];

    // If MongoDB is connected, update DB and query teammates
    if (mongoose.connection.readyState === 1 && userId) {
      try {
        let user = await User.findById(userId);
        if (user) {
          if (name) user.fullName = name;
          user.skills = Array.from(new Set([...user.skills, ...skills]));
          user.githubLinks = Array.from(new Set([...user.githubLinks, ...githubLinks]));
          user.projects = projects;
          await user.save();
        }

        const allUsers = await User.find({ _id: { $ne: userId } }).select("-password");
        matches = allUsers
          .map(u => {
            const sharedSkills = (u.skills || []).filter(skill => skills.includes(skill));
            const sharedProjects = (u.projects || []).filter(p1 =>
              projects.some(p2 => (p1.technologies || []).some(t => (p2.technologies || []).includes(t)))
            );
            const totalScore = sharedSkills.length * 2 + sharedProjects.length * 3;
            if (totalScore > 0) {
              return {
                userId: u._id,
                name: u.fullName,
                avatar: u.avatar,
                bio: u.bio,
                availability: u.availability,
                sharedSkills,
                sharedProjects: sharedProjects.map(p => ({ name: p.name, technologies: p.technologies })),
                matchScore: totalScore
              };
            }
            return null;
          })
          .filter(Boolean)
          .sort((a, b) => b.matchScore - a.matchScore);
      } catch (dbErr) {
        console.warn("MongoDB match error, returning extracted data:", dbErr.message);
      }
    }

    res.json({
      success: true,
      userSkills: skills,
      githubLinks,
      projects,
      matches,
      stats: {
        skillsFound: skills.length,
        projectsFound: projects.length,
        githubLinksFound: githubLinks.length,
        matchesFound: matches.length
      }
    });
  } catch (error) {
    console.error("Resume parsing error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to parse resume",
      details: error.message
    });
  }
});

// GET /api/resume/user/:userId - Fetch user parsed resume data
router.get("/user/:userId", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.params.userId).select("-password");
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      return res.json({
        success: true,
        user: {
          name: user.fullName,
          skills: user.skills,
          githubLinks: user.githubLinks,
          projects: user.projects
        }
      });
    }

    res.status(404).json({ success: false, error: "User not found (In-memory mode)" });
  } catch (error) {
    console.error("User fetch error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user data" });
  }
});

module.exports = router;
