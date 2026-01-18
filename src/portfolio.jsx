import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Moon, Sun, Github, Linkedin, Mail, ExternalLink, MapPin, Clock, CheckCircle2, Code2, Database, Layout, Server, Smartphone, GitBranch } from 'lucide-react';
// Theme Context
const ThemeContext = createContext();
const LEVEL_MAP = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};
const GITHUB_COLORS = {
  0: '#e5e7eb', // gray (no contributions)
  4: '#0e4429',
  3: '#006d32',
  2: '#26a641',
  1: '#39d353',
};
const GITHUB_USERNAME = 'mrshyspy';

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  const [weeks, setWeeks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const stored = localStorage.getItem('theme');
  //   if (stored) setTheme(stored);
  // }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) setTheme(stored);
    const fetchContributions = async () => {
      try {
        const query = `
          query {
            user(login: "${GITHUB_USERNAME}") {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks {
                    firstDay
                    contributionDays {
                      date
                      contributionCount
                      contributionLevel
                    }
                  }
                }
              }
            }
          }
        `;

        const res = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        const json = await res.json();
        const calendar =
          json.data.user.contributionsCollection.contributionCalendar;

        setWeeks(calendar.weeks);
        setTotal(calendar.totalContributions);
        setLoading(false);
      } catch (err) {
        console.error('GitHub fetch error:', err);
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// Animation Variants - Apple-like: fast, subtle, intentional
const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1] // Custom bezier for Apple-like motion
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const hoverLift = {
  rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  hover: {
    y: -2,
    boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
    transition: {
      duration: 0.15,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Scroll Reveal Component
const ScrollReveal = ({ children, delay = 0 }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.3,
            delay,
            ease: [0.25, 0.1, 0.25, 1]
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

// Navbar Component
const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className={`fixed top-0 w-full z-50 transition-colors duration-200 ${theme === 'dark'
      ? 'bg-zinc-950/80 border-zinc-800'
      : 'bg-zinc-50/80 border-zinc-200'
      } backdrop-blur-xl border-b`}>
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {['Home', 'Projects', 'Blog'].map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`font-mono text-sm relative group ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                }`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.05,
                duration: 0.2,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              whileHover={{ y: -1 }}
            >
              {item}
              <motion.span
                className={`absolute -bottom-1 left-0 h-px ${theme === 'dark' ? 'bg-zinc-300' : 'bg-zinc-700'
                  }`}
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </motion.a>
          ))}
        </div>

        <motion.button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors duration-200 ${theme === 'dark'
            ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            : 'bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.div
            animate={{ rotate: theme === 'dark' ? 180 : 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </motion.div>
        </motion.button>
      </div>
    </nav>
  );
};

// Hero Component
const Hero = () => {
  const { theme } = useTheme();

  return (
    <section className="pt-32 pb-20 px-6 relative overflow-hidden">
      <motion.div
        className={`absolute top-20 left-1/2 -translate-x-1/2 text-[280px] leading-none font-mono font-bold pointer-events-none select-none ${theme === 'dark' ? 'text-zinc-900/5' : 'text-zinc-200/50'
          }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        改善
      </motion.div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          className="flex flex-col md:flex-row items-center gap-12"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeInUp} className="flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
              alt="Profile"
              className={`w-44 h-44 rounded-full border-4 ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
                }`}
            />
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <motion.div variants={fadeInUp} className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <h1 className={`text-5xl md:text-6xl font-mono font-bold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                }`}>
                Sohil Khan              </h1>
              <CheckCircle2 className="text-blue-500 flex-shrink-0" size={28} />
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className={`text-base font-mono mb-6 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                }`}
            >
              23 · Engineer · Developer · Builder
            </motion.p>

            <motion.div variants={fadeInUp} className="flex items-center justify-center md:justify-start gap-3 mb-8">
              <motion.a
                href="mailto:vedant@example.com"
                className={`p-2.5 rounded-lg transition-colors duration-200 ${theme === 'dark'
                  ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100'
                  }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Mail size={20} />
              </motion.a>

              <motion.a
                href="https://github.com"
                className={`p-2.5 rounded-lg transition-colors duration-200 ${theme === 'dark'
                  ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100'
                  }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Github size={20} />
              </motion.a>

              <motion.a
                href="https://linkedin.com"
                className={`p-2.5 rounded-lg transition-colors duration-200 ${theme === 'dark'
                  ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100'
                  }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Linkedin size={20} />
              </motion.a>

              <motion.a
                href="#"
                className={`p-2.5 rounded-lg transition-colors duration-200 ${theme === 'dark'
                  ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100'
                  }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.66 4.25a1 1 0 0 0-1.41 0l-1.5 1.5a1 1 0 0 0 0 1.41l.71.71-6.88 6.88a1 1 0 0 1-.7.29H9a1 1 0 0 1-1-1v-2.88a1 1 0 0 1 .29-.7l6.88-6.88.71.71a1 1 0 0 0 1.41 0l1.5-1.5a1 1 0 0 0 0-1.41l-2-2a1 1 0 0 0-1.41 0l-1.5 1.5a1 1 0 0 0 0 1.41l.71.71-6.88 6.88A3 3 0 0 0 7 11.12V14a3 3 0 0 0 3 3h2.88a3 3 0 0 0 2.12-.88l6.88-6.88.71.71a1 1 0 0 0 1.41 0l1.5-1.5a1 1 0 0 0 0-1.41z" />
                </svg>
              </motion.a>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className={`text-sm leading-relaxed font-mono ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                }`}
            >
              Passionate full-stack developer with 6+ years of experience building scalable web applications.
              Specialized in React, Node.js, and cloud architecture. I turn complex problems into elegant solutions
              and love working with teams that push the boundaries of what's possible.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Work Experience Component
const WorkExperience = () => {
  const { theme } = useTheme();

  const experiences = [
    {
      company: 'TechCorp',
      logo: 'TC',
      role: 'Senior Full Stack Engineer',
      period: '2022 - Present',
      responsibilities: [
        'Led development of microservices architecture serving 2M+ users',
        'Reduced API response time by 60% through optimization',
        'Mentored team of 5 junior developers'
      ]
    },
    {
      company: 'StartupXYZ',
      logo: 'SX',
      role: 'Frontend Developer',
      period: '2020 - 2022',
      responsibilities: [
        'Built responsive web apps using React and TypeScript',
        'Implemented design system used across 12+ products',
        'Improved lighthouse scores from 65 to 95+'
      ]
    },
    {
      company: 'Digital Agency',
      logo: 'DA',
      role: 'Junior Developer',
      period: '2019 - 2020',
      responsibilities: [
        'Developed client websites using modern JavaScript frameworks',
        'Collaborated with designers to implement pixel-perfect UIs',
        'Maintained and optimized existing codebases'
      ]
    }
  ];

  return (
    <section className="py-20 px-6 relative">
      <div className={`absolute inset-0 opacity-30 ${theme === 'dark' ? 'bg-zinc-900/20' : 'bg-zinc-100/30'
        }`} style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }} />
      <div className="max-w-4xl mx-auto relative z-10">
        <ScrollReveal>
          <h2 className={`text-3xl font-mono font-bold mb-12 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
            }`}>
            Work Experience
          </h2>
        </ScrollReveal>

        <div className="space-y-8">
          {experiences.map((exp, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <div className={`p-6 rounded-xl border transition-colors duration-200 ${theme === 'dark'
                ? 'bg-zinc-900/50 border-zinc-800'
                : 'bg-white border-zinc-200'
                }`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${theme === 'dark'
                    ? 'bg-zinc-800 text-zinc-300'
                    : 'bg-zinc-100 text-zinc-700'
                    }`}>
                    {exp.logo}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className={`text-xl font-mono font-semibold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                          }`}>
                          {exp.role}
                        </h3>
                        <p className={`text-sm font-mono ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                          }`}>
                          {exp.company}
                        </p>
                      </div>
                      <span className={`text-sm font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                        }`}>
                        {exp.period}
                      </span>
                    </div>

                    <ul className="space-y-2 mt-4">
                      {exp.responsibilities.map((resp, j) => (
                        <li key={j} className={`text-sm font-mono flex items-start gap-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                          }`}>
                          <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${theme === 'dark' ? 'bg-zinc-600' : 'bg-zinc-400'
                            }`} />
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// Projects Component
const Projects = () => {
  const { theme } = useTheme();

  const projects = [
    {
      name: 'Cloud Dashboard',
      description: 'Real-time analytics platform with custom data visualization. Built for enterprise clients handling 100K+ daily active users.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
      tech: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
      live: '#',
      github: '#'
    },
    {
      name: 'AI Content Generator',
      description: 'SaaS application leveraging GPT-4 for automated content creation. Integrated payment processing and user management.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
      tech: ['Next.js', 'OpenAI', 'Stripe', 'Prisma'],
      live: '#',
      github: '#'
    },
    {
      name: 'E-commerce Platform',
      description: 'Full-featured online store with inventory management, order tracking, and admin dashboard. Optimized for mobile commerce.',
      image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=400&fit=crop',
      tech: ['Vue.js', 'Express', 'MongoDB', 'AWS'],
      live: '#',
      github: '#'
    }
  ];

  return (
    <section className="py-20 px-6" id="projects">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <h2 className={`text-3xl font-mono font-bold mb-12 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
            }`}>
            Featured Projects
          </h2>
        </ScrollReveal>

        <div className="grid gap-8">
          {projects.map((project, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <motion.div
                className={`rounded-xl border overflow-hidden transition-colors duration-200 ${theme === 'dark'
                  ? 'bg-zinc-900/50 border-zinc-800'
                  : 'bg-white border-zinc-200'
                  }`}
                variants={hoverLift}
                initial="rest"
                whileHover="hover"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="overflow-hidden">
                    <motion.img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-64 object-cover"
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                  </div>

                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <h3 className={`text-2xl font-mono font-bold mb-3 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                        }`}>
                        {project.name}
                      </h3>
                      <p className={`text-sm font-mono mb-4 leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                        }`}>
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.tech.map((tech, j) => (
                          <span
                            key={j}
                            className={`px-3 py-1 rounded-full text-xs font-mono ${theme === 'dark'
                              ? 'bg-zinc-800 text-zinc-300'
                              : 'bg-zinc-100 text-zinc-700'
                              }`}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <motion.a
                        href={project.live}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors duration-200 ${theme === 'dark'
                          ? 'bg-zinc-100 text-zinc-900 hover:bg-white'
                          : 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800'
                          }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <span>Live Demo</span>
                        <motion.div
                          whileHover={{ x: 1 }}
                          transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                          <ExternalLink size={14} />
                        </motion.div>
                      </motion.a>

                      <motion.a
                        href={project.github}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm border transition-colors duration-200 ${theme === 'dark'
                          ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                          : 'border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                          }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Github size={14} />
                        <span>Code</span>
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};



const GitHubActivity = () => {
  const { theme } = useTheme();
  const [weeks, setWeeks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const query = `
          query {
            user(login: "${GITHUB_USERNAME}") {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks {
                    firstDay
                    contributionDays {
                      date
                      contributionCount
                      contributionLevel
                    }
                  }
                }
              }
            }
          }
        `;

        const res = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        const json = await res.json();
        const calendar =
          json.data.user.contributionsCollection.contributionCalendar;

        setWeeks(calendar.weeks);
        setTotal(calendar.totalContributions);
        setLoading(false);
      } catch (err) {
        console.error('GitHub fetch error:', err);
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  return (
    <section className="py-20 px-6 relative">
      {/* Grain Background */}
      <div
        className={`absolute inset-0 pointer-events-none opacity-30 ${theme === 'dark' ? 'bg-zinc-900/20' : 'bg-zinc-100/30'
          }`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.3' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '160px 160px',
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <ScrollReveal>
          <h2
            className={`text-3xl font-mono font-bold mb-8 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
              }`}
          >
            GitHub Activity
          </h2>

          <div
            className={`p-8 rounded-xl border ${theme === 'dark'
              ? 'bg-zinc-900/50 border-zinc-800'
              : 'bg-white border-zinc-200'
              }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <p
                className={`font-mono text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                  }`}
              >
                {loading
                  ? 'Loading…'
                  : `${total} contributions in the last year`}
              </p>

              <a
                href={`https://github.com/${GITHUB_USERNAME}`}
                target="_blank"
                rel="noreferrer"
                className={`font-mono text-sm flex items-center gap-2 hover:underline ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                  }`}
              >
                <GitBranch size={16} />
                @{GITHUB_USERNAME}
              </a>
            </div>

            {/* Graph */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-current" />
              </div>
            ) : (
              <div className="overflow-x-auto">
  <div className="w-full">
    <div className="grid grid-flow-col auto-cols-fr gap-[6px]">
      {weeks.map((week) => (
        <div
          key={week.firstDay}
          className="grid grid-rows-7 gap-[6px]"
        >
          {week.contributionDays.map((day) => {
            const level = LEVEL_MAP[day.contributionLevel];

            return (
              <motion.div
                key={day.date}
                className="aspect-square rounded-sm border border-black/5 dark:border-white/5"
                style={{
                  backgroundColor: GITHUB_COLORS[level],
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                title={`${day.date}: ${day.contributionCount} contributions`}
              />
            );
          })}
        </div>
      ))}
    </div>
  </div>
</div>


            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};


const Skills = () => {
  const { theme } = useTheme();

  const skillCategories = [
    {
      title: 'Frontend',
      skills: [
        { name: 'React.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
        { name: 'Tailwind CSS', icon: 'https://www.svgrepo.com/show/374118/tailwind.svg' },
        { name: 'HTML', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
        { name: 'CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
        { name: 'Redux Toolkit', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg' }
      ]
    },
    {
      title: 'Backend',
      skills: [
        { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
        { name: 'Express.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg' },
        { name: 'MongoDB (Mongoose)', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
        { name: 'PostgreSQL (Prisma)', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
        { name: 'Redis', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg' },
        { name: 'Kafka', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachekafka/apachekafka-original.svg' },
        { name: 'Elasticsearch', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/elasticsearch/elasticsearch-original.svg' },
        { name: 'REST APIs', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg' },
        { name: 'WebSockets (Socket.IO)', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg' }
      ]
    },
    {
      title: 'DevOps & Cloud',
      skills: [
        { name: 'AWS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg' },
        { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
        { name: 'Kubernetes', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg' },
        { name: 'CI/CD fundamentals', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/githubactions/githubactions-original.svg' },
        { name: 'Cloud Deployment (Netlify, Render)', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/netlify/netlify-original.svg' }
      ]
    },
    {
      title: 'Tools',
      skills: [
        { name: 'Git', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
        { name: 'GitHub', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
        { name: 'Postman', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg' },
        { name: 'VS Code', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg' },
        { name: 'IntelliJ IDEA', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/intellij/intellij-original.svg' }
      ]
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className={`text-3xl font-mono font-bold mb-12 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
            }`}>
            Skills & Technologies
          </h2>
        </ScrollReveal>

        <div className="space-y-8">
          {skillCategories.map((category, catIndex) => (
            <ScrollReveal key={category.title} delay={catIndex * 0.05}>
              <div>
                <h3 className={`text-xl font-mono font-semibold mb-4 ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'
                  }`}>
                  {category.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, i) => (
                    <motion.div
                      key={skill.name}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-sm transition-colors duration-200 ${theme === 'dark'
                        ? 'bg-zinc-900/50 border-zinc-800 text-zinc-300'
                        : 'bg-white border-zinc-200 text-zinc-700'
                        }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: catIndex * 0.1 + i * 0.02,
                        duration: 0.2,
                        ease: [0.25, 0.1, 0.25, 1]
                      }}
                      whileHover={{ scale: 1.03, y: -1 }}
                    >
                      <img
                        src={skill.icon}
                        alt={skill.name}
                        className="w-4 h-4 object-contain"
                        style={{ filter: theme === 'dark' && skill.name === 'Express.js' ? 'invert(1)' : 'none' }}
                      />
                      <span>{skill.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Component
const CallToAction = () => {
  const { theme } = useTheme();

  return (
    <section className="py-20 px-6 relative">
      <div className={`absolute inset-0 opacity-30 ${theme === 'dark' ? 'bg-zinc-900/20' : 'bg-zinc-100/30'
        }`} style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }} />
      <div className="max-w-3xl mx-auto relative z-10">
        <ScrollReveal>
          <div className={`p-12 rounded-xl border text-center ${theme === 'dark'
            ? 'bg-zinc-900/50 border-zinc-800'
            : 'bg-white border-zinc-200'
            }`}>
            <h2 className={`text-4xl font-mono font-bold mb-4 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
              }`}>
              Let's Work Together
            </h2>
            <p className={`text-base font-mono mb-8 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
              Available for freelance projects and full-time opportunities
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.a
                href="mailto:alex@example.com"
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-mono transition-colors duration-200 ${theme === 'dark'
                  ? 'bg-zinc-100 text-zinc-900 hover:bg-white'
                  : 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Mail size={18} />
                <span>Send Email</span>
              </motion.a>

              <motion.a
                href="#"
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-mono border transition-colors duration-200 ${theme === 'dark'
                  ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  : 'border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <span>Book a Call</span>
                <motion.div
                  whileHover={{ x: 1 }}
                  transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <ExternalLink size={18} />
                </motion.div>
              </motion.a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  const { theme } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className={`py-12 px-6 border-t relative ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
      }`}>
      <div className={`absolute inset-0 opacity-20 ${theme === 'dark' ? 'bg-zinc-900/10' : 'bg-zinc-100/20'
        }`} style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }} />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={`font-mono text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
            Built with React, Tailwind & Framer Motion
          </p>

          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 font-mono text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
              <MapPin size={14} />
              <span>San Francisco, CA</span>
            </div>

            <div className={`flex items-center gap-2 font-mono text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
              <Clock size={14} />
              <span>{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div className={`font-mono text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
              👁 {Math.floor(Math.random() * 1000) + 500} visitors
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
function Portfolio() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-200 font-mono relative ${theme === 'dark'
      ? 'bg-zinc-950 text-zinc-100'
      : 'bg-zinc-50 text-zinc-900'
      }`}>
      <div className={`fixed inset-0 opacity-[0.015] pointer-events-none ${theme === 'dark' ? 'opacity-[0.02]' : 'opacity-[0.015]'
        }`} style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }} />
      <Navbar />
      <Hero />
      <WorkExperience />
      <Projects />
      <GitHubActivity />
      <Skills />
      <CallToAction />
      <Footer />
    </div>
  );
}

// Wrap with the Theme Provider
export default function App() {
  return (
    <ThemeProvider>
      <Portfolio />
    </ThemeProvider>
  );
}