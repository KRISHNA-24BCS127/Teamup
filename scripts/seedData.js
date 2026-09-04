// scripts/seedData.js - Shared Teammates and Users Sample Data

const initialTeammates = [
  {
    name: "Basant Gautam",
    skills: ["JavaScript", "Node.js", "Express", "React", "MongoDB", "REST API"],
    availability: "Now",
    bio: "Full-stack developer and hackathon lead. Passionate about building collaborative developer tools.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    githubLinks: ["https://github.com/basant-gautam"],
    projects: [
      {
        name: "Teamup",
        description: "Full-stack team formation platform with resume skill extraction and matching algorithms.",
        technologies: ["Node.js", "Express", "MongoDB", "JavaScript"],
        githubUrl: "https://github.com/KRISHNA-24BCS127/Teamup"
      }
    ],
    achievements: [
      { title: "Hackathon Finalist 2025", type: "Hackathon" }
    ],
    // 📄 Paste this teammate's real resume (Google Drive / PDF) link here.
    // Leave "" empty when there is no resume — the Resume button will be hidden.
    resumeUrl: ""
  },
  {
    name: "Krishna Rai",
    skills: ["Python", "Machine Learning", "Deep Learning", "NLP", "PyTorch", "FastAPI"],
    availability: "Now",
    bio: "AI/ML researcher and engineer. Specializing in intelligent text extraction and recommendation engines.",
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    githubLinks: ["https://github.com/KRISHNA-24BCS127"],
    projects: [
      {
        name: "Resume Intelligence Parser",
        description: "NLP-powered resume parsing pipeline that extracts technical skills, GitHub repositories, and projects.",
        technologies: ["Python", "NLP", "Machine Learning", "Node.js"],
        githubUrl: "https://github.com/KRISHNA-24BCS127/Teamup"
      }
    ],
    achievements: [
      { title: "Smart India Hackathon Participant", type: "Hackathon" },
      { title: "Top 5% in Competitive Coding", type: "Ranking" }
    ],
    resumeUrl: ""
  },
  {
    name: "Kushagra Gupta",
    skills: ["C++", "Java", "Algorithms", "Data Structures", "Game Dev", "Systems"],
    availability: "Now",
    bio: "Systems developer with a strong foundation in core algorithms, C++/Java, and interactive systems.",
    avatar: "https://randomuser.me/api/portraits/men/86.jpg",
    githubLinks: ["https://github.com/Kushagra-Gupta"],
    projects: [
      {
        name: "Algorithm Visualizer",
        description: "Interactive visual simulator for graph traversal and sorting algorithms in C++.",
        technologies: ["C++", "Algorithms", "Data Structures"],
        githubUrl: "https://github.com"
      }
    ],
    achievements: [
      { title: "Code Rumble 3.0 Winner", type: "Award" }
    ],
    resumeUrl: ""
  }
];

module.exports = { initialTeammates };
