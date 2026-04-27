# Broskie.ai 🚀

**Broskie.ai** is a high-fidelity, AI-powered job application ecosystem designed to automate the grunt work of job hunting for candidates and simplify recruitment for HR managers. Built with a **"Brutal" design philosophy**, it offers a high-contrast, high-performance experience.

![Broskie.ai Landing Page](https://via.placeholder.com/1200x600/BEF264/000000?text=BROSKIE.AI+LANDING+PAGE)

## 🌟 Key Features

### For Candidates (The "Broskies")
- **AI Job Agent**: Let the agent scan thousands of jobs and apply on your behalf with a single query.
- **Automated Resume Tailoring**: Our AI analyzes the job description and your profile to generate a perfectly tailored resume for every application.
- **Match Scoring**: Get instant feedback on how well you fit a role with AI-generated match scores and detailed reasoning.
- **Real-time Notifications**: Receive instant alerts in your dashboard when an HR manager shortlists you.
- **Application Tracking**: A dedicated dashboard to monitor the status of every application in real-time.

### For HR Managers
- **Job Control Center**: Create, edit, and manage high-fidelity job postings with ease.
- **Intelligent Applicant Screening**: View applicants sorted by AI match scores. Review tailored resumes that highlight the most relevant skills for your specific role.
- **One-Click Pipeline Management**: Shortlist or reject candidates with a single click, triggering instant notifications for the applicants.
- **Dedicated HR Portal**: A secure, isolated environment for professional recruitment operations.

## 🎨 Design Philosophy: "The Brutal System"
Broskie.ai isn't just another boring SaaS. It uses a **Brutalism-inspired UI**:
- **High Contrast**: Pure white backgrounds with deep black borders (`border-[4px]`).
- **Neon Accents**: Vibrant `#BEF264` (Lime) and `#5E5CE6` (Indigo) for primary actions.
- **Brutal Shadows**: Thick, non-blurred shadows (`shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`) that make elements pop.
- **Bold Typography**: Heavy black fonts and uppercase tracking for an aggressive, modern feel.

## 🛠 Tech Stack
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database**: [Neon Postgres](https://neon.tech/) (Serverless)
- **Styling**: Tailwind CSS + Vanilla CSS
- **Authentication**: Custom JWT-based Auth with Role-Based Access Control (RBAC)
- **AI Integration**: Custom LLM integration for resume tailoring and job matching.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A Neon Postgres Database URL
- JWT Secret for session management

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/0day-Ashish/broskie-ai.git
   cd broskie-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (`.env.local`):
   ```env
   DATABASE_URL=your_neon_postgres_url
   JWT_SECRET=your_super_secret_key
   ```

4. Initialize the database:
   *(Note: The system automatically checks for table existence on startup via the `lib/db.ts` initialization logic.)*

5. Run the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure
- `app/`: Next.js App Router pages and API routes.
  - `api/auth/`: Login and Signup logic for Users and HRs.
  - `api/hr/`: Protected routes for HR operations.
  - `dashboard/`: The candidate's control center.
  - `hr/dashboard/`: The HR recruitment portal.
- `lib/`: Core utilities including database connection and shared logic.
- `components/`: Reusable Brutal-style UI components.

## 🤝 Contributing
Contributions are welcome! Whether it's a bug fix, feature request, or design improvement, feel free to open a PR.

## 📄 License
This project is licensed under the MIT License.

---
Built with ⚡ by the Broskie.ai Team.
