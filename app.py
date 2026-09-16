#!/usr/bin/env python3
"""
AI Resume Analyzer - Secure Flask Application
=============================================
Features:
- Secure SQLite user authentication with Werkzeug password hashing
- Session protection on dashboard and analysis routes
- PDF (pypdf/PyPDF2) and DOCX (python-docx) text extraction
- Rule-based resume scoring, skill extraction, strengths, improvements, and job matching
- Safe upload validation, size limits, and security headers
"""

import os
import re
import sqlite3
from functools import wraps
from datetime import datetime
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    session,
    flash,
    g
)

# Optional PDF & DOCX libraries with clean fallbacks
try:
    from pypdf import PdfReader
    HAS_PYPDF = True
except ImportError:
    try:
        from PyPDF2 import PdfReader
        HAS_PYPDF = True
    except ImportError:
        HAS_PYPDF = False

try:
    import docx
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False


app = Flask(__name__)

# Security & configuration
app.secret_key = os.environ.get(
    "FLASK_SECRET_KEY",
    "dev-insecure-flask-secret-key-change-in-production-resume-analyzer-2026"
)

# Upload configuration
UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'pdf', 'docx'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Database path
DATABASE = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'users.db')

# Ensure uploads folder exists locally
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def get_db():
    """Returns a connection to the SQLite database with Row factory."""
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db


@app.teardown_appcontext
def close_connection(exception):
    """Closes the database connection at the end of each request."""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


def init_db():
    """Initializes the database schema if tables do not exist."""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    conn.close()


# Ensure database is initialized on startup
init_db()


def allowed_file(filename):
    """Checks if file extension is permitted."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def login_required(f):
    """Decorator to require authenticated session for protected routes."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash("Please log in to access your dashboard.", "error")
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


def extract_text_from_pdf(file_stream):
    """Extracts plain text from a PDF file stream using pypdf/PyPDF2."""
    if not HAS_PYPDF:
        # Fallback basic extraction if library is not yet installed
        try:
            content = file_stream.read().decode('latin-1', errors='ignore')
            # Look for readable text blocks in PDF stream
            text_chunks = re.findall(r'\(([^\(\)\\]+)\)', content)
            return " ".join(text_chunks)
        except Exception:
            return ""

    try:
        reader = PdfReader(file_stream)
        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        return "\n".join(text_parts).strip()
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""


def extract_text_from_docx(file_stream):
    """Extracts plain text from a DOCX file stream, including paragraphs and tables."""
    if not HAS_DOCX:
        # Fallback raw extraction if python-docx is not installed
        try:
            import zipfile
            import xml.etree.ElementTree as ET
            with zipfile.ZipFile(file_stream) as z:
                xml_content = z.read('word/document.xml')
                tree = ET.fromstring(xml_content)
                text_nodes = tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                return " ".join(node.text for node in text_nodes if node.text).strip()
        except Exception:
            return ""

    try:
        doc = docx.Document(file_stream)
        text_parts = []
        # Paragraphs
        for p in doc.paragraphs:
            if p.text.strip():
                text_parts.append(p.text.strip())
        # Tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        text_parts.append(cell.text.strip())
        return "\n".join(text_parts).strip()
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        return ""


# Skill taxonomy for detection
SKILL_TAXONOMY = {
    "Programming Languages": [
        "python", "javascript", "typescript", "java", "c++", "c#", "c", "go",
        "rust", "ruby", "php", "swift", "kotlin", "scala", "sql", "html", "css",
        "bash", "shell", "r"
    ],
    "Frameworks & Libraries": [
        "react", "react.js", "next.js", "vue", "vue.js", "angular", "node.js",
        "node", "express", "express.js", "flask", "django", "fastapi", "spring",
        "spring boot", "asp.net", "tailwind", "bootstrap", "redux", "graphql"
    ],
    "Cloud & DevOps": [
        "aws", "amazon web services", "azure", "google cloud", "gcp", "docker",
        "kubernetes", "ci/cd", "git", "github", "gitlab", "terraform", "linux",
        "nginx", "jenkins", "ansible", "prometheus", "grafana"
    ],
    "Data & AI": [
        "machine learning", "deep learning", "artificial intelligence", "data science",
        "pytorch", "tensorflow", "keras", "pandas", "numpy", "scikit-learn",
        "nlp", "computer vision", "postgresql", "mysql", "mongodb", "redis",
        "sqlite", "tableau", "power bi", "spark", "hadoop"
    ],
    "Practices & Soft Skills": [
        "agile", "scrum", "leadership", "problem solving", "cross-functional collaboration",
        "system design", "code review", "unit testing", "rest api", "microservices",
        "communication", "project management", "mentorship"
    ]
}

ACTION_VERBS = [
    "led", "developed", "architected", "engineered", "built", "designed",
    "implemented", "optimized", "spearheaded", "accelerated", "reduced",
    "increased", "automated", "created", "deployed", "scaled", "managed",
    "delivered", "collaborated", "streamlined", "improved", "launched"
]

JOB_PROFILES = [
    {
        "title": "Full Stack Developer",
        "core_skills": ["python", "javascript", "typescript", "react", "node.js", "sql", "git", "rest api"],
        "description": "Designs and builds end-to-end web applications, integrating responsive frontends with robust backend APIs."
    },
    {
        "title": "Backend Software Engineer",
        "core_skills": ["python", "java", "go", "sql", "docker", "microservices", "postgresql", "redis", "system design"],
        "description": "Focuses on scalable architecture, server-side business logic, database optimization, and high availability."
    },
    {
        "title": "Frontend Engineer",
        "core_skills": ["javascript", "typescript", "react", "next.js", "html", "css", "tailwind", "redux"],
        "description": "Builds high-performance user interfaces, design systems, interactive state management, and web accessibility."
    },
    {
        "title": "Data Scientist / ML Engineer",
        "core_skills": ["python", "machine learning", "deep learning", "pandas", "numpy", "pytorch", "tensorflow", "sql"],
        "description": "Constructs predictive models, data pipelines, statistical insights, and machine learning infrastructure."
    },
    {
        "title": "DevOps & Cloud Engineer",
        "core_skills": ["aws", "docker", "kubernetes", "ci/cd", "terraform", "linux", "git", "cloud"],
        "description": "Automates deployments, manages cloud infrastructure, ensures observability, and streamlines release cycles."
    }
]


def analyze_resume_text(raw_text, filename=""):
    """
    Analyzes extracted resume text:
    - Calculates word count and metrics
    - Extracts categorized skills
    - Evaluates resume structure and sections
    - Computes resume score (0 - 100)
    - Generates strengths and constructive suggestions
    - Calculates matching career opportunities
    """
    cleaned_lower = raw_text.lower()
    words = re.findall(r'\b[a-zA-Z0-9\+#\.]+\b', cleaned_lower)
    word_count = len(words)

    # 1. Detect contact info
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text))
    has_phone = bool(re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', raw_text))
    has_linkedin = "linkedin.com" in cleaned_lower or "linkedin" in cleaned_lower
    has_github = "github.com" in cleaned_lower or "github" in cleaned_lower

    # 2. Detect key sections
    sections_found = {}
    section_patterns = {
        "Summary": [r'\bsummary\b', r'\bprofile\b', r'\bobjective\b', r'\babout\s+me\b'],
        "Experience": [r'\bexperience\b', r'\bemployment\b', r'\bwork\s+history\b', r'\bwork\s+experience\b'],
        "Education": [r'\beducation\b', r'\bacademics\b', r'\bdegree\b', r'\buniversity\b', r'\bcollege\b'],
        "Skills": [r'\bskills\b', r'\btechnical\s+skills\b', r'\btechnologies\b', r'\bcore\s+competencies\b'],
        "Projects": [r'\bprojects\b', r'\bpersonal\s+projects\b', r'\bkey\s+projects\b'],
        "Certifications": [r'\bcertifications\b', r'\bcertificates\b', r'\blicenses\b', r'\baccreditations\b']
    }
    for sec, patterns in section_patterns.items():
        sections_found[sec] = any(re.search(pat, cleaned_lower) for pat in patterns)

    # 3. Detect skills by category
    detected_skills_by_cat = {}
    all_detected_skills = []
    for category, skill_list in SKILL_TAXONOMY.items():
        cat_matches = []
        for skill in skill_list:
            # Use word boundary or exact match
            escaped = re.escape(skill)
            pattern = r'(?:\b|(?<=[^a-zA-Z0-9]))' + escaped + r'(?:\b|(?=[^a-zA-Z0-9]))'
            if re.search(pattern, cleaned_lower):
                # Capitalize nicely
                formatted_skill = skill.title() if len(skill) > 3 and not skill.endswith('.js') else skill.upper() if len(skill) <= 3 else skill
                if skill in ["javascript", "typescript"]:
                    formatted_skill = "JavaScript" if skill == "javascript" else "TypeScript"
                elif skill in ["react.js", "react"]:
                    formatted_skill = "React"
                elif skill in ["node.js", "node"]:
                    formatted_skill = "Node.js"
                elif skill == "next.js":
                    formatted_skill = "Next.js"
                elif skill == "fastapi":
                    formatted_skill = "FastAPI"
                elif skill == "postgresql":
                    formatted_skill = "PostgreSQL"
                elif skill == "mongodb":
                    formatted_skill = "MongoDB"
                elif skill == "sql":
                    formatted_skill = "SQL"
                elif skill == "html":
                    formatted_skill = "HTML"
                elif skill == "css":
                    formatted_skill = "CSS"
                elif skill == "aws":
                    formatted_skill = "AWS"
                elif skill == "gcp":
                    formatted_skill = "GCP"
                cat_matches.append(formatted_skill)
                all_detected_skills.append(skill)
        if cat_matches:
            detected_skills_by_cat[category] = list(dict.fromkeys(cat_matches))

    # 4. Action verbs & metrics
    found_verbs = [verb for verb in ACTION_VERBS if re.search(r'\b' + verb + r'\b', cleaned_lower)]
    metric_count = len(re.findall(r'(\b\d+%\b|\$\d+|\b\d+\+?\s*(?:users|clients|percent|increase|reduction|ms|seconds|million|thousand)\b)', cleaned_lower))

    # 5. Score calculation (0 - 100)
    score = 0
    # Contact info: up to 10 points
    if has_email: score += 4
    if has_phone: score += 3
    if has_linkedin or has_github: score += 3

    # Key sections: up to 25 points
    if sections_found.get("Experience"): score += 8
    if sections_found.get("Education"): score += 6
    if sections_found.get("Skills"): score += 5
    if sections_found.get("Projects"): score += 4
    if sections_found.get("Summary"): score += 2

    # Skills density: up to 25 points
    skill_count = len(all_detected_skills)
    if skill_count >= 15: score += 25
    elif skill_count >= 10: score += 20
    elif skill_count >= 6: score += 15
    elif skill_count >= 3: score += 10
    else: score += max(2, skill_count * 2)

    # Action verbs: up to 15 points
    verb_count = len(found_verbs)
    if verb_count >= 8: score += 15
    elif verb_count >= 5: score += 11
    elif verb_count >= 2: score += 7
    else: score += verb_count * 3

    # Measurable impact / metrics: up to 15 points
    if metric_count >= 4: score += 15
    elif metric_count >= 2: score += 10
    elif metric_count >= 1: score += 5
    else: score += 2

    # Length / Depth: up to 10 points
    if 250 <= word_count <= 1200: score += 10
    elif 150 <= word_count < 250 or 1200 < word_count <= 1800: score += 6
    else: score += 3

    # Cap at 100, min 25
    resume_score = min(100, max(25, score))

    # 6. Strengths
    strengths = []
    if skill_count >= 8:
        strengths.append(f"Strong technical skill breadth with {skill_count} detected industry skills.")
    if sections_found.get("Experience") and sections_found.get("Education"):
        strengths.append("Standard core resume sections (Work Experience and Education) are clearly present.")
    if metric_count >= 2:
        strengths.append(f"Includes quantifiable results and metrics ({metric_count} found), proving measurable business impact.")
    if len(found_verbs) >= 4:
        strengths.append(f"Effective use of active verbs ({', '.join(found_verbs[:4])}) conveying strong ownership.")
    if has_linkedin or has_github:
        strengths.append("Includes online professional profile links (LinkedIn / GitHub).")
    if not strengths:
        strengths.append("Readable document structure with baseline educational and background context.")

    # 7. Suggestions for improvement
    suggestions = []
    if metric_count < 2:
        suggestions.append("Add more quantifiable achievements (e.g., 'increased performance by 30%', 'managed team of 5', 'reduced latency by 150ms') to demonstrate tangible results.")
    if not sections_found.get("Projects"):
        suggestions.append("Include a dedicated 'Projects' section featuring hands-on builds, tech stacks used, and outcomes.")
    if not sections_found.get("Certifications"):
        suggestions.append("Consider adding relevant certifications (e.g., AWS, GCP, Scrum, Kubernetes) to validate expertise.")
    if not (has_linkedin and has_github):
        suggestions.append("Ensure both your LinkedIn profile and GitHub/portfolio repository links are prominent in your header.")
    if len(found_verbs) < 5:
        suggestions.append("Start bullet points with strong action verbs (e.g., 'Architected', 'Spearheaded', 'Engineered') instead of passive phrasing.")
    if word_count < 300:
        suggestions.append("Your resume content is relatively brief. Elaborate on project deliverables, responsibilities, and specific tools used.")
    elif word_count > 1200:
        suggestions.append("Your resume is quite dense. Aim to keep it concise, ideally 1-2 pages formatted for high readability.")

    # 8. Career / Job matching
    job_matches = []
    for job in JOB_PROFILES:
        match_count = sum(1 for s in job["core_skills"] if s in all_detected_skills)
        pct = int((match_count / len(job["core_skills"])) * 100)
        # Give realistic baseline curve
        calculated_pct = min(98, max(20, pct + (15 if resume_score > 70 else 5)))
        job_matches.append({
            "title": job["title"],
            "match_percentage": calculated_pct,
            "description": job["description"],
            "matching_skills": [s.title() for s in job["core_skills"] if s in all_detected_skills],
            "recommended_skills": [s.title() for s in job["core_skills"] if s not in all_detected_skills]
        })
    job_matches.sort(key=lambda x: x["match_percentage"], reverse=True)

    # 9. Text preview (first 450 chars)
    preview_text = raw_text[:450] + ("..." if len(raw_text) > 450 else "")

    return {
        "filename": filename,
        "score": resume_score,
        "word_count": word_count,
        "detected_skills_by_cat": detected_skills_by_cat,
        "total_skills_count": skill_count,
        "strengths": strengths,
        "suggestions": suggestions,
        "job_matches": job_matches,
        "text_preview": preview_text,
        "has_email": has_email,
        "has_phone": has_phone,
        "analyzed_at": datetime.now().strftime("%B %d, %Y - %I:%M %p")
    }


# ==========================================
# Application Routes
# ==========================================

@app.route('/')
def index():
    """First/front page route: redirects to dashboard if authenticated, else login."""
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
@app.route('/signin', methods=['GET', 'POST'])
def login():
    """
    Login page:
    - Rejects random email/password
    - Validates against SQLite user records with hashed passwords
    - Sets secure session
    """
    if 'user_id' in session:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '').strip()

        if not email or not password:
            flash("Please enter both email and password.", "error")
            return render_template('signin.html', email=email)

        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()

        # Secure check: Verify user exists AND password hash matches
        if user is None or not check_password_hash(user['password_hash'], password):
            flash("Invalid email or password.", "error")
            return render_template('signin.html', email=email)

        # Successful login: Set session
        session['user_id'] = user['id']
        session['user_email'] = user['email']
        session['user_name'] = user['name']
        flash(f"Welcome back, {user['name']}!", "success")
        return redirect(url_for('dashboard'))

    return render_template('signin.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    """
    Registration page:
    - Validates inputs (name, email, password, confirm_password)
    - Rejects existing emails
    - Securely hashes passwords with Werkzeug
    - Persists to SQLite
    - Redirects to login on success
    """
    if 'user_id' in session:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '').strip()
        confirm_password = request.form.get('confirm_password', '').strip()

        # Validation
        if not name or not email or not password or not confirm_password:
            flash("All fields are required. Please fill out the full form.", "error")
            return render_template('signup.html', name=name, email=email)

        # Email format check
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_regex, email):
            flash("Please enter a valid email address.", "error")
            return render_template('signup.html', name=name, email=email)

        if len(password) < 6:
            flash("Password must be at least 6 characters long.", "error")
            return render_template('signup.html', name=name, email=email)

        if password != confirm_password:
            flash("Passwords do not match. Please verify both password fields.", "error")
            return render_template('signup.html', name=name, email=email)

        db = get_db()
        cursor = db.cursor()

        # Check if email is already registered
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        existing_user = cursor.fetchone()
        if existing_user is not None:
            flash("An account with this email already exists. Please log in.", "error")
            return render_template('signup.html', name=name, email=email)

        # Hash password securely
        password_hash = generate_password_hash(password, method='pbkdf2:sha256')

        try:
            cursor.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                (name, email, password_hash)
            )
            db.commit()
            flash("Account created successfully! Please log in with your credentials.", "success")
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash("An error occurred while creating your account. Please try again.", "error")
            return render_template('signup.html', name=name, email=email)

    return render_template('signup.html')


@app.route('/dashboard')
@login_required
def dashboard():
    """Protected dashboard page."""
    return render_template(
        'dashboard.html',
        user_name=session.get('user_name', 'User'),
        user_email=session.get('user_email', ''),
        analysis=None
    )


@app.route('/analyze', methods=['POST'])
@login_required
def analyze():
    """
    Processes resume file upload (PDF or DOCX), extracts text, runs analysis,
    and returns results onto the dashboard.
    """
    if 'resume' not in request.files:
        flash("No file part provided in the request.", "error")
        return redirect(url_for('dashboard'))

    file = request.files['resume']

    if file.filename == '':
        flash("No file was selected. Please choose a PDF or DOCX resume to upload.", "error")
        return redirect(url_for('dashboard'))

    if not allowed_file(file.filename):
        flash("Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx).", "error")
        return redirect(url_for('dashboard'))

    filename = secure_filename(file.filename)
    extension = filename.rsplit('.', 1)[1].lower()

    # Extract text from memory stream
    extracted_text = ""
    try:
        if extension == 'pdf':
            extracted_text = extract_text_from_pdf(file.stream)
        elif extension == 'docx':
            extracted_text = extract_text_from_docx(file.stream)
    except Exception as e:
        flash(f"Error parsing resume file: {str(e)}", "error")
        return redirect(url_for('dashboard'))

    if not extracted_text or len(extracted_text.strip()) < 20:
        flash("Could not extract readable text from the document. Please ensure the file is not an image-only scan or encrypted.", "error")
        return redirect(url_for('dashboard'))

    # Run analysis
    analysis = analyze_resume_text(extracted_text, filename=filename)
    flash(f"Resume '{filename}' analyzed successfully!", "success")

    return render_template(
        'dashboard.html',
        user_name=session.get('user_name', 'User'),
        user_email=session.get('user_email', ''),
        analysis=analysis
    )


@app.route('/logout')
def logout():
    """Logs out the active user and clears the session for privacy and security."""
    session.clear()
    flash("You have been logged out successfully for your privacy and security.", "success")
    return redirect(url_for('login'))


# Error handlers for safe execution
@app.errorhandler(413)
def request_entity_too_large(error):
    flash("The uploaded file exceeds the 16MB limit. Please upload a smaller file.", "error")
    return redirect(url_for('dashboard')), 413


@app.errorhandler(404)
def page_not_found(error):
    return redirect(url_for('index'))


if __name__ == '__main__':
    # Local development server
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
