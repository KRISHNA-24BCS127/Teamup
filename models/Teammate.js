const mongoose = require('mongoose');

const teammateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  skills: { type: [String], default: [] },
  availability: { type: String, default: "Not specified" },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "https://randomuser.me/api/portraits/lego/1.jpg" },
  githubLinks: { type: [String], default: [] },
  projects: [{
    name: { type: String, required: true },
    description: { type: String, default: "" },
    technologies: { type: [String], default: [] },
    githubUrl: { type: String, default: "" }
  }],
  achievements: [{
    title: { type: String, required: true },
    type: { type: String, default: "Achievement" }
  }]
});

module.exports = mongoose.model('Teammate', teammateSchema);
