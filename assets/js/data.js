/* =========================================================================
   Site content. Edit this file to update the portfolio; markup is generated
   from it. Only verified facts live here (resume + the GitHub repositories).
   ========================================================================= */
window.SITE = {
  personal: {
    name: "Ankit Satapathy",
    email: "ankitsatapathy2006@gmail.com",
    phone: "+91 7373606020",
    linkedin: "https://linkedin.com/in/ankit-satapathy",
    github: "https://github.com/ankitsatapathy26k24",
    resume: "assets/Ankit_Satapathy_Resume.pdf",
    roles: ["Developer", "Cybersecurity Enthusiast", "Problem Solver", "Technology Explorer"]
  },

  /* Contact form. The form POSTs JSON to this endpoint. On Vercel the bundled
     serverless function at /api/contact sends mail via Resend (see README).
     Leave it as-is; if the function isn't configured the form says so honestly. */
  contact: { endpoint: "/api/contact", minSecondsOnPage: 3 },

  skills: [
    { id: "dev", label: "Development", items: [
      { name: "Python", tag: "Language", mono: "Py", hue: ["#3776AB", "#2B5B84"] },
      { name: "HTML", tag: "Markup", mono: "<>", hue: ["#E44D26", "#C23A16"] },
      { name: "CSS", tag: "Styling", mono: "{}", hue: ["#2965F1", "#7455DC"] },
      { name: "JavaScript", tag: "Language", mono: "JS", hue: ["#D9B400", "#B08A00"] },
      { name: "Web Technologies", tag: "Platform", icon: "i-globe", hue: ["#0EA5B7", "#2764E7"] }
    ]},
    { id: "sec", label: "Cybersecurity", items: [
      { name: "Network Security Fundamentals", tag: "Defence", icon: "i-shield", hue: ["#2764E7", "#7455DC"] },
      { name: "Ethical Hacking Fundamentals", tag: "Offence", icon: "i-terminal", hue: ["#7455DC", "#B04CD8"] },
      { name: "Linux", tag: "Operating system", mono: "$_", hue: ["#1F2937", "#475569"] },
      { name: "Web Bug Bounty Fundamentals", tag: "Web security", icon: "i-bug", hue: ["#DC4C64", "#B83280"] },
      { name: "Computer Networking", tag: "Infrastructure", icon: "i-network", hue: ["#0E9F8E", "#0B86A8"] }
    ]},
    { id: "other", label: "Other areas", items: [
      { name: "Natural Language Processing", tag: "AI / ML", icon: "i-brain", hue: ["#9066FF", "#3987FF"] },
      { name: "Problem Solving", tag: "Approach", icon: "i-puzzle", hue: ["#E07B39", "#D9480F"] },
      { name: "Technical Communication", tag: "Writing & speaking", icon: "i-chat", hue: ["#2764E7", "#0B86A8"] },
      { name: "Team Collaboration", tag: "Teamwork", icon: "i-users", hue: ["#138A5B", "#0E9F8E"] }
    ]}
  ],

  projects: [
    {
      id: "netvuln",
      featured: true,
      name: "NetVuln Scanner",
      category: "Cybersecurity / Network Security",
      thumb: "network",
      summary: "A network vulnerability scanning platform built to discover network assets, identify potential security vulnerabilities, and present security findings through an interactive dashboard.",
      tech: ["React", "TypeScript", "Python", "FastAPI", "Nmap", "Supabase", "Redis", "Celery"],
      features: [
        "Network discovery and mapping across subnets using Nmap",
        "Vulnerability detection with CVE references and CVSS scores (Nmap NSE scripts)",
        "Six scan types: Quick, Full, Vulnerability, Stealth, Service Detection, OS Detection",
        "Report export in PDF, CSV and JSON",
        "Role-based access control with Admin, Analyst and Viewer roles",
        "Scheduled, recurring scans",
        "Interactive dashboard for monitoring and statistics"
      ],
      architecture: [
        ["Frontend", "React + TypeScript (Vite, Tailwind CSS)"],
        ["API", "Python FastAPI with authentication and RBAC"],
        ["Background jobs", "Celery workers with a Redis queue"],
        ["Data & auth", "Supabase"],
        ["Scanner", "Nmap module with NSE scripts"]
      ],
      github: "https://github.com/ankitsatapathy26k24/netvuln-scanner",
      demo: "https://netvuln-scanner.vercel.app",
      screenshots: [] /* add real screenshot paths here, e.g. "assets/project-images/netvuln-dashboard.webp" */
    },
    {
      id: "calculator",
      name: "Simple Calculator",
      category: "Web Development",
      thumb: "calculator",
      summary: "A simple calculator application demonstrating practical implementation of basic mathematical operations through a user-friendly interface.",
      tech: ["HTML", "CSS", "JavaScript"],
      features: [
        "Addition, subtraction, multiplication and division",
        "Decimal input and a clear (C) key",
        "Expression display that builds as you type",
        "Error state for invalid expressions",
        "Vanilla JavaScript with no frameworks or build step"
      ],
      architecture: [
        ["Structure", "index.html: display plus a 4-column keypad"],
        ["Styling", "styles.css"],
        ["Logic", "script.js: appendNumber, appendOperator, calculateResult, clearResult"]
      ],
      github: "https://github.com/ankitsatapathy26k24/simple-calculator",
      demo: "",
      screenshots: []
    },
    {
      id: "career",
      name: "Personalised Career Guidance System",
      category: "Application Development",
      thumb: "career",
      summary: "A personalised career guidance platform designed to convert individual user inputs into tailored career recommendations.",
      tech: [],
      features: ["User-focused design", "Personalised recommendations", "Intuitive interface", "Accessible user experience"],
      architecture: [],
      github: "", /* add the repository URL when it is public */
      demo: "",   /* add the live URL when deployed */
      screenshots: []
    }
  ],

  experience: [
    {
      role: "NLP Intern",
      org: "Accent Techno Soft",
      start: "24 June 2026",
      end: "10 July 2026",
      description: "Completed an internship in Natural Language Processing at Accent Techno Soft.",
      details: [] /* add verified responsibilities or outcomes here later */
    }
  ],

  education: [
    { title: "B.Sc. Computer Technology", place: "KPR College of Arts, Science and Research, Coimbatore", when: "Pursuing", current: true },
    { title: "12th Grade", place: "Amrita Vidyalayam Senior Secondary School, Tiruppur", when: "Completed 2024" },
    { title: "10th Grade", place: "Amrita Vidyalayam Senior Secondary School, Tiruppur", when: "Completed 2022" }
  ],

  certifications: [
    { title: "Cybersecurity & Ethical Hacking (48 Hours)", issuer: "Cappriciosec University", icon: "i-shield", url: "" },
    { title: "Linux & Web Bug Bounty Bootcamp", issuer: "Cappriciosec University", icon: "i-bug", url: "" },
    { title: "Python for Data Science", issuer: "NPTEL", icon: "i-code", url: "" },
    { title: "Introduction to Computer Networking", issuer: "Simplilearn", icon: "i-network", url: "" }
  ],

  achievements: [
    { icon: "i-crown", title: "Department President", years: "2025–2026\n2026–2027",
      points: ["Team management", "Leadership and coordination", "Organizational initiatives"] },
    { icon: "i-calendar", title: "Event Organization", years: "Intra-collegiate", events: ["Apex '26", "Code Rush"],
      points: ["Planning", "Coordination", "Execution of intra-collegiate events"] },
    { icon: "i-trophy", title: "Competition Achievements", years: "Awards",
      points: ["<strong>Runner-up</strong>, short film competition at NGP Arts and Science College, among 60+ teams",
               "<strong>Third Prize</strong> at Hindustan College of Arts and Science"] }
  ],

  languages: [
    { name: "Odia", level: "Native" }, { name: "English", level: "" },
    { name: "Tamil", level: "" }, { name: "Hindi", level: "" }
  ],

  softSkills: ["Leadership", "Communication", "Problem Solving", "Team Collaboration", "Public Presentation", "Event Management", "Stakeholder Coordination"]
};
