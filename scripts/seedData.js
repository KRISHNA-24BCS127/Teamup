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
    ]
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
    ]
  },
  {
    name: "Kushagra Gupta",
    skills: ["Python", "Machine Learning", "AI", "C++", "Java", "Game Dev"],
    availability: "Now",
    bio: "Systems and AI developer with strong foundation in core algorithms and interactive systems.",
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
    ]
  },
  {
    name: "Sarah Johnson",
    skills: ["JavaScript", "React", "TypeScript", "Node.js", "Tailwind CSS"],
    availability: "Later Today",
    bio: "Frontend specialist focused on responsive UX, component design systems, and web performance.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    githubLinks: ["https://github.com/sarah-j-dev"],
    projects: [
      {
        name: "DevHub Dashboard",
        description: "Modern real-time collaboration dashboard for developer communities.",
        technologies: ["React", "TypeScript", "Tailwind CSS"],
        githubUrl: "https://github.com/sarah-j-dev/devhub"
      }
    ],
    achievements: [
      { title: "React Certified Professional", type: "Certification" }
    ]
  },
  {
    name: "Michael Chen",
    skills: ["Python", "Django", "AWS", "Docker", "Machine Learning"],
    availability: "This Weekend",
    bio: "Backend architect specializing in cloud infrastructure, containerization, and automated CI/CD pipelines.",
    avatar: "https://randomuser.me/api/portraits/men/62.jpg",
    githubLinks: ["https://github.com/mchen-cloud"],
    projects: [
      {
        name: "CloudScale ML",
        description: "Distributed model training pipeline deployed on AWS ECS with auto-scaling.",
        technologies: ["Python", "AWS", "Docker"],
        githubUrl: "https://github.com/mchen-cloud/cloudscale"
      }
    ],
    achievements: [
      { title: "AWS Certified Solutions Architect", type: "Certification" }
    ]
  },
  {
    name: "Emily Rodriguez",
    skills: ["UI/UX Design", "Figma", "Design Systems", "HTML", "CSS"],
    availability: "Next Week",
    bio: "Product designer passionate about intuitive user flows, accessible design, and wireframing.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    githubLinks: ["https://github.com/emily-designs"],
    projects: [
      {
        name: "FinTech Mobile UI Kit",
        description: "Comprehensive open-source design system with 100+ accessible UI components in Figma.",
        technologies: ["Figma", "UI/UX", "Design"],
        githubUrl: "https://github.com/emily-designs/uikit"
      }
    ],
    achievements: [
      { title: "Best Design Award - UI Hack 2024", type: "Award" }
    ]
  },
  {
    name: "Raj Sharma",
    skills: ["Flutter", "Firebase", "Mobile Dev", "Dart", "Android"],
    availability: "Now",
    bio: "Mobile engineer building cross-platform applications with seamless offline sync.",
    avatar: "https://randomuser.me/api/portraits/men/77.jpg",
    githubLinks: ["https://github.com/raj-flutter"],
    projects: [
      {
        name: "CampusConnect App",
        description: "Cross-platform student communication network with push notifications and live chat.",
        technologies: ["Flutter", "Firebase", "Dart"],
        githubUrl: "https://github.com/raj-flutter/campus"
      }
    ],
    achievements: [
      { title: "Google Developers Student Club Lead", type: "Award" }
    ]
  }
];

module.exports = { initialTeammates };
