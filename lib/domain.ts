export const roles = ['Student', 'Industry', 'Faculty', 'Institution'] as const;
export type Role = (typeof roles)[number];
export const skills = [
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'SQL',
  'Data Analysis',
  'Communication',
  'Teamwork',
  'Research',
  'Problem Solving',
];
export const careers: Record<string, string[]> = {
  'Web Development': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
  'Data Analytics': ['Python', 'SQL', 'Data Analysis', 'Communication'],
  'Software Engineering': ['JavaScript', 'Python', 'SQL', 'Problem Solving'],
  'Research & Teaching': ['Research', 'Python', 'Communication', 'Teamwork'],
};
export function matchSkills(have: string[], required: string[]) {
  const norm = (s: string) => s.trim().toLowerCase();
  const owned = new Set(have.map(norm));
  const unique = [
    ...new Map(
      required.filter((s) => s.trim()).map((s) => [norm(s), s]),
    ).values(),
  ];
  const missing = unique.filter((s) => !owned.has(norm(s)));
  return {
    score: unique.length
      ? Math.round(((unique.length - missing.length) / unique.length) * 100)
      : null,
    missing,
  };
}
export const questions = [
  {
    skill: 'HTML',
    q: 'Which element represents the main navigation links?',
    options: ['<nav>', '<style>', '<meta>'],
  },
  {
    skill: 'CSS',
    q: 'Which property creates space inside an element border?',
    options: ['margin', 'padding', 'position'],
  },
  {
    skill: 'JavaScript',
    q: 'Which method transforms every item in an array?',
    options: ['find()', 'push()', 'map()'],
  },
  {
    skill: 'React',
    q: 'Which hook manages local component state?',
    options: ['useState', 'usePath', 'useStyle'],
  },
  {
    skill: 'Node.js',
    q: 'What is Node.js primarily used for?',
    options: [
      'Only browser styling',
      'Running JavaScript outside the browser',
      'Designing SQL tables',
    ],
  },
  {
    skill: 'Python',
    q: 'Which Python type holds unique values?',
    options: ['list', 'tuple', 'set'],
  },
  {
    skill: 'SQL',
    q: 'Which clause filters rows before grouping?',
    options: ['WHERE', 'ORDER BY', 'LIMIT'],
  },
  {
    skill: 'Data Analysis',
    q: 'Which measure is less affected by extreme outliers?',
    options: ['Mean', 'Median', 'Maximum'],
  },
  {
    skill: 'Communication',
    q: 'A requirement is unclear. What is the best first step?',
    options: [
      'Assume and proceed',
      'Ignore it',
      'Ask specific clarifying questions',
    ],
  },
  {
    skill: 'Teamwork',
    q: 'A teammate is blocked. What should you do?',
    options: [
      'Understand the blocker and offer help',
      'Wait until the deadline',
      'Take credit for their work',
    ],
  },
  {
    skill: 'Research',
    q: 'What strengthens a research claim?',
    options: [
      'Popularity',
      'Reproducible evidence and cited sources',
      'A confident tone',
    ],
  },
  {
    skill: 'Problem Solving',
    q: 'A task takes 4 people 6 days. At equal rates, 8 people need:',
    options: ['12 days', '6 days', '3 days'],
  },
];
export const opportunities = [
  {
    id: 'nexa-frontend',
    title: 'Frontend Developer Intern',
    company: 'Nexa Labs',
    type: 'Internship',
    audience: 'Student',
    location: 'Bengaluru · Hybrid',
    pay: '₹18,000 / month',
    duration: '3 months',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    description:
      'Build accessible interfaces with a product team. Work on real components, take part in code reviews, and learn from a dedicated engineering mentor.',
  },
  {
    id: 'pixel-fullstack',
    title: 'Full Stack Development Intern',
    company: 'PixelWorks',
    type: 'Internship',
    audience: 'Student',
    location: 'Remote',
    pay: '₹22,000 / month',
    duration: '6 months',
    skills: ['JavaScript', 'React', 'Node.js', 'SQL'],
    description:
      'Contribute to web applications across frontend and backend. Collaborate with designers and ship a feature from idea to release.',
  },
  {
    id: 'vertex-graduate',
    title: 'Graduate Software Engineer',
    company: 'Vertex Systems',
    type: 'Job',
    audience: 'Student',
    location: 'Pune · On-site',
    pay: '₹6–8 LPA',
    duration: 'Full-time',
    skills: ['JavaScript', 'SQL', 'Problem Solving', 'Teamwork'],
    description:
      'An entry-level engineering role for curious graduates. Practice problem solving with a cross-functional delivery team.',
  },
  {
    id: 'data-analyst',
    title: 'Data Analytics Intern',
    company: 'Insight Collective',
    type: 'Internship',
    audience: 'Student',
    location: 'Hyderabad · Hybrid',
    pay: '₹20,000 / month',
    duration: '4 months',
    skills: ['Python', 'SQL', 'Data Analysis', 'Communication'],
    description:
      'Prepare datasets, explore trends, and explain findings to stakeholders.',
  },
  {
    id: 'live-project',
    title: 'Campus Sustainability Dashboard',
    company: 'GreenGrid',
    type: 'Live Project',
    audience: 'Student',
    location: 'Remote',
    pay: 'Project certificate',
    duration: '6 weeks',
    skills: ['HTML', 'CSS', 'JavaScript', 'Teamwork'],
    description:
      'Prototype a campus energy dashboard with weekly mentor feedback.',
  },
  {
    id: 'faculty-fdp',
    title: 'Applied Data Science FDP',
    company: 'Insight Collective',
    type: 'FDP',
    audience: 'Faculty',
    location: 'Remote',
    pay: 'No program fee',
    duration: '2 weeks',
    skills: ['Python', 'Data Analysis', 'Research'],
    description:
      'Explore industry datasets and practical teaching modules in a faculty development program.',
  },
  {
    id: 'faculty-intern',
    title: 'Industry Immersion for Faculty',
    company: 'Nexa Labs',
    type: 'Faculty Internship',
    audience: 'Faculty',
    location: 'Bengaluru · Hybrid',
    pay: 'Sponsored training',
    duration: '4 weeks',
    skills: ['Research', 'Communication', 'JavaScript'],
    description:
      'Join an engineering team and bring current industry methods back to the classroom.',
  },
  {
    id: 'research',
    title: 'Responsible Technology Research',
    company: 'Vertex Systems',
    type: 'Research',
    audience: 'Faculty',
    location: 'Remote',
    pay: 'Proposal-based funding',
    duration: '12 weeks',
    skills: ['Research', 'Python', 'Communication'],
    description: 'Develop a joint research proposal with industry mentors.',
  },
  {
    id: 'consultancy',
    title: 'Curriculum & Analytics Consultancy',
    company: 'GreenGrid',
    type: 'Consultancy',
    audience: 'Faculty',
    location: 'Remote',
    pay: 'Scope-based honorarium',
    duration: '6 weeks',
    skills: ['Research', 'Data Analysis', 'Communication'],
    description:
      'Advise an industry learning team on competency mapping and curriculum design.',
  },
].map((o) => ({ ...o, approved: true, demo: true, deadline: '2026-12-31' }));
export const programs = [
  {
    id: 'react',
    title: 'React: from components to applications',
    provider: 'React documentation',
    skill: 'React',
    kind: 'Learning path',
    duration: 'Self-paced',
    url: 'https://react.dev/learn',
  },
  {
    id: 'node',
    title: 'Build your first backend with Node.js',
    provider: 'Node.js Learn',
    skill: 'Node.js',
    kind: 'Learning path',
    duration: 'Self-paced',
    url: 'https://nodejs.org/en/learn',
  },
  {
    id: 'python',
    title: 'Python foundations for data and research',
    provider: 'Python documentation',
    skill: 'Python',
    kind: 'Learning path',
    duration: 'Self-paced',
    url: 'https://docs.python.org/3/tutorial/',
  },
  {
    id: 'web',
    title: 'The modern web development toolkit',
    provider: 'MDN Web Docs',
    skill: 'JavaScript',
    kind: 'Learning path',
    duration: 'Self-paced',
    url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development',
  },
  {
    id: 'mentor',
    title: 'Engineering career circle',
    provider: 'Nexa Labs · Demo',
    skill: 'Communication',
    kind: 'Mentorship',
    duration: '4 weekly sessions',
    url: '',
  },
  {
    id: 'workshop',
    title: 'From classroom to product team',
    provider: 'PixelWorks · Demo',
    skill: 'Teamwork',
    kind: 'Workshop',
    duration: '2-hour session',
    url: '',
  },
];
export const defaultProfile = {
  name: 'Alex Morgan',
  institution: 'Your institution',
  degree: 'B.Tech · Computer Science',
  year: '2027',
  career: 'Web Development',
  skills: ['HTML', 'CSS', 'JavaScript', 'Teamwork'],
  bio: 'Aspiring developer building thoughtful web experiences.',
  assessment: null,
};
