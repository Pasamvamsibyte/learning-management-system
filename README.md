# LMS Full-Stack Starter

A full-stack Learning Management System starter built with React, Vite, Express, PostgreSQL and JWT authentication. The supplied HTML prototypes are treated as visual/feature references, not as the production application.

## Features included
- Register and log in with securely hashed passwords
- JWT authentication and role-based access (`admin`, `teacher`, `student`)
- PostgreSQL persistence
- Course listing and creation (admin/teacher)
- Student course enrollment
- Assignment creation (teacher/admin)
- Assignment submissions (students)
- Teacher/admin grading of submissions
- Responsive dashboard UI
- Database schema and Docker Compose for PostgreSQL

## Requirements
- Node.js 20+
- npm
- Docker Desktop (recommended) or a local PostgreSQL server

## 1. Start the database
From the project root:

```bash
docker compose up -d db
```

This creates a PostgreSQL database named `lms_db` on port `5432`.

## 2. Configure the backend
```bash
cd backend
cp .env.example .env
npm install
npm run db:init
npm run dev
```

On Windows PowerShell, copy the environment file with:
```powershell
Copy-Item .env.example .env
```

The API runs at `http://localhost:5000`.

The `db:init` script applies `database/schema.sql` and creates the tables. It does not create a default admin. Register an account, then promote it to admin by running the SQL command shown below.

## 3. Start the frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## 4. Make your first admin
Register through the app. Then connect to PostgreSQL and run (replace the email):
```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```
Log out and log in again so the new role is included in the JWT.

With Docker:
```bash
docker exec -it lms-postgres psql -U lms_user -d lms_db
```

## API overview
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/courses`
- `POST /api/courses` (admin/teacher)
- `POST /api/courses/:id/enroll` (student)
- `GET /api/enrollments/mine`
- `GET /api/assignments`
- `POST /api/assignments` (admin/teacher)
- `POST /api/assignments/:id/submit` (student)
- `GET /api/assignments/:id/submissions` (admin/teacher, course owner/admin)
- `PATCH /api/submissions/:id/grade` (admin/teacher, course owner/admin)
- `GET /api/dashboard`

## Security and production notes
This is a functional development starter, not a production deployment. Before public launch, add rate limiting, email verification/password reset, refresh-token/session management, file storage (S3-compatible storage, not local disk), audit logging, migrations, automated tests, HTTPS, and production secrets management. JWT tokens are stored in `localStorage` in this starter for simplicity; consider secure, HttpOnly cookies for a production deployment. Do not expose database credentials or JWT secrets in frontend code.

## Extended features now included
- **Materials:** authenticated course file uploads and downloads. Supported formats include PDF, images, text, ZIP, Office documents and MP4; 20 MB maximum per file.
- **Quizzes:** teachers create multiple-choice quizzes; students submit attempts and the server calculates scores.
- **Attendance:** teachers create course sessions and save present/absent/late records; students can view their attendance.
- **Notifications:** database-backed notifications for new materials, quizzes and assignments, with read/unread controls.
- **Certificates:** PDF certificate generation after the student's assignments in that course are all submitted and graded.
- **Payments:** optional Razorpay order creation and server-side signature verification. Paid courses cannot be enrolled through the free enrollment endpoint.

## Online deployment checklist
1. Deploy the frontend to a static host and set `VITE_API_BASE` to your public API URL, including `/api` (example: `https://api.example.com/api`).
2. Deploy the backend to a Node-capable host and set `CLIENT_ORIGIN` to the exact public frontend origin, `DATABASE_URL` to a managed PostgreSQL connection string, and `JWT_SECRET` to a unique random secret.
3. Run `npm run db:init` against the production database as a controlled deployment step.
4. **File storage:** configure `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY` for private S3-compatible object storage in online deployments. `S3_ENDPOINT` is optional for providers such as Cloudflare R2 or MinIO. If S3 variables are absent, the app falls back to local disk for development only; ephemeral host disks can lose files during redeploys.
5. **Payments:** configure Razorpay test keys first, then test with provider test mode. Set live keys only after validating the complete payment flow and legal/tax requirements. Never put `RAZORPAY_KEY_SECRET` in frontend variables.
6. Enable HTTPS, configure database backups, rate limiting, logging/monitoring, email verification and password reset. Add a proper payment webhook and reconciliation job before accepting real payments.
7. Use a managed database and object storage in production. Restrict CORS to the deployed frontend and never commit `.env` files.

## Quiz authoring format in the current UI
In Learning tools, enter one question per line in this format:
`Question text | option A;option B;option C | correct option index`
The correct option index starts at `0` (so `1` means the second option). This compact input is for the starter UI; the API validates questions and calculates scores on the server.

## Notes and current limitations
- Payments require Razorpay credentials; without them, the API intentionally returns a configuration error.
- Certificates currently use a simple completion rule: a course must contain at least one assignment, and all course assignments must have submissions with grades. You can change this policy for your institution.
- Local-disk upload is appropriate for development only unless your host provides persistent storage. For production, use private object storage and short-lived signed download URLs.
- The starter has not been externally penetration-tested or audited. Run the smoke-test checklist below before a demo.

## Smoke-test checklist
- Register a student and confirm login/logout works.
- Promote a separate account to teacher/admin using SQL; confirm students cannot create courses.
- Create a course, enroll a student, and verify a paid course rejects free enrollment.
- Upload a supported file as the course teacher and download it as an enrolled student; confirm an un-enrolled student is blocked.
- Create a quiz, attempt it as a student, and confirm score is calculated by the API.
- Create an attendance session, mark records, and confirm the student sees the result.
- Create an assignment, submit and grade it, then request and download a certificate.
- Configure Razorpay test credentials, complete a test checkout, and confirm enrollment occurs only after valid signature verification.
- Test API errors, mobile layout, database restart, and backup/restore before deployment.

## Optional Render deployment blueprint
The included `render.yaml` is a starting blueprint for a hosted API, static frontend and PostgreSQL database. Before deploying, review the database plan and costs, confirm the generated API hostname matches `VITE_API_BASE`, set the frontend origin in the API's `CLIENT_ORIGIN`, and add private object-storage credentials. After first deploy, run the schema initialization command against the hosted database. Do not use live payment keys until test-mode checkout has been verified.

## Automated smoke test
With PostgreSQL initialized and the API running, execute:
```bash
cd backend
npm run test:smoke
```
It checks API health, database connectivity, student registration/login token, current-user lookup, course listing, dashboard, assignments and notifications. It creates a new smoke-test user each run.
