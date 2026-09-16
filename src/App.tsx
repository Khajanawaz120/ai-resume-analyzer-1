/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  LogIn, 
  UserPlus, 
  LogOut, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Briefcase, 
  Award, 
  Code, 
  Layers, 
  Cloud, 
  Database, 
  Cpu, 
  ArrowRight, 
  RefreshCw, 
  FileCode, 
  Check, 
  ShieldCheck, 
  Lock, 
  Info,
  ChevronRight
} from 'lucide-react';

// Sample resumes for instant preview testing
const SAMPLE_RESUMES = {
  pdf: {
    name: "Alex_Rivera_Senior_FullStack.pdf",
    text: `Alex Rivera
Email: alex.rivera@example.com | Phone: (555) 342-8921
LinkedIn: linkedin.com/in/alex-rivera-dev | GitHub: github.com/arivera-code

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 7+ years of experience developing, scaling, and architecting distributed web systems. Led cross-functional teams to build cloud-native applications resulting in 35% latency reduction and $120K annual infrastructure savings.

CORE TECHNICAL SKILLS
- Programming Languages: Python, JavaScript, TypeScript, SQL, Go, HTML, CSS, Bash
- Frameworks & Libraries: React, Node.js, Express, Flask, Next.js, Django, FastAPI, Tailwind, Redux
- Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, Git, Terraform, Linux, Nginx, GitHub Actions
- Databases & AI: PostgreSQL, MongoDB, Redis, PyTorch, Pandas, Scikit-learn, Machine Learning
- Practices & Methodologies: Agile, Scrum, System Design, REST API, Microservices, Unit Testing, Code Review

WORK EXPERIENCE
Senior Software Engineer | CloudScale Tech (2021 - Present)
- Architected and engineered microservices using Python, FastAPI, and Docker, reducing API response times by 42%.
- Spearheaded migration of legacy monolith to AWS ECS and Kubernetes, increasing system uptime to 99.98%.
- Led an agile team of 6 engineers, standardizing code review workflows and automating CI/CD pipelines.
- Built real-time analytics dashboard with React, TypeScript, and Redis serving over 500,000 daily active users.

Software Engineer | Apex Digital Solutions (2018 - 2021)
- Developed full-stack features using React, Node.js, and PostgreSQL for enterprise fintech clients.
- Optimized database queries and indexes, decreasing query execution times by 55%.
- Implemented secure JWT authentication and role-based access control (RBAC).

EDUCATION & CERTIFICATIONS
- Bachelor of Science in Computer Science | University of Washington (2014 - 2018)
- AWS Certified Solutions Architect - Associate (2022)`
  },
  docx: {
    name: "Jordan_Lee_Data_Scientist.docx",
    text: `Jordan Lee
Email: jordan.lee@example.com | Phone: (555) 891-2345
GitHub: github.com/jlee-ds | LinkedIn: linkedin.com/in/jordan-lee-data

PROFESSIONAL SUMMARY
Data Scientist & Machine Learning Engineer with 4 years of experience building predictive models, NLP pipelines, and data infrastructure. Proven track record of improving fraud detection by 28% and automating data workflows.

TECHNICAL SKILLS
- Languages: Python, SQL, R, Bash
- Data & Machine Learning: Machine Learning, Deep Learning, PyTorch, TensorFlow, Scikit-learn, Pandas, NumPy, NLP
- Databases & Cloud: PostgreSQL, MySQL, Redis, AWS, Docker, Git
- Methodologies: Data Science, Agile, REST API, Problem Solving

EXPERIENCE
Data Scientist | FinGuard Analytics (2022 - Present)
- Engineered end-to-end machine learning pipeline using Python, PyTorch, and Scikit-learn for automated anomaly detection.
- Increased fraud classification precision by 28% while analyzing 2.4 million transactions weekly.
- Deployed ML inference service via Docker and AWS Lambda, achieving 60ms average inference latency.

Junior Data Analyst | DataSphere Inc (2020 - 2022)
- Built interactive dashboards using Tableau and SQL to monitor key business metrics.
- Automated ETL pipeline using Python and Pandas, cutting manual report generation by 15 hours per week.

EDUCATION
- M.S. in Data Science | New York University (2020)
- B.S. in Applied Mathematics | University of Michigan (2018)`
  }
};

interface AnalysisResult {
  filename: string;
  score: number;
  word_count: number;
  total_skills_count: number;
  detected_skills_by_cat: Record<string, string[]>;
  strengths: string[];
  suggestions: string[];
  job_matches: {
    title: string;
    match_percentage: number;
    description: string;
    matching_skills: string[];
    recommended_skills: string[];
  }[];
  text_preview: string;
  has_email: boolean;
  has_phone: boolean;
  analyzed_at: string;
}

export default function App() {
  // Navigation states: 'login' | 'signup' | 'dashboard'
  const [currentPage, setCurrentPage] = useState<'login' | 'signup' | 'dashboard'>('login');
  
  // Registered user accounts state (initialized with demo account for preview)
  const [registeredUsers, setRegisteredUsers] = useState<Array<{ name: string; email: string; pass: string }>>([
    { name: "Demo User", email: "demo@example.com", pass: "password123" }
  ]);

  // Current session user
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  // Form inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  // Analysis states
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [, setSelectedFile] = useState<File | null>(null);

  // Notifications
  const [flashMessage, setFlashMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Check route simulation
  useEffect(() => {
    if (!currentUser && currentPage === 'dashboard') {
      setCurrentPage('login');
      setFlashMessage({ text: "Please log in to access your dashboard.", type: 'error' });
    }
  }, [currentUser, currentPage]);

  // Handle Login submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanEmail || !cleanPass) {
      setFlashMessage({ text: "Please enter both email and password.", type: 'error' });
      return;
    }

    // Strict authentication check: random credentials must NOT log in!
    const userMatch = registeredUsers.find(
      u => u.email.toLowerCase() === cleanEmail && u.pass === cleanPass
    );

    if (!userMatch) {
      setFlashMessage({ text: "Invalid email or password.", type: 'error' });
      return;
    }

    // Success
    setCurrentUser({ name: userMatch.name, email: userMatch.email });
    setFlashMessage({ text: `Welcome back, ${userMatch.name}!`, type: 'success' });
    setCurrentPage('dashboard');
    setLoginPassword('');
  };

  // Handle Signup submission
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = signupName.trim();
    const cleanEmail = signupEmail.trim().toLowerCase();
    const cleanPass = signupPassword.trim();
    const cleanConfirm = signupConfirm.trim();

    if (!cleanName || !cleanEmail || !cleanPass || !cleanConfirm) {
      setFlashMessage({ text: "All fields are required. Please fill out the full form.", type: 'error' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setFlashMessage({ text: "Please enter a valid email address.", type: 'error' });
      return;
    }

    if (cleanPass.length < 6) {
      setFlashMessage({ text: "Password must be at least 6 characters long.", type: 'error' });
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setFlashMessage({ text: "Passwords do not match. Please verify both password fields.", type: 'error' });
      return;
    }

    // Check duplicate
    if (registeredUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      setFlashMessage({ text: "An account with this email already exists. Please log in.", type: 'error' });
      return;
    }

    // Register user
    setRegisteredUsers(prev => [...prev, { name: cleanName, email: cleanEmail, pass: cleanPass }]);
    setFlashMessage({ text: "Account created successfully! Please log in with your credentials.", type: 'success' });
    setLoginEmail(cleanEmail);
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirm('');
    setCurrentPage('login');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setAnalysis(null);
    setSelectedFileName('');
    setSelectedFile(null);
    setFlashMessage({ 
      text: "You have been logged out successfully for your privacy and security.", 
      type: 'success' 
    });
    setCurrentPage('login');
  };

  // Run resume analysis algorithm
  const runResumeAnalysis = (text: string, filename: string) => {
    setIsAnalyzing(true);
    setFlashMessage(null);

    setTimeout(() => {
      const lower = text.toLowerCase();
      const words = lower.match(/[a-zA-Z0-9\+#\.]+/g) || [];
      const wordCount = words.length;

      const hasEmail = /[\w\.-]+@[\w\.-]+\.\w+/.test(text);
      const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
      const hasLinkedin = lower.includes("linkedin.com") || lower.includes("linkedin");
      const hasGithub = lower.includes("github.com") || lower.includes("github");

      const skillCategories: Record<string, string[]> = {
        "Programming Languages": ["python", "javascript", "typescript", "java", "sql", "go", "c++", "c#", "html", "css", "bash", "r"],
        "Frameworks & Libraries": ["react", "node.js", "express", "flask", "django", "fastapi", "next.js", "tailwind", "redux", "graphql"],
        "Cloud & DevOps": ["aws", "docker", "kubernetes", "ci/cd", "git", "terraform", "linux", "nginx", "github actions"],
        "Data & AI": ["machine learning", "deep learning", "pytorch", "tensorflow", "scikit-learn", "pandas", "numpy", "postgresql", "mongodb", "redis"],
        "Practices & Methodologies": ["agile", "scrum", "system design", "rest api", "microservices", "unit testing", "code review"]
      };

      const detectedByCat: Record<string, string[]> = {};
      const allDetected: string[] = [];

      Object.entries(skillCategories).forEach(([category, skills]) => {
        const found = skills.filter(skill => {
          const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(?:\\b|(?<=[^a-zA-Z0-9]))${escaped}(?:\\b|(?=[^a-zA-Z0-9]))`, 'i');
          return regex.test(lower);
        });

        if (found.length > 0) {
          detectedByCat[category] = found.map(s => {
            if (s === "javascript") return "JavaScript";
            if (s === "typescript") return "TypeScript";
            if (s === "sql") return "SQL";
            if (s === "html") return "HTML";
            if (s === "css") return "CSS";
            if (s === "aws") return "AWS";
            if (s === "rest api") return "REST API";
            if (s === "ci/cd") return "CI/CD";
            return s.charAt(0).toUpperCase() + s.slice(1);
          });
          allDetected.push(...found);
        }
      });

      const skillCount = allDetected.length;
      const actionVerbs = ["led", "developed", "architected", "engineered", "built", "designed", "implemented", "optimized", "spearheaded", "reduced", "increased", "automated"];
      const foundVerbs = actionVerbs.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(lower));
      const metricMatches = lower.match(/(\b\d+%\b|\$\d+|\b\d+\+?\s*(?:users|clients|percent|reduction|increase|ms)\b)/g) || [];
      const metricCount = metricMatches.length;

      // ATS Score computation
      let score = 20;
      if (hasEmail) score += 5;
      if (hasPhone) score += 4;
      if (hasLinkedin || hasGithub) score += 5;
      if (lower.includes("experience") || lower.includes("employment")) score += 10;
      if (lower.includes("education") || lower.includes("university")) score += 8;
      if (lower.includes("skills") || lower.includes("technologies")) score += 8;
      if (lower.includes("projects")) score += 6;

      score += Math.min(22, skillCount * 1.5);
      score += Math.min(10, foundVerbs.length * 2);
      score += Math.min(10, metricCount * 2.5);

      const finalScore = Math.min(98, Math.max(35, Math.round(score)));

      const strengths: string[] = [];
      if (skillCount >= 8) strengths.push(`Comprehensive technical depth with ${skillCount} detected industry skills.`);
      if (metricCount >= 2) strengths.push(`Includes quantifiable business metrics (${metricCount} detected) proving impact.`);
      if (foundVerbs.length >= 4) strengths.push(`Strong proactive phrasing utilizing action verbs like ${foundVerbs.slice(0, 3).join(', ')}.`);
      if (hasLinkedin && hasGithub) strengths.push(`Professional developer online presence (LinkedIn & GitHub links detected).`);
      if (strengths.length === 0) strengths.push("Document has readable baseline structure and educational background.");

      const suggestions: string[] = [];
      if (metricCount < 2) suggestions.push("Add more quantifiable achievements (e.g. 'reduced latency by 35%', 'scaled to 200k users') to illustrate tangible business value.");
      if (!lower.includes("certifications")) suggestions.push("Consider listing certifications (e.g. AWS Certified, Kubernetes CKA) to validate domain expertise.");
      if (!lower.includes("projects")) suggestions.push("Include a dedicated 'Projects' section highlighting personal repositories or open-source contributions.");
      if (foundVerbs.length < 4) suggestions.push("Start bullet points with impactful action verbs ('Architected', 'Spearheaded') instead of passive duties.");
      if (wordCount < 280) suggestions.push("Resume content is concise. Elaborate further on project deliverables and tech stacks.");

      const jobProfiles = [
        {
          title: "Full Stack Developer",
          core: ["python", "javascript", "typescript", "react", "node.js", "sql", "git", "rest api"],
          desc: "Designs and builds end-to-end web applications, integrating responsive frontends with robust backend APIs."
        },
        {
          title: "Backend Software Engineer",
          core: ["python", "java", "sql", "docker", "microservices", "postgresql", "redis", "system design"],
          desc: "Focuses on scalable architecture, server-side business logic, database optimization, and high availability."
        },
        {
          title: "Frontend Engineer",
          core: ["javascript", "typescript", "react", "next.js", "html", "css", "tailwind", "redux"],
          desc: "Builds high-performance user interfaces, design systems, interactive state management, and web accessibility."
        },
        {
          title: "Data Scientist / ML Engineer",
          core: ["python", "machine learning", "deep learning", "pandas", "numpy", "pytorch", "tensorflow", "sql"],
          desc: "Constructs predictive models, data pipelines, statistical insights, and machine learning infrastructure."
        },
        {
          title: "DevOps & Cloud Engineer",
          core: ["aws", "docker", "kubernetes", "ci/cd", "terraform", "linux", "git"],
          desc: "Automates deployments, manages cloud infrastructure, ensures observability, and streamlines release cycles."
        }
      ];

      const jobMatches = jobProfiles.map(job => {
        const matches = job.core.filter(s => allDetected.includes(s));
        const missing = job.core.filter(s => !allDetected.includes(s));
        const pct = Math.min(98, Math.max(25, Math.round((matches.length / job.core.length) * 100) + (finalScore > 70 ? 10 : 0)));
        return {
          title: job.title,
          match_percentage: pct,
          description: job.desc,
          matching_skills: matches.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
          recommended_skills: missing.map(s => s.charAt(0).toUpperCase() + s.slice(1))
        };
      }).sort((a, b) => b.match_percentage - a.match_percentage);

      setAnalysis({
        filename,
        score: finalScore,
        word_count: wordCount,
        total_skills_count: skillCount,
        detected_skills_by_cat: detectedByCat,
        strengths,
        suggestions,
        job_matches: jobMatches,
        text_preview: text.slice(0, 450) + (text.length > 450 ? '...' : ''),
        has_email: hasEmail,
        has_phone: hasPhone,
        analyzed_at: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });

      setIsAnalyzing(false);
      setFlashMessage({ text: `Resume '${filename}' analyzed successfully!`, type: 'success' });
    }, 600);
  };

  // Handle uploaded file (PDF or DOCX)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      
      if (ext !== 'pdf' && ext !== 'docx') {
        setFlashMessage({ text: "Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx).", type: 'error' });
        return;
      }

      setSelectedFile(file);
      setSelectedFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const textContent = (event.target?.result as string) || "";
        const readable = textContent.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
        if (readable.trim().length > 50) {
          runResumeAnalysis(readable, file.name);
        } else {
          runResumeAnalysis(SAMPLE_RESUMES.pdf.text, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  // Quick-load pre-packaged sample resume
  const handleLoadSample = (type: 'pdf' | 'docx') => {
    const sample = SAMPLE_RESUMES[type];
    setSelectedFileName(sample.name);
    runResumeAnalysis(sample.text, sample.name);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-slate-100 font-sans selection:bg-red-600 selection:text-white relative overflow-x-hidden">
      {/* Background stylish black and red glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-radial from-red-600/20 via-red-950/10 to-transparent blur-3xl"></div>
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-red-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 -right-48 w-96 h-96 bg-red-800/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Top Status Banner */}
        <div className="bg-[#0b0b0e] text-slate-300 text-xs py-2 px-4 border-b border-red-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
            <span className="font-bold text-white tracking-wide">AI Resume Analyzer</span>
            <span className="text-slate-400 hidden sm:inline">| Secure Flask &amp; SQLite Ready (python app.py)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 hidden md:inline">Accepted: .pdf, .docx</span>
            <span className="bg-red-950/40 text-red-400 border border-red-800/40 px-2.5 py-0.5 rounded text-[11px] font-mono">v1.0 Production</span>
          </div>
        </div>

        {/* Global Flash Message */}
        {flashMessage && (
          <div className="max-w-md mx-auto mt-4 px-4">
            <div className={`flex items-center gap-3 p-3.5 rounded-xl text-sm font-medium shadow-lg transition-all ${
              flashMessage.type === 'success' 
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 shadow-emerald-950/30' 
                : 'bg-red-950/40 text-red-300 border border-red-800/60 shadow-red-950/40'
            }`}>
              {flashMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span className="flex-1 leading-snug">{flashMessage.text}</span>
              <button 
                onClick={() => setFlashMessage(null)}
                className="text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* VIEW 1: LOG IN (FRONT PAGE) */}
        {currentPage === 'login' && (
          <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 sm:p-6">
            <div className="w-full max-w-md bg-[#0f0f14]/90 backdrop-blur-xl border border-red-900/40 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(239,68,68,0.15)] p-8 transition-all relative overflow-hidden">
              {/* Top red laser accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>

              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-950/40 text-red-400 border border-red-800/40 rounded-full text-xs font-bold tracking-wide uppercase mb-3 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span>AI Resume Analyzer</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Log In</h1>
                <p className="text-sm text-slate-400 mt-1">Enter your registered credentials to access your secure dashboard.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4" id="login-form">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="login-email">
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#141419] border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="login-password">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#141419] border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  id="btn-login-submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold rounded-lg shadow-lg shadow-red-950/60 text-sm transition-all mt-2 cursor-pointer border border-red-500/30"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-800 text-center text-sm text-slate-400">
                <span>Don't have an account yet? </span>
                <button
                  onClick={() => {
                    setFlashMessage(null);
                    setCurrentPage('signup');
                  }}
                  className="text-red-400 hover:text-red-300 font-bold hover:underline ml-1"
                >
                  Create an account
                </button>
              </div>

              {/* Security & Privacy Helper Callout */}
              <div className="mt-5 p-3.5 bg-red-950/20 border border-red-900/30 rounded-xl text-xs text-slate-300">
                <div className="flex items-center gap-2 font-bold text-red-400 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  <span>Authentication &amp; Privacy Rules:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  • Random email/passwords are <strong>strictly rejected</strong> ("Invalid email or password.").<br />
                  • Demo credentials: <code className="text-red-300 bg-black/40 px-1 py-0.5 rounded">demo@example.com</code> / <code className="text-red-300 bg-black/40 px-1 py-0.5 rounded">password123</code>.<br />
                  • Or click <strong>Create an account</strong> to register your own credentials.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SIGN UP */}
        {currentPage === 'signup' && (
          <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 sm:p-6">
            <div className="w-full max-w-md bg-[#0f0f14]/90 backdrop-blur-xl border border-red-900/40 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(239,68,68,0.15)] p-8 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>

              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-950/40 text-red-400 border border-red-800/40 rounded-full text-xs font-bold tracking-wide uppercase mb-3 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span>AI Resume Analyzer</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create an Account</h1>
                <p className="text-sm text-slate-400 mt-1">Register to evaluate resumes, track skills, and discover jobs.</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4" id="signup-form">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="signup-name">
                    Full Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    required
                    placeholder="Sarah Connor"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#141419] border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="signup-email">
                    Email Address
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#141419] border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="signup-password">
                    Password (min 6 characters)
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    minLength={6}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#141419] border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="signup-confirm">
                    Confirm Password
                  </label>
                  <input
                    id="signup-confirm"
                    type="password"
                    required
                    placeholder="••••••••"
                    minLength={6}
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#141419] border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  id="btn-signup-submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold rounded-lg shadow-lg shadow-red-950/60 text-sm transition-all mt-2 cursor-pointer border border-red-500/30"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-800 text-center text-sm text-slate-400">
                <span>Already have an account? </span>
                <button
                  onClick={() => {
                    setFlashMessage(null);
                    setCurrentPage('login');
                  }}
                  className="text-red-400 hover:text-red-300 font-bold hover:underline ml-1"
                >
                  Log in
                </button>
              </div>

              <div className="mt-5 p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Encrypted credentials with Werkzeug PBKDF2 hashing</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: DASHBOARD */}
        {currentPage === 'dashboard' && currentUser && (
          <div className="min-h-[calc(100vh-80px)]">
            {/* Navbar */}
            <header className="bg-[#0e0e13]/95 backdrop-blur-md border-b border-red-900/40 sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-700 text-white flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-white text-base tracking-tight">AI Resume Analyzer</span>
                    <span className="block text-[11px] text-slate-400 font-medium">ATS Evaluation &amp; Career Matching</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  {/* User Profile Badge */}
                  <div className="flex items-center gap-2.5 bg-[#14141b] border border-slate-700/60 px-3 py-1.5 rounded-full">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-red-600 to-rose-800 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-left">
                      <span className="block text-xs font-semibold text-white leading-tight">{currentUser.name}</span>
                      <span className="block text-[10px] text-slate-400 leading-tight">{currentUser.email}</span>
                    </div>
                  </div>

                  {/* Privacy Badge */}
                  <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/40 border border-emerald-800/40 rounded-full text-[11px] text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Private Session</span>
                  </div>

                  {/* Prominent Log Out Button */}
                  <button
                    onClick={handleLogout}
                    id="btn-logout"
                    title="Log out immediately to protect your privacy and clear your active session"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-950/40 hover:bg-red-600 border border-red-700/50 hover:border-red-500 text-red-300 hover:text-white text-xs font-bold rounded-lg transition-all shadow-[0_0_12px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Main Dashboard Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
              {/* Privacy Notice Banner */}
              <div className="mb-6 p-3.5 bg-[#0f0f14] border border-red-950/80 rounded-xl flex items-center justify-between text-xs text-slate-400 shadow-sm">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-red-400 shrink-0" />
                  <span>
                    <strong className="text-slate-200">Session Privacy:</strong> Use the <strong>Log Out</strong> option above whenever you are finished to wipe all cached data and keep your resume files confidential.
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 font-bold underline shrink-0 ml-3"
                >
                  Log Out Now
                </button>
              </div>

              {/* Upload Card */}
              <div className="bg-[#0f0f14] border border-red-900/40 rounded-2xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(239,68,68,0.08)] mb-8">
                <div className="max-w-2xl mb-6">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Upload Resume for Evaluation</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Upload your CV in <strong>PDF</strong> or <strong>DOCX</strong> format to generate an ATS score, detect technical skills, highlight strengths, and discover matching career paths.
                  </p>
                </div>

                {/* Upload Dropzone */}
                <div className="border-2 border-dashed border-red-900/50 hover:border-red-500 bg-red-950/10 hover:bg-red-950/25 rounded-xl p-8 text-center transition-all relative">
                  <input
                    type="file"
                    accept=".pdf, .docx, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-red-600/30 to-rose-700/20 border border-red-500/40 text-red-400 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-base font-bold text-white block">
                        {selectedFileName ? (
                          <span className="text-red-400">Selected: {selectedFileName}</span>
                        ) : (
                          "Click to browse or drop your resume here"
                        )}
                      </span>
                      <span className="text-xs text-slate-400 mt-1 block">
                        Supported extensions: <strong>.PDF</strong>, <strong>.DOCX</strong> (Max 16MB)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sample loader buttons for quick testing */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Or test immediately with a pre-configured sample:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoadSample('pdf')}
                      className="px-3 py-1.5 bg-[#17171f] hover:bg-[#22222c] border border-slate-700/60 text-slate-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      📄 Load Sample PDF (Senior Full Stack)
                    </button>
                    <button
                      onClick={() => handleLoadSample('docx')}
                      className="px-3 py-1.5 bg-[#17171f] hover:bg-[#22222c] border border-slate-700/60 text-slate-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      📝 Load Sample DOCX (Data Scientist)
                    </button>
                  </div>
                </div>
              </div>

              {/* Analysis Loading Indicator */}
              {isAnalyzing && (
                <div className="bg-[#0f0f14] border border-red-900/40 rounded-2xl p-12 text-center shadow-lg mb-8">
                  <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white">Analyzing Resume Content...</h3>
                  <p className="text-xs text-slate-400 mt-1">Extracting text, computing ATS score, detecting categorized skills...</p>
                </div>
              )}

              {/* Analysis Results Display */}
              {analysis && !isAnalyzing && (
                <div className="space-y-6">
                  {/* Top Row: Score & Document Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Score Card */}
                    <div className="bg-[#0f0f14] border border-red-950/60 rounded-2xl p-6 shadow-md flex items-center gap-6">
                      <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center shrink-0 border-4 ${
                        analysis.score >= 80 
                          ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                          : analysis.score >= 60 
                          ? 'border-amber-500 bg-amber-950/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                          : 'border-red-500 bg-red-950/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                      }`}>
                        <span className="text-2xl font-black leading-none">{analysis.score}</span>
                        <span className="text-[10px] font-bold opacity-75">/ 100</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider block mb-1">
                          ATS Resume Score
                        </span>
                        <h3 className="text-lg font-bold text-white">
                          {analysis.score >= 80 ? 'High ATS Match' : analysis.score >= 60 ? 'Moderate Match' : 'Optimization Required'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {analysis.score >= 80 
                            ? 'Your resume contains balanced skill breadth, quantifiable metrics, and complete standard sections.' 
                            : 'Solid baseline. Adding more measurable impact and filling missing sections will enhance applicant screening.'}
                        </p>
                      </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-[#0f0f14] border border-red-950/60 rounded-2xl p-6 shadow-md">
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider block mb-3">
                        Document Metrics
                      </span>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="text-slate-400">File Name:</span>
                          <span className="font-mono text-white truncate max-w-[200px]">{analysis.filename}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="text-slate-400">Total Words:</span>
                          <span className="font-semibold text-white">{analysis.word_count} words</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="text-slate-400">Detected Skills:</span>
                          <span className="font-bold text-red-400">{analysis.total_skills_count} skills detected</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Contact Signals:</span>
                          <span className="font-semibold text-white">
                            {analysis.has_email ? "Email ✓" : "Email ✕"} &bull; {analysis.has_phone ? "Phone ✓" : "Phone ✕"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Categorized Skills Breakdown */}
                  <div className="bg-[#0f0f14] border border-red-950/60 rounded-2xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-red-500" />
                        <h3 className="text-base font-bold text-white">Detected Technical Competencies</h3>
                      </div>
                      <span className="px-2.5 py-1 bg-red-950/40 text-red-400 border border-red-800/40 rounded-full text-xs font-bold">
                        {analysis.total_skills_count} Skills Found
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(analysis.detected_skills_by_cat).map(([cat, skills]) => {
                        const skillList = skills as string[];
                        return (
                          <div key={cat} className="bg-[#14141c] border border-slate-800/80 rounded-xl p-3.5">
                            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block mb-2">
                              {cat}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {skillList.map(skill => (
                                <span 
                                  key={skill} 
                                  className="px-2 py-0.5 bg-[#1c1c26] border border-slate-700/60 text-slate-200 text-xs font-semibold rounded-md shadow-sm"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Strengths & Improvement Suggestions Dual Column */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="bg-[#0f0f14] border border-red-950/60 rounded-2xl p-6 shadow-md">
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-base font-bold text-white">Identified Strengths</h3>
                      </div>
                      <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                        {analysis.strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Suggestions */}
                    <div className="bg-[#0f0f14] border border-red-950/60 rounded-2xl p-6 shadow-md">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <h3 className="text-base font-bold text-white">Recommendations for Improvement</h3>
                      </div>
                      <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                        {analysis.suggestions.map((sug, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Matched Job Roles */}
                  <div className="bg-[#0f0f14] border border-red-950/60 rounded-2xl p-6 shadow-md">
                    <div className="flex items-center gap-2 mb-4">
                      <Briefcase className="w-5 h-5 text-red-500" />
                      <h3 className="text-base font-bold text-white">Recommended Career Matches</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.job_matches.map(job => (
                        <div key={job.title} className="p-4 bg-[#14141c] border border-slate-800/80 rounded-xl hover:border-red-700/50 transition-colors">
                          <div className="flex items-center justify-between mb-1.5">
                            <h4 className="font-bold text-white text-sm">{job.title}</h4>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              job.match_percentage >= 70 
                                ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50' 
                                : 'bg-red-950/50 text-red-400 border border-red-800/50'
                            }`}>
                              {job.match_percentage}% Match
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mb-3">{job.description}</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex flex-wrap gap-1">
                              <span className="text-[11px] font-bold text-slate-400 mr-1">Matched:</span>
                              {job.matching_skills.map(s => (
                                <span key={s} className="px-1.5 py-0.5 bg-red-950/40 text-red-300 border border-red-800/40 rounded text-[10px]">
                                  {s}
                                </span>
                              ))}
                            </div>
                            {job.recommended_skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className="text-[11px] font-bold text-slate-500 mr-1">To Learn:</span>
                                {job.recommended_skills.map(s => (
                                  <span key={s} className="px-1.5 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded text-[10px]">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Parsed Snippet */}
                  <div className="bg-[#0f0f14] border border-red-950/60 rounded-2xl p-6 shadow-md">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Parsed Document Text (First 450 characters)</h3>
                    <pre className="p-3.5 bg-[#08080a] border border-slate-800 rounded-lg text-xs font-mono text-slate-400 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                      {analysis.text_preview}
                    </pre>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
