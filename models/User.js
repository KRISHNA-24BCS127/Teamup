const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  technologies: { type: [String], default: [] },
  githubUrl: { type: String, default: "" },
  duration: { type: String, default: "" }
}, { _id: false });

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, default: "Achievement" }
}, { _id: false });

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  skills: { type: [String], default: [] },
  bio: { type: String, default: "" },
  availability: { type: String, default: "Not specified" },
  githubLinks: { type: [String], default: [] },
  projects: [projectSchema],
  achievements: [achievementSchema],
  avatar: { type: String, default: "https://randomuser.me/api/portraits/lego/1.jpg" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
