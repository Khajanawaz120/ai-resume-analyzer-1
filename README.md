# AI Resume Analyzer - Secure Flask Application

A secure, production-ready AI Resume Analyzer built with Flask, SQLite, `pypdf`, and `python-docx` styled with a **stylish black and red background theme**. It features authenticated user accounts with Werkzeug password hashing, robust resume text extraction from both PDF and DOCX files, ATS compatibility scoring, categorized skill detection, strengths and suggestions analysis, career opportunity matching, and a **prominent Log Out option for user privacy and session protection**.

---

## Key Features

1. **Log In on Front Page & Secure Authentication**:
   - First/front page displays the **Log In** interface (`/login` and `/signin`).
   - Replaced "Sign In" with "Log In" across all front-page elements, forms, and buttons.
   - Registration page (`/signup`) with full validation (name, valid email format, minimum 6 characters, password confirmation, duplicate email detection).
   - Passwords securely hashed with Werkzeug's `generate_password_hash` (`pbkdf2:sha256`).
   - Authentication rejects unknown emails and incorrect passwords with `"Invalid email or password."`.
   - Random or arbitrary email/password inputs will **never** log in.
   - Protected `/dashboard` and `/analyze` routes with session verification.

2. **Prominent Log Out Option for Privacy & Security**:
   - Prominent **Log Out** button located in the navigation bar and dashboard banners.
   - **Why Log Out Matters for Privacy**: Resumes contain sensitive contact data (full names, phone numbers, personal email addresses, work histories). Logging out immediately wipes the session cookie and cached session tokens so no unauthorized user on a shared or public computer can access private resume data.
   - Redirects to `/login` with a clear confirmation: `"You have been logged out successfully for your privacy and security."`.

3. **Stylish Black & Red Theme**:
   - High-contrast pitch-black and dark obsidian canvas with ambient crimson and ruby radial glow effects.
   - Red gradient action buttons with glowing hover states (`#ef4444`, `#dc2626`, `#991b1b`).
   - Sleek dark cards with subtle red border accents and glowing indicators.
   - Clean, readable typography engineered for accessibility.

4. **Dual PDF & DOCX Resume Parsing**:
   - Accepts both `.pdf` and `.docx` documents.
   - PDF text extraction powered by `pypdf` / `PyPDF2`.
   - DOCX text extraction powered by `python-docx` (extracts from both paragraphs and tables).
   - Safe validation of file extensions, MIME types, and 16MB file size limits with `secure_filename`.

5. **Intelligent Resume Analysis & ATS Scoring**:
   - **ATS Score (0 - 100)**: Evaluates document length, key sections (Experience, Education, Skills, Projects, Summary), technical skill breadth, quantifiable metrics/achievements, active power verbs, and contact info.
   - **Categorized Skills**: Categorizes detected skills into *Programming Languages*, *Frameworks & Libraries*, *Cloud & DevOps*, *Data & AI*, and *Practices & Soft Skills*.
   - **Key Strengths**: Bullet points celebrating verified achievements and structure.
   - **Recommendations for Improvement**: Actionable suggestions to optimize bullet points, add quantifiable numbers, and fill missing sections.
   - **Career Opportunities**: Evaluates fit against real tech roles (Full Stack, Backend, Frontend, Data Science / ML, DevOps) with calculated match percentages.

---

## Project Structure

```
├── app.py                  # Main Flask application and analysis engine
├── requirements.txt        # Python dependencies (Flask, pypdf, python-docx, etc.)
├── vercel.json             # Vercel serverless deployment configuration
├── .gitignore              # Git ignore rules (protects users.db, .env, uploads/)
├── README.md               # Documentation and setup guide
├── templates/
│   ├── signin.html         # Front page Log In interface
│   ├── signup.html         # User registration page
│   └── dashboard.html      # Protected dashboard, analysis view & Log Out
├── static/
│   └── style.css           # Stylish black & red responsive UI stylesheet
└── uploads/                # Local temporary storage for resume processing
```

---

## Windows Installation & Running Guide

### 1. Open Terminal (Command Prompt or PowerShell)
Navigate to the project root directory:
```bash
cd path\to\your\project
```

### 2. Create and Activate a Python Virtual Environment
```bash
# Create virtual environment named .venv
python -m venv .venv

# Activate on Windows (Command Prompt)
.venv\Scripts\activate

# Or activate on Windows (PowerShell)
.venv\Scripts\Activate.ps1
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Set Environment Variables (Optional)
```bash
# Windows Command Prompt
set FLASK_SECRET_KEY=your-secure-secret-key-here
set PORT=5000

# Windows PowerShell
$env:FLASK_SECRET_KEY="your-secure-secret-key-here"
$env:PORT="5000"
```

### 5. Run the Application
```bash
python app.py
```
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## Step-by-Step Testing Checklist

1. **Open the Website**:
   - Visit `http://127.0.0.1:5000`. You will see the **Sign In** page as the initial landing screen.
2. **Test Random Login Credentials (Rejected)**:
   - Enter a random email (`testrandom99@gmail.com`) and password (`pass1234`).
   - Click **Sign In**.
   - Verify that login is rejected with `"Invalid email or password."`.
3. **Create a New Account**:
   - Click **"Create an account"** to go to `/signup`.
   - Enter your Full Name, valid Email address, and Password (min 6 characters).
   - Click **Create Account**.
   - You will be redirected back to the Sign In page with a success message: `"Account created successfully! Please sign in with your credentials."`.
4. **Log In with the New Account**:
   - Enter the newly created email and password.
   - Click **Sign In**.
   - You will be redirected to the secure `/dashboard` showing your personalized name and email badge.
5. **Upload a PDF Resume**:
   - In the upload card, select or drag a `.pdf` resume file.
   - Click **"Analyze Resume Now"**.
   - Confirm that the resume score, extracted skills, key strengths, suggestions, and career matches appear immediately.
6. **Upload a DOCX Resume**:
   - Select a `.docx` resume file.
   - Click **"Analyze Resume Now"**.
   - Verify that the DOCX file parses cleanly and updates the dashboard analysis.
7. **Log Out**:
   - Click the **"Sign Out"** button in the top navbar.
   - Confirm you are redirected to the sign-in screen with `"You have been signed out successfully."`.
8. **Verify Protected Routes**:
   - Attempt to directly access `http://127.0.0.1:5000/dashboard`.
   - Verify that the app blocks access and redirects to `/signin` with `"Please sign in to access your dashboard."`.

---

## Deployment & Database Notice (Vercel / Cloud Hosting)

- **Local Development**: Uses local SQLite (`users.db`) and local upload buffering.
- **Serverless Hosting (e.g., Vercel)**:
  - Serverless functions are stateless and ephemeral. Files written to local disk (`users.db` or `uploads/`) will be recycled when containers spin down.
  - For long-term production hosting on Vercel, connect an external managed database (such as **Supabase PostgreSQL**, **Neon**, or **PlanetScale**) using an environment variable like `DATABASE_URL`, and use cloud object storage (such as **AWS S3**, **Cloudflare R2**, or **Google Cloud Storage**) for uploaded files.
