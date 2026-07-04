# EmbeddedCamps — User Stories

> Version 1.0 | Last updated: June 2026  
> Business context: EmbeddedCamps is a real, invite-only educational SaaS for AOSP / Android Platform Engineering bootcamps. There is no self-registration. Engineers contact EmbeddedCamps via WhatsApp (+201023460370), pay, and are manually enrolled by the admin.

---

## Roles

| Role | Description |
|------|-------------|
| **Public Visitor** | Anyone browsing the landing page before enrollment |
| **Engineer (Student)** | A paid, enrolled bootcamp participant |
| **Admin** | Abdullah — the instructor and sole platform administrator |

---

## Epic 1 — Public / Pre-Enrollment

### US-01 — Discover the platform
> **As a** potential engineer,  
> **I want to** browse the EmbeddedCamps landing page,  
> **so that** I can understand what courses are offered, who they are for, and how to enroll.

**Acceptance Criteria:**
- Landing page loads without authentication
- I can see all available courses with titles, descriptions, and technologies covered
- I can see pricing information, camp duration, and what I will learn
- I can see FAQs including payment methods (InstaPay / IBAN)
- A clear WhatsApp CTA button is visible on every section
- The page is SEO-optimized (meta tags, OG tags, structured data)
- Page loads in under 3 seconds on mobile

---

### US-02 — Initiate enrollment via WhatsApp
> **As a** potential engineer,  
> **I want to** contact EmbeddedCamps via WhatsApp,  
> **so that** I can express my interest and start the enrollment process.

**Acceptance Criteria:**
- Clicking "Enroll" or "Get Started" opens WhatsApp with a pre-filled message to +201023460370
- The pre-filled message identifies me as a prospective student and the course I'm interested in
- I receive human confirmation of available seats and payment instructions
- No account creation is required at this step

---

### US-03 — Pay and submit payment proof
> **As a** prospective engineer who wants to enroll,  
> **I want to** pay for the camp and send my payment screenshot,  
> **so that** the admin can verify and create my account.

**Acceptance Criteria:**
- I can pay via InstaPay to +201060178099 (Egyptian students)
- I can pay via IBAN bank transfer (international students)
- I send a screenshot of the payment to the admin via WhatsApp
- The admin confirms receipt and creates my account within 24 hours
- I receive my login credentials via WhatsApp after verification

---

## Epic 2 — Authentication

### US-04 — Log in to my account
> **As an** engineer with an account,  
> **I want to** log in securely,  
> **so that** I can access my enrolled camps and learning materials.

**Acceptance Criteria:**
- I can log in with email and password
- Login uses JWT access token (15 min) + httpOnly refresh cookie (30 days)
- Invalid credentials show a clear error message without revealing which field is wrong
- I am redirected to my dashboard on success
- A "Forgot password?" link is visible on the login page
- Password field has a show/hide toggle

---

### US-05 — Reset my password
> **As an** engineer who forgot my password,  
> **I want to** reset it via email,  
> **so that** I can regain access to my account.

**Acceptance Criteria:**
- Submitting my email sends a reset link if the account exists
- The email is sent within 60 seconds
- The reset token expires in 1 hour
- After successful reset, I am redirected to login
- The old token cannot be reused after reset

---

### US-06 — Stay logged in across sessions
> **As an** engineer,  
> **I want to** remain logged in between browser sessions,  
> **so that** I don't have to re-authenticate every visit.

**Acceptance Criteria:**
- My session persists via refresh token (30-day httpOnly cookie)
- The access token is silently refreshed when it expires
- If my refresh token expires or is revoked, I am redirected to login
- I can log out, which revokes my refresh token immediately

---

## Epic 3 — Engineer Dashboard & Learning

### US-07 — View my enrolled camps
> **As an** enrolled engineer,  
> **I want to** see all camps I am enrolled in,  
> **so that** I know what I have access to.

**Acceptance Criteria:**
- Dashboard shows all active enrollments as cards
- Each card shows camp title, progress percentage, start/end date, and days remaining
- If enrollment expires in < 30 days, a red warning badge is shown
- Expired enrollments are not shown (or marked clearly if I completed them)
- If I have no active enrollments, a WhatsApp CTA is shown to contact admin

---

### US-08 — Access a camp's curriculum
> **As an** enrolled engineer,  
> **I want to** view all sessions in my enrolled camp,  
> **so that** I can navigate the learning content.

**Acceptance Criteria:**
- I can open a camp and see all visible sessions in order
- Each session card shows the session number, title, and description
- I can click into a session to access its materials, labs, and quizzes
- Sessions hidden by the admin are not visible to me
- If my enrollment is expired, I see an access-locked screen with my certificate if I graduated

---

### US-09 — Watch a session video
> **As an** enrolled engineer,  
> **I want to** watch lecture videos in the session viewer,  
> **so that** I can learn the content of each module.

**Acceptance Criteria:**
- Videos are served via Bunny.net CDN with signed URLs (expire after 2 hours)
- The video player supports play, pause, seek, volume, and fullscreen
- Watching a video marks it as in-progress; completing it marks it as done
- I cannot download or share the signed video URL
- Videos load quickly and are buffered progressively

---

### US-10 — Track my progress through a session
> **As an** enrolled engineer,  
> **I want to** mark materials as complete and see my progress,  
> **so that** I know where I am in the curriculum.

**Acceptance Criteria:**
- Each video and PDF material has a "Mark as Complete" button
- Completing all materials in a session unlocks a green completion indicator
- My overall camp progress percentage is shown on the dashboard and in the camp view
- Progress is saved server-side and persists across devices
- Completing all materials + passing all quizzes in a camp unlocks the certificate

---

### US-11 — Download / view a PDF material
> **As an** enrolled engineer,  
> **I want to** view PDF documents attached to a session,  
> **so that** I can read supplementary material at my own pace.

**Acceptance Criteria:**
- PDFs are listed alongside video materials in order
- Clicking a PDF opens it in the browser or downloads it
- PDF access requires an active enrollment
- Viewing a PDF marks it as complete

---

### US-12 — Submit a lab assignment
> **As an** enrolled engineer,  
> **I want to** submit my lab work for a session,  
> **so that** the instructor can review it and provide feedback.

**Acceptance Criteria:**
- Each lab shows a title, description, and optional due date
- I can submit a lab by typing a solution or pasting a GitHub/drive link
- I can optionally attach a file URL
- I cannot submit a lab twice (one submission per lab per student)
- After submission, I see a "Pending Review" status
- Once the instructor reviews it, I see their written feedback and grade

---

### US-13 — Take a quiz
> **As an** enrolled engineer,  
> **I want to** take the quiz for a session,  
> **so that** I can test my understanding and track my mastery.

**Acceptance Criteria:**
- A quiz shows questions one at a time or all at once
- Each question has 2–4 multiple choice options
- I submit all answers at once
- The server grades the quiz (correct answers are never sent to my browser)
- I see my score, pass/fail status, and per-question breakdown immediately
- If I failed (below pass mark), I can retake the quiz
- A passed quiz is marked with a green badge in the session

---

### US-14 — Receive my certificate
> **As an** engineer who completed a camp,  
> **I want to** receive a digital certificate,  
> **so that** I can share proof of my achievement.

**Acceptance Criteria:**
- Certificate is issued automatically after 100% material completion + all quizzes passed
- Certificate is available on my dashboard under "Certificates"
- The certificate page shows my name, camp title, completion date, and a unique certificate ID
- The certificate has a public verification URL (`/verify/:id`) that anyone can visit
- The certificate URL does not require authentication to view
- I can share the verification link with employers or on LinkedIn

---

### US-15 — Verify a certificate
> **As a** recruiter or employer,  
> **I want to** verify that a certificate is genuine,  
> **so that** I can confirm a candidate's training.

**Acceptance Criteria:**
- The public `/verify/:id` page shows engineer name, camp title, and completion date
- It clearly indicates the certificate is issued by EmbeddedCamps
- No authentication is required to view it
- Invalid certificate IDs show a clear "not found" message

---

### US-16 — Update my profile
> **As an** engineer,  
> **I want to** update my name and password,  
> **so that** my account details are current.

**Acceptance Criteria:**
- I can change my display name
- I can change my password by providing my current password first
- Changes take effect immediately
- I cannot change my email address (admin controls this)

---

## Epic 4 — Admin: User Management

### US-17 — Create an engineer account after payment
> **As the** admin,  
> **I want to** manually create an account for an engineer after receiving payment,  
> **so that** they can log in and access their camp.

**Acceptance Criteria:**
- I can create a user by providing name, email, password, and role (Engineer or Admin)
- The user receives a secure temporary password which they can change
- I see the new user immediately in the user list
- Creating a duplicate email shows a clear error (not a crash)

---

### US-18 — Enroll an engineer in a camp
> **As the** admin,  
> **I want to** enroll an engineer in a specific camp with an optional expiry date,  
> **so that** they get time-limited access to the content.

**Acceptance Criteria:**
- I can select any active camp and set an optional expiry date
- Enrollment without an expiry date means permanent access
- I can view all camps an engineer is enrolled in
- If I try to enroll an already-enrolled engineer in the same camp, I see a clear error
- The engineer immediately sees the new camp on their dashboard without re-logging in

---

### US-19 — Search and paginate the user list
> **As the** admin,  
> **I want to** search for engineers by name or email and paginate the list,  
> **so that** I can manage a growing user base efficiently.

**Acceptance Criteria:**
- Search results update with a 400ms debounce
- Pagination shows 10 users per page with previous/next controls
- Total engineer count is shown
- Each user row shows name, email, role, account status, and action buttons

---

### US-20 — Deactivate an engineer account
> **As the** admin,  
> **I want to** deactivate an engineer's account,  
> **so that** I can revoke access if they violate terms or request deletion.

**Acceptance Criteria:**
- Deactivating immediately revokes all active refresh tokens
- The engineer is logged out on their next request
- The user remains in the database (soft delete) and can be reactivated
- Deactivated accounts are clearly marked in the user list

---

## Epic 5 — Admin: Content Management

### US-21 — Create a camp (cohort)
> **As the** admin,  
> **I want to** create a new camp with a title, description, dates, price, and status,  
> **so that** I can manage multiple bootcamp cohorts independently.

**Acceptance Criteria:**
- I can set status to UPCOMING, ACTIVE, or COMPLETED
- Start and end dates are required
- Price is stored in USD
- The camp is visible immediately in the admin camp list
- Student-facing listings only show camps in relevant states

---

### US-22 — Create and manage master sessions
> **As the** admin,  
> **I want to** create reusable master sessions (modules),  
> **so that** I can link the same session to multiple camps without duplicating content.

**Acceptance Criteria:**
- A master session has a title, description, and category (e.g. aospcamp, pcodamp)
- Once created, it lives in the global session library
- I can edit or delete a master session at any time
- Deleting cascades to all linked content (materials, labs, quizzes)

---

### US-23 — Link a master session to a camp
> **As the** admin,  
> **I want to** link master sessions to a specific camp with an order number,  
> **so that** engineers in that camp see a structured curriculum.

**Acceptance Criteria:**
- I can link any existing master session to a camp with a specific order number
- I can toggle visibility per session per camp (hidden sessions are not shown to engineers)
- The same master session can be linked to multiple camps
- I can reorder sessions within a camp

---

### US-24 — Upload a video to a session
> **As the** admin,  
> **I want to** upload videos to a master session,  
> **so that** enrolled engineers can watch the lecture.

**Acceptance Criteria:**
- I can upload video files (MP4, MOV, etc.) up to 5GB
- Videos are uploaded to Bunny.net storage
- A CDN URL is stored in the database
- Upload progress is shown
- I can delete a video (removes from Bunny storage and DB)

---

### US-25 — Create a lab for a session
> **As the** admin,  
> **I want to** create lab assignments for a master session,  
> **so that** engineers have hands-on exercises to complete.

**Acceptance Criteria:**
- A lab has a title, description, and optional due date
- Multiple labs can exist per session
- I can delete a lab (cascades to submissions)

---

### US-26 — Review lab submissions and provide feedback
> **As the** admin,  
> **I want to** view all lab submissions for a session and provide written feedback + grade,  
> **so that** engineers get personal guidance on their work.

**Acceptance Criteria:**
- I can navigate to a session's submission list from the admin panel
- Each submission shows engineer name, email, submission date, and content
- Submissions with a GitHub link show an "Open" button
- I can write feedback and optionally assign a grade (0–100)
- Once I submit feedback, the status changes from "Pending Review" to "Reviewed"
- I cannot modify feedback after submission (prevents grade manipulation)

---

### US-27 — Create a quiz for a session
> **As the** admin,  
> **I want to** create multiple-choice quizzes for a master session,  
> **so that** engineers can test their knowledge.

**Acceptance Criteria:**
- A quiz has a title, description, time limit, and pass mark (default 70%)
- Each question has 2–4 options with one correct answer
- I can add an explanation to each question (shown after submission)
- I can set question order
- Correct answers are never sent to the frontend (server-side grading only)

---

### US-28 — Monitor platform stats
> **As the** admin,  
> **I want to** see a dashboard with key platform metrics,  
> **so that** I can understand platform health at a glance.

**Acceptance Criteria:**
- Dashboard shows: total engineers, active enrollments, total camps, active camps
- Enrollment flow reminder is shown as a quick-reference card
- Quick action links: add engineer, create camp, manage sessions, view submissions

---

## Epic 6 — Non-Functional Requirements

### US-29 — Platform security
> **As the** platform owner,  
> **I want** all API endpoints to be properly secured,  
> **so that** student data and paid content are protected.

**Acceptance Criteria:**
- All content endpoints require JWT authentication
- Admin endpoints require ADMIN role (RBAC enforced server-side)
- Video URLs are signed and expire after 2 hours
- Passwords are hashed with bcrypt (min 12 rounds)
- Rate limiting on auth endpoints (login, forgot password, reset)
- httpOnly cookies prevent XSS token theft
- Input validation on all API endpoints (Zod schemas)
- SQL injection impossible via Prisma parameterized queries

---

### US-30 — Platform performance
> **As an** engineer in a slow internet region,  
> **I want** the platform to load quickly,  
> **so that** I can learn without frustration.

**Acceptance Criteria:**
- Landing page First Contentful Paint < 2 seconds
- Videos stream progressively from Bunny.net CDN (no server bandwidth cost)
- API list endpoints are paginated (max 20 items per page)
- Database queries use indexed fields for lookups
- Frontend uses Next.js SSR for landing page and client-side rendering for dashboard

---

### US-31 — Mobile-friendly experience
> **As an** engineer learning on my phone or tablet,  
> **I want** the platform to work on mobile,  
> **so that** I can study anywhere.

**Acceptance Criteria:**
- Landing page is fully responsive (mobile-first design)
- Dashboard, session viewer, and quiz pages work on mobile
- Video player is usable on mobile
- Touch-friendly buttons and inputs (min 44px tap targets)

---

## Enrollment Flow Summary (Business Process)

```
Engineer                    WhatsApp                    Admin                   Platform
   │                           │                           │                       │
   │── "I want to enroll" ──>  │                           │                       │
   │                           │── notifies admin ──────>  │                       │
   │                           │                           │── confirms price ──>  │
   │── pays InstaPay/IBAN ──>  │                           │                       │
   │── sends screenshot ─────> │── forwards to admin ───>  │                       │
   │                           │                           │── creates account ──> │
   │                           │                           │── enrolls in camp ──> │
   │                           │<── sends credentials ──── │                       │
   │<── receives login ─────── │                           │                       │
   │─────────────────────────────────── logs in ──────────────────────────────>    │
   │<─────────────────────────────── dashboard with camp ──────────────────────    │
```

---

## Out of Scope (Current Version)

- Self-registration (by design — manual enrollment only)
- Stripe / online payment integration (WhatsApp-based manual payment)
- Discussion forums or live chat within the platform
- Mobile native app (responsive web only)
- Multi-instructor support (single admin)
- Automatic enrollment reminders / email drip campaigns
- Video conferencing integration
