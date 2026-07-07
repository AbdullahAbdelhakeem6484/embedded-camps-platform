# 🎓 Embedded Camps Educational Platform

Welcome to the **Embedded Camps** platform—a production-grade, highly optimized educational ecosystem designed to master low-level platform internals and high-performance algorithms. 

This platform is structured from the ground up to support high-intensity, hands-on master training cohorts, focusing primarily on our two flagship tracks:
1. **AOSPCamp (AOSP & AAOS Internals):** Deep-dive system programming, HAL development, SELinux, custom AOSP boot, Binder IPC, OTA updates, and Android Automotive OS (AAOS).
2. **PCodeCamp (DSA & Problem Solving):** Algorithmic rigor, data structures, runtime optimization, Big Tech interview preparation, and optimal C++ systems implementation.

---

## 🌓 Feature Highlights & Architecture

### 1. Dynamic Theme System (Light & Night Mode)
*   **Dual Mode:** Native dark-by-default environment with a toggle to switch instantly to light mode.
*   **Zero-Flash (FOIT Protection):** Implements an inline header script reading local theme state from `localStorage` before paint. This eliminates the annoying flash of bright light common in next.js static-hydration wrappers.
*   **Semantic CSS Variables:** Custom variables defined in `globals.css` map to Tailwind v4 colors, enabling seamless live theme transition across elements.

### 2. Master Session Architecture (DRY Content Strategy)
*   **Upload Once, Reuse Everywhere:** Avoid repeating uploads or creating duplicates for different camp cohorts (e.g. `aospcamp_July_2026` vs `aospcamp_Sep_2026`).
*   **Master Library:** Create "Master Sessions" independently, then easily link them to any active camp.
*   **Category-based Tagging:** Master Sessions are organized by tracks: `aospcamp`, `pcodamp` (PCodeCamp), `AICamp`, `EFluencyCamp`, and `General`. You can filter, find, and edit sessions in one click.

### 3. Progressive Content Delivery & Session Visibility
*   **Timed Access Toggles:** Keep linked sessions *Hidden* by default. As the weeks progress for a specific camp cohort, toggle session visibility with a single click (eye icon) to reveal it to those students.
*   **Multi-Video Player:** Sessions support multiple stacked short videos. Students can watch and check off individual videos sequentially.
*   **Rich Sidebars:** Materials are dynamically grouped into **Materials (PDF/Links)**, **Resources (Useful Links)**, **Labs**, and **Quizzes**.

### 4. Smart Lab Solution Workaround
*   **Workflow:** Instead of managing complex per-student toggle overrides, create a dedicated Master Session named `Lab Solutions`.
*   Link this master session to your camp and keep it **Hidden** by default.
*   Once the submission deadline passes, toggle the session's visibility ON to instantly reveal code and walkthrough solutions to all students in that specific cohort.

### 5. Instant QR Certification Engine
*   **Automated Issuance:** When a student marks all videos, PDFs, and links as complete, completes all labs, and passes all quizzes, the platform automatically generates a certificate of completion.
*   **Unique QR Verification:** Each certificate has a unique verifiable serial code and custom generated QR code that links back to a secure validation page.

### 6. Video Security & Protected Range-Streaming
*   **Robust Copy Protection:** Disables context menu/right-click on video players and prevents manual downloading.
*   **Cost-Efficient Scaling:** Integrated automatically with Youtube unlisted links and custom video loaders.

---

## 🚀 Quick Start

### 1. Install Dependencies
Run the install command in the root directory:
```bash
npm run install:all
```

### 2. Setup Database
The platform supports PostgreSQL and SQLite. For easier local testing:
1. Ensure your connection settings match in `backend/.env`.
2. Push migrations and seed data:
   ```bash
   npm run db:setup
   ```
This will automatically register a master admin:
*   **Email:** `admin@embeddedcamps.com`
*   **Password:** `admin123`

### 3. Start Development Servers
Run the concurrent dev script:
```bash
npm run dev
```
*   **Frontend Client:** [http://localhost:3000](http://localhost:3000)
*   **Backend Server:** [http://localhost:5000](http://localhost:5000)

---

## 🛠️ Complete Administrative Playbook

### 1. Managing Camps (Cohorts)
*   Go to **Camps** and click "Create Camp". Fill in details like title (e.g. `pcodecamp_July_2026`), dates, and price.
*   Click **Edit** on a camp card to modify duration, descriptions, or enrollment status.
*   Click **Delete** to cleanly remove a camp.

### 2. Organizing Master Sessions
*   Go to **Sessions** -> **Create Session**.
*   Select the **Category / Track** (e.g., `aospcamp` or `pcodamp`).
*   Enter the title (e.g., `AOSP Module 01: Binder IPC Internals`) and description.
*   Filter through sessions using the category dropdown selector at the top.

### 3. Adding Materials & Content
*   Inside a Master Session, click **Manage Content**.
*   **Add Videos:** Paste unlisted YouTube links or host files locally. Multiple videos will display cleanly in sequence.
*   **Add Materials & Resources:** Upload PDFs or paste external article links.
*   **Add Labs & Quizzes:** Build custom interactive hands-on challenges.

### 4. Link & Toggle Visibility
*   Go to **Camps** -> Click **Manage Sessions** on your target cohort.
*   Click **Link Master Session** to hook a master session to this camp.
*   Toggle visibility using the **Eye Icon** (Slashed eye = Hidden, Open eye = Visible to student).

### 5. Manually Enrolling Students
*   Go to **Users** -> **Add User** (Create accounts for students paying via WhatsApp/offline methods).
*   Click **Enroll** on the user row, choose their cohort camp, and define their active access expiration date.

---

## 🎥 Video Hosting & Cost Efficiency Strategy

Educational video assets are massive. Hosting raw `.mp4` video streams directly on a basic VPS server will quickly saturate network bandwidth when multiple students watch concurrently, crashing your server.

**The Recommended Scalable Approach:**
1. Upload your class video files to YouTube.
2. Configure video privacy as **Unlisted** (this ensures the videos are hidden from YouTube search, user recommendations, and public view, and are only accessible by you).
3. Copy the URL and add it to your Session Materials in the Admin dashboard.
4. The frontend player embeds it using a sleek custom wrapper. YouTube bears 100% of the server and massive video delivery costs for free!

---

## 📁 Project Structure

*   `/backend`: Node.js, Express, TypeScript, Prisma ORM.
*   `/frontend`: Next.js 14 App Router, Tailwind CSS v4, Lucide Icons.
*   `/backend/uploads`: Media assets, unlisted files, and PDF resources.
