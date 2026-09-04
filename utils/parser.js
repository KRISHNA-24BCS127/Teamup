// utils/parser.js - Resume & Text Extraction Utilities

const SKILLS_KEYWORDS = {
  python: ["python", "django", "flask", "fastapi", "pandas", "numpy", "scikit-learn", "sklearn", "pytorch", "tensorflow", "keras"],
  javascript: ["javascript", "typescript", "react", "react.js", "angular", "vue", "vue.js", "nodejs", "node.js", "express", "express.js", "next.js", "nextjs", "svelte"],
  web_dev: ["html", "html5", "css", "css3", "tailwind", "tailwindcss", "bootstrap", "responsive design", "sass", "scss", "graphql", "rest api"],
  data_science: ["data science", "machine learning", "deep learning", "nlp", "computer vision", "data analysis", "matplotlib", "seaborn", "tableau", "power bi"],
  database: ["sql", "nosql", "mongodb", "postgresql", "postgres", "mysql", "sqlite", "redis", "firebase", "supabase", "dynamodb"],
  cloud_devops: ["aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s", "ci/cd", "git", "github", "linux", "nginx", "terraform"],
  mobile: ["flutter", "react native", "android", "ios", "swift", "kotlin"],
  design: ["figma", "ui/ux", "wireframing", "prototyping", "adobe xd", "photoshop", "canva"],
  core_cs: ["c", "c++", "java", "golang", "go", "rust", "data structures", "algorithms", "oop", "system design"]
};

function extractSkills(text) {
  if (!text || typeof text !== 'string') return [];
  const extracted = new Set();
  const cleanedText = text.toLowerCase();

  Object.values(SKILLS_KEYWORDS).forEach(keywords => {
    keywords.forEach(keyword => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(cleanedText)) {
        extracted.add(keyword);
      }
    });
  });

  return Array.from(extracted);
}

function extractGitHubLinks(text) {
  if (!text || typeof text !== 'string') return [];
  const githubLinks = new Set();
  const patterns = [
    /https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_\-\.]+(?:\/[a-zA-Z0-9_\-\.]+)?/gi,
    /(?:www\.)?github\.com\/[a-zA-Z0-9_\-\.]+(?:\/[a-zA-Z0-9_\-\.]+)?/gi,
    /git@github\.com:([a-zA-Z0-9_\-\.]+\/[a-zA-Z0-9_\-\.]+)\.git/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        let clean = match.trim().replace(/[()[\]]/g, '');
        if (clean.startsWith('git@github.com:')) {
          const repo = clean.replace('git@github.com:', '').replace(/\.git$/, '');
          clean = `https://github.com/${repo}`;
        }
        if (!clean.startsWith('http')) {
          clean = 'https://' + clean;
        }
        clean = clean.replace(/\/$/, '');
        githubLinks.add(clean);
      });
    }
  });

  return Array.from(githubLinks);
}

function classifyAchievementType(text) {
  const lower = text.toLowerCase();
  if (lower.includes('hackathon') || lower.includes('hack')) return 'Hackathon';
  if (lower.includes('certif') || lower.includes('course') || lower.includes('complete')) return 'Certification';
  if (lower.includes('won') || lower.includes('winner') || lower.includes('award') || lower.includes('1st') || lower.includes('2nd') || lower.includes('3rd')) return 'Award';
  if (lower.includes('rank') || lower.includes('position') || lower.includes('score')) return 'Ranking';
  return 'Achievement';
}

function extractProjects(text) {
  if (!text || typeof text !== 'string') return [];
  const projects = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let currentProject = null;
  let inProjectSection = false;

  const sectionKeywords = ['projects', 'project', 'portfolio', 'key projects', 'technical projects', 'academic projects'];
  const stopKeywords = ['education', 'skills', 'experience', 'certifications', 'contact', 'achievements', 'awards', 'languages'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // Section start
    if (sectionKeywords.some(s => lower === s || lower === s + ':' || lower.startsWith(s + ' '))) {
      inProjectSection = true;
      continue;
    }

    // Section exit
    if (stopKeywords.some(s => lower === s || lower === s + ':' || lower.startsWith(s + ' '))) {
      inProjectSection = false;
      continue;
    }

    if (inProjectSection) {
      const isTitle = (
        line.length >= 4 && line.length <= 80 &&
        !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') &&
        !lower.startsWith('used ') && !lower.startsWith('built with') &&
        !lower.startsWith('technologies')
      );

      if (isTitle) {
        if (currentProject && currentProject.name) {
          projects.push(currentProject);
        }
        currentProject = {
          name: line.replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December|\d{4})\b/gi, '').trim(),
          description: '',
          technologies: extractSkills(line),
          githubUrl: ''
        };
      } else if (currentProject) {
        if (line.startsWith('•') || line.startsWith('-') || line.length > 15) {
          currentProject.description += (currentProject.description ? ' ' : '') + line.replace(/^[•\-\*]\s*/, '');
        }
        const foundSkills = extractSkills(line);
        if (foundSkills.length > 0) {
          currentProject.technologies = Array.from(new Set([...currentProject.technologies, ...foundSkills]));
        }
      }
    }
  }

  if (currentProject && currentProject.name) {
    projects.push(currentProject);
  }

  return projects.filter(p => p.name.length >= 3 && p.name.length <= 100);
}

function extractAchievements(text) {
  if (!text || typeof text !== 'string') return [];
  const achievements = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let inAchievementSection = false;

  const sectionKeywords = ['achievements', 'awards', 'honors', 'certifications', 'accolades'];
  const stopKeywords = ['education', 'skills', 'experience', 'projects', 'contact'];
  const indicatorKeywords = ['awarded', 'recognized', 'achieved', 'won', 'ranked', 'certified', 'placed', 'finalist'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (sectionKeywords.some(s => lower === s || lower === s + ':')) {
      inAchievementSection = true;
      continue;
    }

    if (stopKeywords.some(s => lower === s || lower === s + ':')) {
      inAchievementSection = false;
      continue;
    }

    if ((inAchievementSection && line.length >= 10 && line.length <= 200) ||
        (!inAchievementSection && indicatorKeywords.some(k => lower.includes(k)) && line.length >= 15 && line.length <= 200)) {
      achievements.push({
        title: line.replace(/^[•\-\*]\s*/, '').trim(),
        type: classifyAchievementType(line)
      });
    }
  }

  return achievements.slice(0, 10);
}

function matchProjectsWithGitHub(projects, githubLinks) {
  return (projects || []).map(project => {
    const matched = (githubLinks || []).find(link => {
      const repo = link.split('/').pop().toLowerCase();
      const projClean = project.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return repo && projClean && (repo.includes(projClean) || projClean.includes(repo));
    });

    return {
      ...project,
      githubUrl: matched || project.githubUrl || ''
    };
  });
}

module.exports = {
  SKILLS_KEYWORDS,
  extractSkills,
  extractGitHubLinks,
  extractProjects,
  extractAchievements,
  classifyAchievementType,
  matchProjectsWithGitHub
};
