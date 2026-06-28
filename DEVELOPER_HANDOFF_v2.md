# Family Health Command Center — Complete Developer Handoff Document

> **Version:** 2.0  
> **Date:** June 28, 2026  
> **Stack:** Next.js 14+ (App Router) · Express.js · MongoDB · Node.js · JavaScript  
> **Purpose:** Full specification for the development team to build this product from scratch with zero ambiguity.
>
> **v2.0 Changes:** Google OAuth login added to patient & doctor portals · Forgot Password pages added for patients, doctors, and admins · Dual-admin system (Super Admin + Regular Admin) with permission tiers, modification alerts, session timeout, and Super Admin approval for admin password resets · Subscription price & plan feature management restricted to Super Admin only.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Design System](#3-design-system)
4. [Typography](#4-typography)
5. [Spacing & Layout System](#5-spacing--layout-system)
6. [All Pages — Patient Side](#6-all-pages--patient-side)
7. [All Pages — Doctor Portal](#7-all-pages--doctor-portal)
8. [Complete Route Map](#8-complete-route-map)
9. [Database Models (MongoDB Schemas)](#9-database-models-mongodb-schemas)
10. [REST API Endpoints (Express)](#10-rest-api-endpoints-express)
11. [Component Library](#11-component-library)
12. [Admin Panel — Full Specification](#12-admin-panel--full-specification)
13. [Key Features & Business Logic](#13-key-features--business-logic)
14. [Third-Party Integrations](#14-third-party-integrations)
15. [Mobile-First & Accessibility Requirements](#15-mobile-first--accessibility-requirements)
16. [Folder Structure](#16-folder-structure)
17. [Environment Variables](#17-environment-variables)
18. [Developer Quick-Start Checklist](#18-developer-quick-start-checklist)

---

## 1. PROJECT OVERVIEW

**Product Name:** Family Health Command Center  
**Tagline:** "One app for your entire family's health"

### What It Is

A web platform for Indian families to manage multi-generational health records, track medicines, prepare for doctor visits, get AI health insights, and find/book doctors nearby.

It has **two separate portals**:

- **Patient Portal** — for families to manage health
- **Doctor Portal** — for doctors to list themselves, manage appointments, respond to reviews, and upgrade their plan

### Target Users

- **Primary:** Indian families with elderly members (parents/grandparents aged 55+)
- **Secondary:** Doctors (cardiologists, diabetologists, neurologists, etc.) in metro cities

### Key Value Props

- Multi-member family health records in one place
- WhatsApp-native reminders for medicines
- Find best doctors by disease, near you, with real patient reviews
- Doctors can manage bookings and grow their practice

---

## 2. TECH STACK & ARCHITECTURE

### Frontend

```
Framework:        Next.js 14+ with App Router
Language:         JavaScript (JSX) — no TypeScript required
Styling:          Tailwind CSS v4
UI Components:    Radix UI primitives (@radix-ui/react-*)
Icons:            lucide-react
Charts:           recharts
Animations:       motion (motion/react) — NOT framer-motion
Notifications:    sonner (toast library)
Fonts:            Google Fonts — Fraunces (display) + Inter (body)
Date handling:    date-fns
HTTP Client:      axios
OAuth:            next-auth v5 (Google OAuth provider for patient + doctor login)
```

### Backend

```
Runtime:          Node.js 20+
Framework:        Express.js
Language:         JavaScript
Database:         MongoDB (via Mongoose ODM)
Auth:             JWT (jsonwebtoken) + bcryptjs
File Storage:     Cloudinary (for medical documents/images)
Email:            Nodemailer (for OTP and notifications)
WhatsApp:         Twilio WhatsApp API or WATI.io
Payment:          Razorpay (for doctor plan upgrades)
```

### Infrastructure

```
Frontend Hosting: Vercel
Backend Hosting:  Railway or Render (Node + Express)
Database:         MongoDB Atlas
File Storage:     Cloudinary
Domain:           Custom domain with SSL
```

### Architecture Pattern

```
Next.js App Router (Frontend)
         ↕  REST API calls (axios)
Express.js API Server
         ↕  Mongoose ODM
MongoDB Atlas
```

---

## 3. DESIGN SYSTEM

### Color Palette — EXACT HEX VALUES (use these, nothing else)

```css
/* Primary Colors */
--cream: #f7f4ef /* Page background */ --navy: #0d1b2a
  /* Primary dark, buttons, text */ --pulse-red: #e8403a
  /* Danger, alerts, emergency */ --sage-green: #4a9e7f
  /* Success, health positive */ --warm-amber: #e9a84c
  /* Warnings, ratings, premium */ /* Surface Colors */
  --surface-white: #ffffff /* Cards, sidebar */
  --surface-secondary: #ede9e2 /* Tags, inactive backgrounds */
  /* Text Colors */ --text-primary: #0d1b2a
  /* Main headings and body */ --text-secondary: #4a5568
  /* Subtext, descriptions */ --text-muted: #8a96a3
  /* Placeholder, hints, metadata */ /* Border */
  --border-color: rgba(13, 27, 42, 0.1) /* All card borders */
  /* Status Fill Backgrounds */ --success-fill: #e6f4ef
  /* Green tinted background */ --danger-fill: #fef2f2
  /* Red tinted background */ --warning-fill: #fef9ec
  /* Amber tinted background */ /* Integrations */
  --whatsapp-green: #25d366 /* WhatsApp buttons only */
  /* Doctor Portal (dark sidebar) */ --doctor-sidebar: #0d1b2a
  /* Sidebar background */
  --doctor-sidebar-active: rgba(255, 255, 255, 0.15)
  /* Active nav item */
  --doctor-sidebar-text: rgba(255, 255, 255, 0.5)
  /* Inactive nav text */;
```

### Shadow System

```css
--shadow-subtle: 0 1px 3px rgba(13, 27, 42, 0.08)
  /* Hover states */ --shadow-medium: 0 4px 16px
  rgba(13, 27, 42, 0.1) /* Cards */ --shadow-strong: 0 8px 32px
  rgba(13, 27, 42, 0.14) /* Modals */;
```

### Border Radius System

```css
--radius-input: 6px /* Form inputs */ --radius-card-sm: 8px
  /* Small tags, badges */ --radius-card-md: 12px
  /* Medium cards */ --radius-card-lg: 16px /* Main cards */
  --radius-modal: 24px /* Bottom sheets, modals */
  --radius-pill: 999px /* Pill buttons, status badges */;
```

---

## 4. TYPOGRAPHY

### Font Import (add to globals.css or \_document)

```css
@import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap");
```

### Usage Rules

| Use Case                   | Font     | Weight         | Size    |
| -------------------------- | -------- | -------------- | ------- |
| Hero headings, page titles | Fraunces | 700 (Bold)     | 28–36px |
| Section headings           | Fraunces | 600 (SemiBold) | 20–24px |
| Card titles                | Fraunces | 600            | 16–18px |
| Doctor names, stat values  | Fraunces | 700            | varies  |
| Body text, descriptions    | Inter    | 400 (Regular)  | 14–16px |
| Labels, nav items          | Inter    | 500 (Medium)   | 13–14px |
| Tiny metadata, timestamps  | Inter    | 400            | 11–12px |
| Buttons                    | Inter    | 600 (SemiBold) | 14px    |

### Minimum Font Size

**Never go below 12px.** Prefer 14px for body. 16px for form inputs.

---

## 5. SPACING & LAYOUT SYSTEM

### Base Unit: 4px

All spacing is multiples of 4px.

```
4px  = xs (gap between icon and label)
8px  = sm (internal card padding tight)
12px = md (tag padding)
16px = lg (section gaps)
20px = xl
24px = 2xl (card padding standard)
32px = 3xl (section padding)
40px = 4xl
48px = 5xl (minimum tap target height)
```

### Page Layout

```
Patient Portal:
  - Sidebar width (desktop): 240px (fixed left)
  - Main content max-width: 800px (centered)
  - Page padding: 16px mobile / 24px tablet / 32px desktop
  - Bottom nav height (mobile): 64px

Doctor Portal:
  - Sidebar width (desktop): 256px (fixed left)
  - Main content max-width: 896px
  - Top breadcrumb bar height (desktop): 56px
```

### Breakpoints (Tailwind defaults, fine to use)

```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
```

---

## 6. ALL PAGES — PATIENT SIDE

---

### 6.1 Landing Page `/`

**Purpose:** Marketing page to convert visitors to sign up.

**Sections (top to bottom):**

1. **Navbar** — Logo ("Family Health●" in Fraunces), nav links, "Sign In" + "Get Started" CTA buttons
2. **Hero** — Large Fraunces heading, subtext, two CTA buttons (Get Started → /signup, For Doctors → /doctor), illustration/graphic area
3. **Problem Statement** — "Managing family health is hard" with 3 pain point cards
4. **Features Grid** — 6 feature cards with emoji icons: Health Records, Medicine Tracker, Doctor Finder, AI Insights, Emergency Info, WhatsApp Reminders
5. **How It Works** — 3-step process: Create family → Add members → Track health
6. **Doctor Section** — "Are you a doctor? Join free" banner → /doctor
7. **Footer** — Links, copyright

**Key Design Details:**

- Background: `#F7F4EF` (cream)
- Hero heading uses Fraunces 700, ~40px
- CTA buttons: navy background, white text, 12px rounded, 48px height
- Feature cards: white bg, subtle border, icon in colored rounded box

---

### 6.2 Onboarding — Signup `/signup`

**Purpose:** Create account (patient/family user).

**Form Fields:**

- Full Name (text input)
- Mobile Number (tel input, Indian format +91)
- Email Address (email input)
- Password (password input, show/hide toggle)
- Confirm Password

**Google Login:**

- "Continue with Google" button — shown **above** the form fields with an "OR" divider below it
- Uses `next-auth` Google provider
- On first Google login → skip password fields, redirect directly to `/onboarding/family` to complete profile
- On returning Google login → redirect to `/app`
- Button style: white background, 1px border `rgba(13,27,42,0.15)`, Google "G" logo icon (use official SVG), text "Continue with Google", full-width, 48px height, border-radius 12px

**Design:**

- Split screen on desktop: Left = dark navy with branding/features, Right = form
- Progress indicator not needed (this is step 0)
- "Already have an account? Sign in" link
- "Forgot your password?" link → `/forgot-password`
- After submit → redirect to `/onboarding/family`

---

### 6.2a Forgot Password — Patient `/forgot-password`

**Purpose:** Allow patient to reset their password via email OTP.

**Step 1 — Request Reset:**

- Email input ("Enter your registered email address")
- "Send Reset Link" button (primary, full-width)
- "Back to Sign In" link
- Design: Same split-screen layout as signup (dark navy left, form right)
- On submit → show step 2

**Step 2 — Enter OTP:**

- "Check your email" heading
- Subtext: "We've sent a 6-digit code to [email]"
- 6-digit OTP input (individual boxes, auto-advance on each digit)
- "Resend code" link (disabled for 60s, shows countdown)
- "Verify" button

**Step 3 — New Password:**

- New Password input (show/hide toggle)
- Confirm New Password input
- Password strength indicator (weak/medium/strong)
- "Reset Password" button
- On success → toast "Password reset successful!" → redirect to `/signup` (sign in tab)

**API calls:**
- `POST /auth/forgot-password` — sends OTP to email
- `POST /auth/verify-otp` — validates OTP, returns reset token
- `POST /auth/reset-password` — sets new password using reset token

---

### 6.3 Onboarding — Family Setup `/onboarding/family`

**Purpose:** Name the family unit.

**Form Fields:**

- Family Name (e.g., "The Sharma Family")
- City / Location
- Primary Language (dropdown: Hindi, English, Marathi, Tamil, Telugu, Kannada, Bengali, Gujarati)

**Progress:** Step 1 of 4 (show step indicator)  
**Next:** `/onboarding/members`

---

### 6.4 Onboarding — Add Members `/onboarding/members`

**Purpose:** Add family members.

**For each member:**

- Name
- Relationship (Self, Spouse, Father, Mother, Son, Daughter, Grandfather, Grandmother, Other)
- Date of Birth
- Blood Group (A+, A-, B+, B-, O+, O-, AB+, AB-)
- Known Conditions (multi-select chips: Diabetes, Hypertension, Heart Disease, Asthma, Thyroid, None)

**UI:**

- "Add Another Member" button
- Can skip, can remove added members
- Avatars auto-generated from initials with color coding:
  - Self: `#4A9E7F`
  - Spouse: `#E9A84C`
  - Father/Mother: `#E8403A`
  - Others: `#0D1B2A`

**Progress:** Step 2 of 4  
**Next:** `/onboarding/reminder`

---

### 6.5 Onboarding — Reminder Setup `/onboarding/reminder`

**Purpose:** Configure WhatsApp medicine reminders.

**Options:**

- Enable WhatsApp Reminders (toggle)
- WhatsApp Number (pre-filled from signup, editable)
- Preferred reminder times (multi-select: Morning 8AM, Afternoon 1PM, Evening 6PM, Night 10PM)
- Language for reminders (dropdown)

**Progress:** Step 3 of 4  
**Next:** `/onboarding/upload`

---

### 6.6 Onboarding — Upload Documents `/onboarding/upload`

**Purpose:** Optional first document upload.

**UI:**

- Drag & drop area
- "Upload Later" skip button
- Accepted types: PDF, JPG, PNG
- Max size: 10MB per file
- Document types: Lab Report, Prescription, X-Ray/Scan, Vaccination, Insurance, Other

**Progress:** Step 4 of 4  
**Next:** `/app` (main dashboard)

---

### 6.7 Dashboard `/app`

**Layout:** Uses `DashboardLayout` with left sidebar (desktop) + bottom nav (mobile).

**Sidebar Navigation Items:**
| Icon | Label | Route |
|---|---|---|
| Home | Dashboard | /app |
| FolderOpen | Health Records | /app/records |
| Pill | Medicine Tracker | /app/medicines |
| Stethoscope | Doctor Visit Prep | /app/doctor-prep |
| UserSearch | Find Doctors | /app/doctors |
| Users | Family Members | /app/settings?tab=family |
| BarChart3 | Health Insights | /app/insights |
| Settings | Settings | /app/settings |

**Sidebar Bottom:**

- Family name + avatar stack
- Storage indicator (X GB of 5 GB)
- Plan badge (Family Plan)

**Dashboard Page Content:**

1. **Header** — "Good morning, [Name]" + date
2. **Family Member Selector** — Horizontal scroll of avatar pills, click to filter data for that member
3. **Quick Stats Row** — 4 cards: Next Appointment, Active Medicines, Pending Reports, Last Checkup
4. **Upcoming Reminders** — Next 3 medicine reminders with time and medicine name
5. **Recent Health Records** — Last 3 uploaded documents
6. **Quick Actions Grid** — Add Medicine, Upload Report, Book Doctor, Emergency Info
7. **Health Alerts** — Any overdue medicines or upcoming appointments

---

### 6.8 Health Records `/app/records`

**Purpose:** Store and manage all medical documents.

**Features:**

- Filter by: Family Member, Document Type, Date Range
- Search by document name / condition
- Grid/List view toggle
- Upload new document (modal with drag-drop)
- Each record card shows: Document type icon, name, member name, date, file size, view/download/delete actions

**Document Types & Colors:**
| Type | Color |
|---|---|
| Lab Report | `#4A9E7F` (green) |
| Prescription | `#0D1B2A` (navy) |
| X-Ray/Scan | `#8A96A3` (muted) |
| Vaccination | `#E9A84C` (amber) |
| Insurance | `#E8403A` (red) |
| Other | `#EDE9E2` |

**Upload Modal Fields:**

- File upload (PDF/JPG/PNG, max 10MB)
- Document Name
- Document Type (dropdown)
- Family Member (dropdown)
- Date of document
- Notes (optional)

---

### 6.9 Medicine Tracker `/app/medicines`

**Purpose:** Track all medicines across all family members.

**Page Sections:**

1. **Today's Schedule** — All medicines due today across family, grouped by time slot (Morning/Afternoon/Evening/Night), with check-off toggles
2. **Medicine List** — All active medicines, filterable by family member
3. **Add Medicine** button → opens modal

**Medicine Card Fields:**

- Medicine name + strength
- Family member
- Dosage (e.g., "1 tablet twice daily")
- Timing (Morning / Afternoon / Evening / Night — multi-select)
- Start date / End date (or "Ongoing")
- Prescribing doctor
- WhatsApp reminder toggle
- Stock count + low stock alert (warn when <5 days remaining)

**Status Badges:**

- Active → green `#E6F4EF`
- Completed → grey `#EDE9E2`
- Overdue (missed today) → red `#FEF2F2`

---

### 6.10 Doctor Visit Prep `/app/doctor-prep`

**Purpose:** Help users prepare for upcoming doctor appointments.

**Page Sections:**

1. **Upcoming Visit Card** — Doctor name, hospital, date/time, "Start Prep" button
2. **Symptom Tracker** — Add symptoms with severity (1-5), duration, notes
3. **Questions List** — Pre-filled AI-suggested questions + user can add their own
4. **Documents to Carry** — Checklist of relevant records to bring
5. **Medicine List to Show** — Current medicines auto-pulled from medicine tracker
6. **Previous Visit Notes** — Past visit summaries

**"Start Prep" Modal:**

- Select doctor / appointment
- Auto-populate relevant family member's data
- Generate PDF summary (download button)

---

### 6.11 Find Doctors `/app/doctors`

**Purpose:** Find best doctors near you by disease/specialty.

**Page Layout:**

1. **Search Bar** — "Search by disease, doctor name, or specialty…"
2. **Disease Quick Chips** — Scrollable pills: Diabetes, High Blood Pressure, Knee Pain, Back Pain, Heart Disease, Eye Strain, Anxiety, Thyroid, Asthma, Arthritis, Migraine, Skin Allergy
3. **Specialty Filter Pills** — All, Cardiologist, Neurologist, Orthopedic, Eye Doctor, Pediatrician, Diabetologist (with icons)
4. **Sort Dropdown** — Relevance, Rating, Distance, Fee: Low to High, Availability
5. **Filter Panel** (collapsible) — Max Fee slider (₹300–₹2000), Minimum Rating (Any/4+/4.5+/4.8+)
6. **"Are you a doctor?" Banner** — Dark navy, links to `/doctor`
7. **Doctor Cards List**

**Doctor Card contains:**

- Avatar (initials, color-coded)
- Verified badge (✓ if verified)
- Name + Specialty label + Hospital
- Fee per visit
- Star rating + review count
- Distance + Experience years
- Next available slot (green text)
- Condition tags (first 3, +N more)
- Languages spoken
- "View Profile →" link → `/app/doctors/[id]`

---

### 6.12 Doctor Profile `/app/doctors/[id]`

**Purpose:** Full profile of a single doctor for a patient.

**Sections:**

1. **Hero Card** — Avatar, name, verified badge, specialty, hospital, distance, rating, experience, fee pills, Save/Favourite button, Call Clinic / WhatsApp / Share buttons
2. **Booking Panel** — Dark navy card, "Book Appointment", date display, time slot picker, "Confirm Appointment" button
3. **Tab Bar** — Overview | Reviews (N)

**Overview Tab:**

- About text
- Conditions Treated (tag chips)
- Education & Training (bullet list)
- Awards & Recognition
- Languages Spoken (green chips)
- Location (address + map placeholder)

**Reviews Tab:**

- Average rating (large) + star breakdown bar chart (like Google Maps)
- "Write a Review" form — interactive star picker, name input, text area, submit
- Review cards — avatar, name, date, stars, text, "Helpful (N)" button (once per user)

---

### 6.13 Health Insights `/app/insights`

**Purpose:** AI-powered health trends and insights.

**Note:** This is a "Beta" feature (show amber "Beta" badge in nav).

**Page Sections:**

1. **Member Selector** — Switch between family members
2. **Health Score Card** — Circular gauge, overall score, last updated
3. **Charts Section:**
   - Blood Pressure trend (line chart, last 90 days)
   - Blood Sugar trend (line chart)
   - Weight trend (area chart)
   - Medicine adherence (bar chart, % taken vs missed per week)
4. **AI Insights Cards** — 3-4 generated insight cards (e.g., "BP has been rising over last 2 weeks")
5. **Recommendations** — Lifestyle/diet suggestions based on conditions

**Chart Library:** recharts  
**Chart Colors:**

- BP Systolic: `#E8403A`
- BP Diastolic: `#E9A84C`
- Blood Sugar: `#4A9E7F`
- Weight: `#0D1B2A`
- Adherence: `#4A9E7F`

---

### 6.14 Emergency Info `/app/emergency`

**Purpose:** Critical health info accessible in under 5 seconds.

**Always visible without scrolling:**

- Family member selector (prominent)
- Blood Group (large, bold)
- Critical Allergies (red badge)
- Emergency Contact Name + Phone (tap-to-call)

**Below fold:**

- Current Medications list
- Known Conditions list
- Hospital preference
- Doctor's emergency number
- Insurance details

**Design Rules:**

- This page uses red accents more prominently
- "Call Emergency Contact" button must be full-width, 56px height, red background
- Page background stays cream, but critical items have red borders

---

### 6.15 Notifications `/app/notifications`

**Purpose:** All app notifications.

**Notification Types & Icons:**
| Type | Icon | Color |
|---|---|---|
| Medicine reminder | Pill | `#4A9E7F` |
| Appointment upcoming | Calendar | `#0D1B2A` |
| Document uploaded | FolderOpen | `#E9A84C` |
| Health insight | BarChart3 | `#4A9E7F` |
| System message | Bell | `#8A96A3` |

**Features:**

- Filter tabs: All / Reminders / Appointments / System
- Mark individual as read (tap)
- "Mark all read" button
- Delete notification (swipe on mobile, × on desktop)
- Unread count badge on bell icon in sidebar

---

### 6.16 Settings `/app/settings`

**Tabs:**

1. **Profile** — Edit name, phone, email, profile photo
2. **Family Members** — Add/edit/remove family members (same fields as onboarding)
3. **Reminders** — WhatsApp number, reminder times, language
4. **Privacy & Security** — Change password, 2FA toggle, data export, delete account
5. **Notifications** — Toggle each notification type on/off
6. **Subscription** — Current plan, upgrade options

---

## 7. ALL PAGES — DOCTOR PORTAL

All doctor portal pages share the `DoctorLayout` with a **dark navy sidebar**.

---

### 7.1 Doctor Auth `/doctor`

**Two modes (tabs to toggle):**

**Sign In:**

- "Continue with Google" button — shown at top with "OR" divider below
  - Same style as patient Google button (white bg, Google "G" SVG, full-width, 48px)
  - On Google sign in: if doctor profile exists → `/doctor/overview`; if new Google doctor → pre-fill email from Google, continue with Step 1 of Create Profile form
- Email input
- Password input (show/hide toggle)
- Forgot Password link → `/doctor/forgot-password`
- Sign In button → redirect to `/doctor/overview`

**Create Profile (2-step):**

Step 1:

- Full Name
- Email
- Phone Number
- Specialty (dropdown — 16 options)
- Medical Registration Number (MCI format)
- Experience (years)

Step 2:

- Hospital / Clinic Name
- City
- Consultation Fee (₹)
- Password + Confirm Password *(skip if signing up via Google)*
- Terms agreement note

**Design:** Split screen — left dark navy with branding + "2400+ verified doctors", right = form.

---

### 7.1a Forgot Password — Doctor `/doctor/forgot-password`

**Purpose:** Allow a doctor to reset their password via email OTP.

**Exact same 3-step flow as patient Forgot Password (Section 6.2a)**, with these differences:

- Dark navy left panel with doctor branding (not patient branding)
- Uses doctor-specific API endpoints (see Section 10 — Auth Doctor):
  - `POST /doctor/auth/forgot-password`
  - `POST /doctor/auth/verify-otp`
  - `POST /doctor/auth/reset-password`
- On success → redirect to `/doctor` (sign in tab)

---

### 7.2 Doctor Overview `/doctor/overview`

**Stats Row (4 cards):**

- Today's Patients (count, with breakdown confirmed/pending)
- Average Rating (X.X ★)
- Profile Views (this month)
- Monthly Revenue (₹)

**Upgrade Banner:** Dark gradient card — "You're on the Free Plan · 8/10 bookings used" + "Upgrade to Pro →" button

**Today's Schedule:** Compact list of today's appointments with time + status

**Recent Activity Feed:** New bookings, new reviews, cancellations

**Recent Reviews:** 2 latest reviews in cards

**Quick Links Grid:** Edit Profile, All Reviews, Appointments, Plans

---

### 7.3 Doctor Appointments `/doctor/appointments`

**Filters:**

- Search (patient name / condition)
- Type filter: All / In-Person / Video
- Status tabs: All / Confirmed / Pending / Cancelled (with count badges)

**Appointment List:** Scrollable cards showing:

- Patient avatar (initials + color)
- Patient name + age + condition
- Date + Time + Type (video/in-person icon)
- Status badge

**Detail Pane (side panel on desktop, full-screen on mobile):**

- Opens when appointment clicked
- All appointment details
- Doctor's private notes (textarea, saved locally)
- Action buttons: Confirm, Mark Complete, Cancel
- Contact buttons: WhatsApp (green), Call (grey)

---

### 7.4 Doctor Reviews `/doctor/reviews`

**Summary Card:**

- Large rating number (e.g., 4.9)
- Star rating display
- Star breakdown bar chart (5★ → 1★ with % fill bars, clickable to filter)
- Three metrics: Response Rate, Avg Response Time, Recommend Rate

**Review Cards:**

- Patient avatar + name + date + stars
- Review text
- "Your Reply" section (indented, green left border) — if replied
- "Reply" button → inline textarea → Post Reply
- Flag button (report inappropriate)
- "Helpful (N)" button — increments count, one click per session

**Simulate New Review Section (for demo/testing):**

- Star picker
- Name input
- Text area
- "Add Demo Review" button

---

### 7.5 Doctor Edit Profile `/doctor/profile`

**Two Modes:** Edit mode (default) + Preview mode (shows public-facing view)

**Sections (all editable):**

1. **Profile Photo** — Upload button (JPG/PNG, max 2MB)
2. **Basic Information** — Full Name, Specialty dropdown, Display Tagline, Experience, Medical Reg. No.
3. **Consultation Fees** — In-Person fee (₹), Video Consult fee (₹)
4. **About / Bio** — Textarea, 600 char limit with counter
5. **Practice Location** — Hospital/Clinic Name, Full Address
6. **Conditions Treated** — Toggle chips (20 conditions, multi-select)
7. **Languages Spoken** — Add/remove tags
8. **Education & Training** — Add/remove list items (text input + Plus button + Trash button per row)
9. **Awards & Recognition** — Same add/remove pattern
10. **Appointment Slots** — Add/remove time slots (text input + plus), displayed as dark navy pills

**Save button:** Sticky or bottom CTA, shows "Saved!" confirmation for 2.5s

---

### 7.6 Doctor Plans `/doctor/plans`

**Three Plans:**

| Feature               | Free     | Pro                   | Premium                 |
| --------------------- | -------- | --------------------- | ----------------------- |
| Price                 | ₹0       | ₹999/mo (₹799 annual) | ₹2499/mo (₹1999 annual) |
| Bookings/month        | 10       | 100                   | Unlimited               |
| Search placement      | Standard | Priority              | Top of disease search   |
| Analytics             | ✗        | Basic                 | Advanced                |
| WhatsApp reminders    | ✗        | ✓                     | ✓                       |
| Video consultation    | ✗        | ✓                     | ✓                       |
| Account manager       | ✗        | ✗                     | ✓                       |
| Custom clinic page    | ✗        | ✗                     | ✓                       |
| Featured Doctor badge | ✗        | ✗                     | ✓                       |

**Billing Toggle:** Monthly / Annual (annual saves 20%)

**Plan Card Design:**

- Free: `#EDE9E2` header background
- Pro: `#0D1B2A` (dark navy) header — "Most Popular" badge
- Premium: `#FEF9EC` (warm) header — "Best Value" badge + Crown icon

**Checkout Modal:**

- Shows plan name + price
- Card number input
- Expiry + CVV
- "Pay via Razorpay" button
- "🔒 Secured by Razorpay · Cancel anytime" footer

**Billing History Table:**

- Date, Plan, Amount, Status (Active/Paid), Download invoice button

---

## 8. COMPLETE ROUTE MAP

### Patient Routes

```
/                          → Landing page
/signup                    → Onboarding signup (+ Google OAuth)
/forgot-password           → Patient forgot password (3-step OTP flow)
/onboarding/family         → Family setup
/onboarding/members        → Add family members
/onboarding/reminder       → Reminder setup
/onboarding/upload         → Document upload

/app                       → Dashboard (protected)
/app/records               → Health records
/app/medicines             → Medicine tracker
/app/doctor-prep           → Doctor visit prep
/app/doctors               → Find doctors listing
/app/doctors/[id]          → Doctor profile detail
/app/insights              → Health insights (Beta)
/app/emergency             → Emergency info
/app/notifications         → Notifications
/app/settings              → Settings
```

### Doctor Routes

```
/doctor                    → Doctor auth (login / signup + Google OAuth)
/doctor/forgot-password    → Doctor forgot password (3-step OTP flow)
/doctor/overview           → Doctor dashboard home
/doctor/appointments       → Appointments management
/doctor/reviews            → Patient reviews
/doctor/profile            → Edit doctor profile
/doctor/plans              → Plans & billing
```

### Route Protection

- All `/app/*` routes require patient authentication (JWT)
- All `/doctor/*` routes (except `/doctor`) require doctor authentication (separate JWT)
- Redirect unauthenticated users to respective login pages

---

## 9. DATABASE MODELS (MongoDB Schemas)

### User (Patient)

```javascript
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true },
  phone: String,
  passwordHash: String,               // null if Google-only account
  googleId: String,                   // from Google OAuth (null if email/password account)
  authProvider: { type: String, enum: ['email', 'google'], default: 'email' },
  familyId: ObjectId (ref: 'Family'),
  role: { type: String, default: 'patient' },
  createdAt: Date,
  updatedAt: Date
}
```

### Family

```javascript
{
  _id: ObjectId,
  familyName: String,          // "The Sharma Family"
  city: String,
  primaryLanguage: String,
  createdBy: ObjectId (ref: 'User'),
  plan: {
    type: { type: String, enum: ['free', 'family'], default: 'free' },
    storageUsedMB: Number,
    storageLimitMB: { type: Number, default: 5120 }   // 5GB
  },
  createdAt: Date
}
```

### FamilyMember

```javascript
{
  _id: ObjectId,
  familyId: ObjectId (ref: 'Family'),
  name: String,
  relationship: {
    type: String,
    enum: ['self','spouse','father','mother','son','daughter','grandfather','grandmother','other']
  },
  dateOfBirth: Date,
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'] },
  knownConditions: [String],
  avatarColor: String,          // hex color
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  allergies: [String],
  createdAt: Date
}
```

### HealthRecord

```javascript
{
  _id: ObjectId,
  familyId: ObjectId (ref: 'Family'),
  memberId: ObjectId (ref: 'FamilyMember'),
  documentName: String,
  documentType: {
    type: String,
    enum: ['lab_report','prescription','xray_scan','vaccination','insurance','other']
  },
  fileUrl: String,              // Cloudinary URL
  filePublicId: String,         // Cloudinary public_id
  fileSizeKB: Number,
  mimeType: String,
  documentDate: Date,
  notes: String,
  uploadedBy: ObjectId (ref: 'User'),
  createdAt: Date
}
```

### Medicine

```javascript
{
  _id: ObjectId,
  familyId: ObjectId (ref: 'Family'),
  memberId: ObjectId (ref: 'FamilyMember'),
  medicineName: String,
  strength: String,             // "500mg"
  dosage: String,               // "1 tablet twice daily"
  timings: [{ type: String, enum: ['morning','afternoon','evening','night'] }],
  startDate: Date,
  endDate: Date,                // null if ongoing
  isOngoing: Boolean,
  prescribingDoctor: String,
  stockCount: Number,
  whatsappReminder: Boolean,
  status: { type: String, enum: ['active','completed','paused'], default: 'active' },
  createdAt: Date
}
```

### MedicineLog

```javascript
{
  _id: ObjectId,
  medicineId: ObjectId (ref: 'Medicine'),
  memberId: ObjectId (ref: 'FamilyMember'),
  scheduledTime: Date,
  takenAt: Date,                // null if not taken
  status: { type: String, enum: ['taken','missed','skipped'] },
  createdAt: Date
}
```

### Doctor

```javascript
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true },
  phone: String,
  passwordHash: String,               // null if Google-only account
  googleId: String,                   // from Google OAuth (null if email/password account)
  authProvider: { type: String, enum: ['email', 'google'], default: 'email' },
  role: { type: String, default: 'doctor' },
  specialty: String,
  tagline: String,
  hospital: String,
  address: String,
  city: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  consultationFee: Number,
  videoConsultFee: Number,
  experience: Number,
  medicalRegNo: String,
  isVerified: Boolean,
  about: String,
  languages: [String],
  conditions: [String],
  education: [String],
  awards: [String],
  appointmentSlots: [String],   // ["10:00 AM", "4:30 PM"]
  avatarColor: String,
  plan: {
    type: { type: String, enum: ['free','pro','premium'], default: 'free' },
    billingCycle: { type: String, enum: ['monthly','annual'] },
    expiresAt: Date
  },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  profileViews: { type: Number, default: 0 },
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment

```javascript
{
  _id: ObjectId,
  doctorId: ObjectId (ref: 'Doctor'),
  patientFamilyId: ObjectId (ref: 'Family'),
  patientMemberId: ObjectId (ref: 'FamilyMember'),
  patientName: String,
  patientPhone: String,
  patientAge: Number,
  condition: String,
  appointmentDate: Date,
  timeSlot: String,             // "4:30 PM"
  type: { type: String, enum: ['in-person','video'] },
  status: { type: String, enum: ['pending','confirmed','completed','cancelled'], default: 'pending' },
  doctorNote: String,
  fee: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Review

```javascript
{
  _id: ObjectId,
  doctorId: ObjectId (ref: 'Doctor'),
  familyId: ObjectId (ref: 'Family'),
  memberId: ObjectId (ref: 'FamilyMember'),
  authorName: String,
  rating: { type: Number, min: 1, max: 5 },
  text: String,
  helpfulCount: { type: Number, default: 0 },
  helpfulBy: [ObjectId],        // user IDs who clicked helpful
  doctorReply: String,
  doctorRepliedAt: Date,
  isFlagged: Boolean,
  createdAt: Date
}
```

### Notification

```javascript
{
  _id: ObjectId,
  userId: ObjectId,             // either patient user or doctor
  userType: { type: String, enum: ['patient','doctor'] },
  type: { type: String, enum: ['appointment','review','system','payment','cancellation','reminder'] },
  title: String,
  body: String,
  isRead: { type: Boolean, default: false },
  actionUrl: String,
  createdAt: Date
}
```

---

## 10. REST API ENDPOINTS (Express)

### Base URL: `/api/v1`

### Auth — Patient

```
POST   /auth/signup              Create patient account (email/password)
POST   /auth/login               Login, returns JWT
POST   /auth/google              Google OAuth — creates or logs in patient via Google token
POST   /auth/forgot-password     Send OTP to email
POST   /auth/verify-otp          Validate OTP, returns short-lived reset token
POST   /auth/reset-password      Reset password with reset token
GET    /auth/me                  Get current user (protected)
```

### Family

```
POST   /family                   Create family (after signup)
GET    /family                   Get current user's family
PATCH  /family                   Update family details
```

### Family Members

```
GET    /family/members           Get all members
POST   /family/members           Add member
PATCH  /family/members/:id       Update member
DELETE /family/members/:id       Remove member
```

### Health Records

```
GET    /records                  Get all records (query: memberId, type, dateFrom, dateTo)
POST   /records                  Upload new record (multipart/form-data → Cloudinary)
GET    /records/:id              Get single record
DELETE /records/:id              Delete record (also delete from Cloudinary)
```

### Medicines

```
GET    /medicines                Get all medicines (query: memberId, status)
POST   /medicines                Add medicine
PATCH  /medicines/:id            Update medicine
DELETE /medicines/:id            Delete medicine
POST   /medicines/:id/log        Log taken/missed for today
GET    /medicines/today          Today's schedule across all members
```

### Doctors (public listing)

```
GET    /doctors                  List doctors (query: specialty, city, minRating, maxFee, search)
GET    /doctors/:id              Get doctor profile (public)
POST   /doctors/:id/view         Increment profile views
```

### Appointments

```
POST   /appointments             Book appointment (patient)
GET    /appointments/my          Patient's appointments
PATCH  /appointments/:id/cancel  Cancel appointment (patient)
```

### Reviews

```
POST   /reviews                  Submit review for a doctor
POST   /reviews/:id/helpful      Mark review as helpful
GET    /doctors/:id/reviews      Get all reviews for a doctor
```

### Auth — Doctor

```
POST   /doctor/auth/signup           Doctor registration (email/password)
POST   /doctor/auth/login            Doctor login, returns JWT
POST   /doctor/auth/google           Google OAuth — creates or logs in doctor via Google token
POST   /doctor/auth/forgot-password  Send OTP to doctor's registered email
POST   /doctor/auth/verify-otp       Validate OTP, returns short-lived reset token
POST   /doctor/auth/reset-password   Reset password with reset token
GET    /doctor/auth/me               Get current doctor
```

### Doctor Dashboard (all protected — doctor JWT)

```
GET    /doctor/appointments      Get all appointments (query: status, type, date)
PATCH  /doctor/appointments/:id  Update appointment status (confirm/complete/cancel)
PATCH  /doctor/appointments/:id/note  Add private note

GET    /doctor/reviews           Get all reviews
POST   /doctor/reviews/:id/reply Reply to a review
POST   /doctor/reviews/:id/flag  Flag a review

PATCH  /doctor/profile           Update profile fields
POST   /doctor/profile/photo     Upload profile photo (Cloudinary)

GET    /doctor/analytics         Get analytics data (views, bookings, revenue)

POST   /doctor/plans/upgrade     Initiate Razorpay payment
POST   /doctor/plans/webhook     Razorpay payment webhook
GET    /doctor/plans/billing     Get billing history
```

### Notifications

```
GET    /notifications            Get user notifications
PATCH  /notifications/:id/read   Mark as read
PATCH  /notifications/read-all   Mark all as read
DELETE /notifications/:id        Delete notification
```

---

## 11. COMPONENT LIBRARY

> **Rule:** Every component listed below must be built as a standalone reusable file inside `/components/`. No page should contain inline one-off UI that could be a component. If something appears on 2+ pages, it is a component.

---

### 11.1 BASE UI COMPONENTS (`/components/ui/`)

These are the atomic building blocks. Build them first before any page.

---

#### `Button` — `/components/ui/Button.jsx`

**Props:**

```javascript
variant    : 'primary' | 'secondary' | 'danger' | 'ghost' | 'whatsapp' | 'success'
size       : 'sm' | 'md' | 'lg'
fullWidth  : boolean (default false)
loading    : boolean — shows spinner, disables click
disabled   : boolean
leftIcon   : React node
rightIcon  : React node
onClick    : function
type       : 'button' | 'submit' | 'reset'
```

**Visual Specs:**

```
variant=primary   → bg #0D1B2A, text white, hover bg #1a2d47
variant=secondary → bg #EDE9E2, text #0D1B2A, hover bg #e0dbd3
variant=danger    → bg #E8403A, text white, hover bg #c73530
variant=ghost     → bg transparent, border 1.5px solid rgba(13,27,42,0.15), text #4A5568, hover bg #F7F4EF
variant=whatsapp  → bg #25D366, text white, hover bg #1da851
variant=success   → bg #4A9E7F, text white, hover bg #3d8a6d

size=sm  → height 32px, padding 8px 14px, font-size 12px, border-radius 8px
size=md  → height 40px, padding 10px 18px, font-size 14px, border-radius 10px
size=lg  → height 48px, padding 12px 24px, font-size 14px, border-radius 12px

disabled → opacity 0.4, cursor not-allowed
loading  → show <Loader2 className="animate-spin h-4 w-4" /> replacing left icon
fullWidth → width 100%
```

**States:** default → hover → active (scale 0.98) → disabled → loading

---

#### `Card` — `/components/ui/Card.jsx`

**Props:**

```javascript
padding   : 'sm' | 'md' | 'lg' (default 'md')
hoverable : boolean — adds hover shadow
clickable : boolean — adds cursor pointer + active scale
className : string (for overrides)
children  : React node
```

**Visual Specs:**

```
background   : #FFFFFF
border       : 1px solid rgba(13,27,42,0.08)
border-radius: 16px
padding sm   : 12px
padding md   : 20px  ← default
padding lg   : 24px

shadow default : 0 1px 3px rgba(13,27,42,0.06)
shadow hover   : 0 6px 24px rgba(13,27,42,0.12)  (when hoverable=true)
transition     : box-shadow 200ms ease
```

---

#### `Badge` — `/components/ui/Badge.jsx`

**Props:**

```javascript
variant : 'success' | 'warning' | 'danger' | 'muted' | 'navy' | 'blue' | 'amber'
size    : 'sm' | 'md' (default 'md')
dot     : boolean — show colored dot before text
icon    : React node (optional left icon)
```

**Visual Specs:**

```
variant=success → bg #E6F4EF, text #4A9E7F
variant=warning → bg #FEF9EC, text #E9A84C
variant=danger  → bg #FEF2F2, text #E8403A
variant=muted   → bg #EDE9E2, text #8A96A3
variant=navy    → bg #0D1B2A, text white
variant=amber   → bg #E9A84C, text #0D1B2A

size=sm → padding 2px 8px,  font-size 11px, border-radius 999px
size=md → padding 4px 10px, font-size 12px, border-radius 999px
font-weight: 500 (medium)
```

---

#### `Avatar` — `/components/ui/Avatar.jsx`

**Props:**

```javascript
name      : string — used to generate initials (first letter of each word, max 2)
color     : string — hex background color
imageUrl  : string — if provided, shows image instead of initials
size      : 'xs' | 'sm' | 'md' | 'lg' | 'xl'
shape     : 'circle' | 'rounded' (default 'circle')
showBorder: boolean — white 2px border (for stacked avatars)
```

**Visual Specs:**

```
size=xs  → 24×24px, font-size 10px
size=sm  → 32×32px, font-size 12px
size=md  → 40×40px, font-size 14px
size=lg  → 56×56px, font-size 18px
size=xl  → 80×80px, font-size 24px

shape=circle  → border-radius 999px
shape=rounded → border-radius 12px

text color  : always white
font-family : Fraunces
font-weight : 700
```

**Initials logic:**

```javascript
// "Ramesh Sharma" → "RS"
// "Priya" → "P"
const initials = name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
```

**Member color mapping (use these exact colors):**

```javascript
const MEMBER_COLORS = {
  self        : '#4A9E7F',
  spouse      : '#E9A84C',
  father      : '#E8403A',
  mother      : '#E8403A',
  son         : '#0D1B2A',
  daughter    : '#8A96A3',
  grandfather : '#4A5568',
  grandmother : '#4A5568',
  other       : '#0D1B2A',
}
```

---

#### `StarRating` — `/components/ui/StarRating.jsx`

**Two modes — display only + interactive picker:**

**Props:**

```javascript
value       : number (0–5, supports decimals for display)
onChange    : function (only needed for interactive mode)
interactive : boolean (default false)
size        : 'sm' | 'md' | 'lg'
showValue   : boolean — show numeric value next to stars
showCount   : number — show "(312)" review count
```

**Visual Specs:**

```
size=sm → h-3.5 w-3.5 (14px)
size=md → h-4 w-4    (16px)
size=lg → h-5 w-5    (20px)

filled star  : fill #E9A84C, stroke #E9A84C
empty star   : fill none, stroke #EDE9E2
hover state  : fill #E9A84C (for interactive mode, highlights up to hovered star)
gap between stars: 2px

showValue → font-weight 700, color #0D1B2A, font-size same as star size
showCount → color #8A96A3, font-size 12px
```

---

#### `Input` — `/components/ui/Input.jsx`

**Props:**

```javascript
label       : string
placeholder : string
value       : string
onChange    : function
type        : 'text' | 'email' | 'tel' | 'password' | 'number' | 'date'
error       : string — shows red error message below
hint        : string — shows grey hint below
leftIcon    : React node
rightIcon   : React node — e.g. show/hide password eye
disabled    : boolean
required    : boolean
```

**Visual Specs:**

```
height          : 44px minimum (48px for large forms — accessibility)
background      : #F7F4EF
border          : 1px solid rgba(13,27,42,0.12)
border-radius   : 12px
padding         : 12px 16px
font-size       : 14px
color           : #0D1B2A
placeholder     : color #8A96A3

focus state     :
  border-color  : rgba(13,27,42,0.40)
  box-shadow    : 0 0 0 3px rgba(13,27,42,0.08)
  outline       : none

error state     :
  border-color  : #E8403A
  box-shadow    : 0 0 0 3px rgba(232,64,58,0.10)

label           : font-size 14px, font-weight 500, color #0D1B2A, margin-bottom 6px
error message   : font-size 12px, color #E8403A, margin-top 4px
hint text       : font-size 12px, color #8A96A3, margin-top 4px

leftIcon  → padding-left 44px, icon at left-12px center
rightIcon → padding-right 44px, icon at right-12px center
```

---

#### `Textarea` — `/components/ui/Textarea.jsx`

Same styling as `Input` but:

```
min-height   : 80px
resize       : vertical only (resize: vertical)
padding      : 12px 16px
line-height  : 1.6
```

Same props as Input plus:

```javascript
rows         : number (default 3)
maxLength    : number — shows counter "X / 600"
```

---

#### `Select` — `/components/ui/Select.jsx`

Same styling as `Input` but:

```
appearance   : none (hide default arrow)
Add custom ChevronDown icon at right-12px
cursor       : pointer
option text  : color #0D1B2A
```

Props:

```javascript
label    : string
options  : [{ value: string, label: string }]
value    : string
onChange : function
error    : string
disabled : boolean
```

---

#### `Toggle` / Switch — `/components/ui/Toggle.jsx`

**Props:**

```javascript
checked   : boolean
onChange  : function
label     : string (optional, shown to right)
size      : 'sm' | 'md'
disabled  : boolean
```

**Visual Specs:**

```
size=sm: track 36×20px, thumb 16×16px
size=md: track 44×24px, thumb 20×20px

track OFF : bg #EDE9E2
track ON  : bg #4A9E7F
thumb     : bg white, box-shadow 0 1px 3px rgba(0,0,0,0.2)
transition: 150ms ease (thumb slides, track color fades)
border-radius: 999px (pill shape)
```

---

#### `Modal` — `/components/ui/Modal.jsx`

**Props:**

```javascript
isOpen    : boolean
onClose   : function
title     : string
children  : React node
footer    : React node (optional — buttons area)
size      : 'sm' | 'md' | 'lg' (default 'md')
bottomSheet: boolean — mobile bottom sheet behavior
```

**Visual Specs:**

```
overlay         : fixed inset-0, bg rgba(0,0,0,0.50), z-index 50
  → closes modal on click

content (desktop):
  bg              : white
  border-radius   : 24px
  padding         : 24px
  max-width sm    : 400px
  max-width md    : 520px
  max-width lg    : 680px
  shadow          : 0 20px 60px rgba(13,27,42,0.20)
  position        : centered (transform: translate(-50%, -50%))

content (mobile — bottomSheet=true):
  position        : fixed bottom-0 left-0 right-0
  border-radius   : 24px 24px 0 0
  max-height      : 90vh
  overflow-y      : auto
  padding-bottom  : env(safe-area-inset-bottom) + 16px

header:
  title → Fraunces, 20px, font-weight 600, color #0D1B2A
  close button → top-right, × icon, p-2, rounded-xl, hover bg #F7F4EF

footer:
  border-top      : 1px solid rgba(13,27,42,0.06)
  padding-top     : 16px
  display         : flex, gap 8px, justify-end
```

---

#### `Skeleton` — `/components/ui/Skeleton.jsx`

Used as loading placeholder for all list content.

**Props:**

```javascript
variant : 'text' | 'card' | 'avatar' | 'button' | 'doctor-card' | 'record-card' | 'medicine-card'
count   : number (repeat N times, default 1)
```

**Visual Specs:**

```
background      : linear-gradient(90deg, #EDE9E2 25%, #F7F4EF 50%, #EDE9E2 75%)
background-size : 200% 100%
animation       : shimmer 1.5s infinite  (keyframe: bg-position 200% → -200%)
border-radius   : same as the element it mimics
```

**Skeleton variants to build:**

```
text        → height 14px, border-radius 4px, width variable
avatar      → circle, sizes matching Avatar component
card        → full Card shape with inner text lines
doctor-card → 80px left avatar block + 3 text lines + bottom row
record-card → icon block + 2 text lines + date
medicine-card → icon + 2 lines + badge
```

---

#### `EmptyState` — `/components/ui/EmptyState.jsx`

Shown when a list has no items.

**Props:**

```javascript
icon     : React node or emoji string
title    : string
subtitle : string
action   : { label: string, onClick: function } (optional CTA button)
```

**Visual Specs:**

```
container : text-center, padding 48px 24px
icon/emoji: font-size 48px, margin-bottom 12px
title     : Fraunces, 18px, color #0D1B2A
subtitle  : Inter, 14px, color #8A96A3, margin-top 4px
action    : Button variant=primary, size=md, margin-top 16px
```

---

#### `Toast` — use `sonner` library

**Configuration (add to root layout):**

```jsx
import { Toaster } from 'sonner'

// In root layout:
<Toaster
  position="bottom-right"
  toastOptions={{
    style: {
      background: '#0D1B2A',
      color: 'white',
      borderRadius: '12px',
      fontSize: '14px',
    },
    duration: 3000,
  }}
/>
```

**Usage in components:**

```javascript
import { toast } from 'sonner'

toast.success('Medicine added!')           // green check
toast.error('Something went wrong')        // red ×
toast.info('Profile updated')              // blue info
toast('Appointment booked for 4:30 PM')   // neutral
```

---

#### `ProgressBar` — `/components/ui/ProgressBar.jsx`

Used for storage indicator, onboarding steps, medicine adherence.

**Props:**

```javascript
value     : number (0–100)
color     : string (hex, default '#4A9E7F')
height    : number (px, default 6)
animated  : boolean (animate fill on mount)
showLabel : boolean (show "46%" text)
```

**Visual Specs:**

```
track     : bg #EDE9E2, border-radius 999px
fill      : bg [color prop], border-radius 999px
height    : [height prop]px
animation : width transition 600ms ease-out on mount
```

---

#### `SearchBar` — `/components/ui/SearchBar.jsx`

**Props:**

```javascript
placeholder : string
value       : string
onChange    : function
onClear     : function (shows × when value is not empty)
className   : string
```

**Visual Specs:**

```
height          : 48px
background      : white
border          : 1px solid rgba(13,27,42,0.12)
border-radius   : 16px
padding         : 0 16px 0 48px (left space for search icon)
box-shadow      : 0 2px 8px rgba(13,27,42,0.06)
Search icon     : lucide <Search>, left-16px, color #8A96A3, h-5 w-5
Clear button    : lucide <X>, right-16px, appears only when value !== ""
focus border    : rgba(13,27,42,0.30)
```

---

#### `FilterChip` — `/components/ui/FilterChip.jsx`

Used for specialty filters, disease quick-chips.

**Props:**

```javascript
label    : string
icon     : React node (optional)
active   : boolean
onClick  : function
```

**Visual Specs:**

```
active=false : bg white, border 1px solid rgba(13,27,42,0.10), text #4A5568, hover bg #F7F4EF
active=true  : bg #0D1B2A, border transparent, text white
border-radius: 12px
padding      : 8px 14px
font-size    : 13px
height       : 36px
gap (icon + text): 6px
transition   : 150ms
```

---

#### `TabBar` — `/components/ui/TabBar.jsx`

Used everywhere tabs appear (reviews, settings, appointments filter, etc.)

**Props:**

```javascript
tabs     : [{ id: string, label: string, count?: number }]
active   : string (active tab id)
onChange : function(id)
variant  : 'pill' | 'underline' (default 'pill')
```

**Visual Specs:**

**variant=pill (most common):**

```
container   : bg #EDE9E2, padding 4px, border-radius 12px, display flex
tab default : text #8A96A3, padding 8px 16px, border-radius 8px
tab active  : bg white, text #0D1B2A, box-shadow 0 1px 4px rgba(13,27,42,0.10)
font-size   : 13px, font-weight 500
count badge : bg #E8403A, text white, 16×16px circle, font-size 10px
transition  : 150ms
```

**variant=underline:**

```
container   : border-bottom 2px solid #EDE9E2
tab default : text #8A96A3, padding 10px 0, margin-right 24px
tab active  : text #0D1B2A, border-bottom 2px solid #0D1B2A (overlays container border)
font-weight : 600
```

---

#### `Divider` — `/components/ui/Divider.jsx`

```
horizontal : height 1px, bg rgba(13,27,42,0.06), margin 16px 0
vertical   : width 1px, height 100%, bg rgba(13,27,42,0.06)
```

---

### 11.2 LAYOUT COMPONENTS (`/components/layout/`)

---

#### `DashboardLayout` — `/components/layout/DashboardLayout.jsx`

**Structure:**

```
<div> root — min-height: 100vh, bg: #F7F4EF
  <aside> sidebar — desktop only (hidden on mobile)
    Logo
    Family name + avatar stack
    Navigation list
    Storage indicator
  </aside>

  <div> mobile top bar — mobile only (lg:hidden)
    Hamburger menu button
    App name (Fraunces)
    Bell icon (with unread dot)

  <div> mobile drawer — conditionally rendered
    Overlay (closes on click)
    Slide-out panel (same content as sidebar)
    Close × button

  <main> content area — lg:pl-[240px]
    <Outlet /> (Next.js: {children})

  <nav> mobile bottom nav — mobile only, fixed bottom
    5 items: Home, Records, Medicines, Family, More
    Active item: color #0D1B2A
    Inactive: color #8A96A3
    Height: 64px + safe-area-inset-bottom
```

**Sidebar Nav Item — active state:**

```
active   : bg #0D1B2A, text white, border-radius 10px
inactive : text #4A5568, hover bg #F7F4EF
padding  : 10px 12px
icon size: 20px (h-5 w-5)
font-size: 14px
```

**Storage Indicator:**

```
"2.3 GB of 5 GB used" — grey text 12px
ProgressBar below — color #4A9E7F, height 6px
Plan badge — "Family Plan" — bg #E6F4EF, text #4A9E7F
```

---

#### `DoctorLayout` — `/components/layout/DoctorLayout.jsx`

**Structure:**

```
<div> root — min-height: 100vh, bg: #F7F4EF
  <aside> sidebar — 256px, bg #0D1B2A, fixed
    Logo (white)
    Doctor card (initials, name, specialty, rating, plan badge)
    Navigation list
    Upgrade nudge card (amber gradient)
    "← View patient side" link
    Sign Out button

  <div> mobile top bar — bg #0D1B2A
    Hamburger (white icon)
    Page title (Fraunces, white)
    Bell icon (white, with red dot)

  <main> lg:pl-[256px]
    Breadcrumb bar (desktop only) — bg white, border-bottom
    <Outlet />
```

**Sidebar Nav Item — active state:**

```
active   : bg rgba(255,255,255,0.15), text white, font-weight 500
inactive : text rgba(255,255,255,0.50), hover text white, hover bg rgba(255,255,255,0.08)
padding  : 10px 12px
icon     : 16px, active=white, inactive=rgba(255,255,255,0.40)
```

**Doctor Card in Sidebar:**

```
bg        : rgba(255,255,255,0.10)
padding   : 14px
radius    : 16px
avatar    : 44×44px, rounded-xl, color from doctor specialty
name      : white, 14px, font-weight 600, truncate
specialty : rgba(255,255,255,0.50), 12px, truncate
rating row: star icon (#E9A84C filled) + "4.9" + "(312)" + plan badge
plan badge: bg rgba(255,255,255,0.10), text rgba(255,255,255,0.60)
```

**Upgrade Nudge Card:**

```
bg        : linear-gradient(135deg, rgba(233,168,76,0.20), rgba(74,158,127,0.20))
border    : 1px solid rgba(255,255,255,0.10)
radius    : 16px
padding   : 16px
Crown icon: #E9A84C, 16×16px
title     : white, 14px, font-weight 600
subtitle  : rgba(255,255,255,0.50), 12px
CTA button: full-width, bg #E9A84C, text #0D1B2A, font-bold
```

---

#### `PageHeader` — `/components/layout/PageHeader.jsx`

Reusable section at top of every page.

**Props:**

```javascript
title    : string
subtitle : string
action   : React node (button placed top-right)
```

**Visual Specs:**

```
title    : Fraunces, 28–32px (sm:text-3xl), font-weight 600, color #0D1B2A
subtitle : Inter, 14px, color #8A96A3, margin-top 4px
layout   : flex, justify-between, align-start, margin-bottom 24px
```

---

### 11.3 FEATURE COMPONENTS (`/components/features/`)

---

#### `DoctorCard` — `/components/features/doctors/DoctorCard.jsx`

The main card shown in the Find Doctors listing. Clickable → goes to `/app/doctors/[id]`.

**Props:**

```javascript
doctor : {
  id, name, specialtyLabel, hospital, distance,
  rating, reviewCount, experience, fee,
  nextAvailable, verified, languages,
  avatar, avatarBg, conditions
}
```

**Layout (inside Card component):**

```
Row 1: Avatar (80×80 rounded-2xl) | Info block | Fee (top-right)
  Info block:
    Name + BadgeCheck icon (if verified)
    Specialty label — text-sm, #4A5568
    Hospital — text-xs, #8A96A3, with MapPin icon

Row 2: Star rating + numeric + review count + · + distance + · + experience

Row 3: Clock icon + "Next: Today, 4:30 PM" — color #4A9E7F, 12px

Row 4: Condition chips (first 3, rest as "+N more")

Divider

Row 5 (bottom): Language chips (left) | "View Profile →" (right)
```

**Hover behavior:** Card gets hover shadow. Entire card is a link.

---

#### `ReviewCard` — `/components/features/doctors/ReviewCard.jsx`

**Props:**

```javascript
review    : { author, initials, avatarBg, rating, date, text, helpful }
onHelpful : function
isHelpful : boolean (has this user clicked helpful?)
// doctor-side only:
onReply   : function (optional)
reply     : string (existing reply text)
onFlag    : function (optional)
isFlagged : boolean (optional)
```

**Layout:**

```
Header row: Avatar (36px) | Name + date | Stars (right) | Flag btn (doctor only)
Body: review text (Inter 14px, leading-relaxed)
Reply block (if reply exists):
  bg #F7F4EF, left-border 3px solid #4A9E7F, padding 12px, radius 12px
  "Your Reply" label — #4A9E7F, 11px, font-bold, uppercase
  Reply text — 13px, #4A5568
Footer: "Helpful (N)" pill button | "Reply" link (doctor only)
```

---

#### `AppointmentCard` — `/components/features/appointments/AppointmentCard.jsx`

Used in both patient view and doctor's appointments page.

**Props:**

```javascript
appointment : {
  id, patient, age, condition, date, time,
  status, type, initials, avatarBg
}
isActive    : boolean (selected/highlighted)
onClick     : function
```

**Layout:**

```
Avatar (40×40 rounded-xl) | Info block | Status badge (top-right)
  patient name (font-semibold, 14px, #0D1B2A)
  age + condition (12px, #8A96A3)
  date chip + time chip + type chip (icon + text, 11px)
```

**Status badge colors:**

```
confirmed : bg #E6F4EF, text #4A9E7F
pending   : bg #FEF9EC, text #E9A84C
cancelled : bg #FEF2F2, text #E8403A
completed : bg #EDE9E2, text #8A96A3
```

---

#### `MedicineCard` — `/components/features/medicines/MedicineCard.jsx`

**Props:**

```javascript
medicine : {
  id, medicineName, strength, dosage,
  timings, memberId, memberName, memberColor,
  isOngoing, endDate, stockCount,
  whatsappReminder, status
}
onToggleTaken : function (for today's schedule)
isTaken       : boolean
onEdit        : function
onDelete      : function
```

**Layout:**

```
Left: Pill icon in colored circle (color by status)
Center:
  Medicine name + strength (font-semibold, 14px)
  Member name chip (Avatar xs + name, 12px)
  Dosage + timing chips
  Stock indicator (warn if stockCount <= 5: amber badge "Low Stock")
Right:
  Status badge
  Check toggle (for today's schedule mode)
  ⋮ menu (edit/delete)
```

---

#### `HealthRecordCard` — `/components/features/records/HealthRecordCard.jsx`

**Props:**

```javascript
record   : { id, documentName, documentType, memberName, documentDate, fileSizeKB, fileUrl }
onView   : function
onDelete : function
```

**Layout:**

```
Left: Document type icon in colored rounded box (color by documentType)
Center:
  Document name (font-semibold, 14px, truncate)
  Member name + date (12px, #8A96A3)
  File size (12px, #8A96A3)
Right: View button | Delete button (icon only)
```

---

#### `FamilyMemberSelector` — `/components/features/family/FamilyMemberSelector.jsx`

Horizontal scrollable row of member avatars on dashboard.

**Props:**

```javascript
members       : [{ id, name, relationship, avatarColor }]
activeMemberId: string | 'all'
onChange      : function(memberId)
```

**Layout:**

```
Horizontal scroll container (no scrollbar visible)
First pill: "All Family" (special, shows stacked avatars)
Each member: Avatar (40px) + name below (10px)
Active member: ring border 2px solid #0D1B2A + scale(1.05)
Inactive: opacity 0.6, hover opacity 1
```

---

#### `StatCard` — `/components/features/dashboard/StatCard.jsx`

The 4 stat cards on both dashboards.

**Props:**

```javascript
label  : string
value  : string
sub    : string
icon   : React node
color  : string (hex — used for icon bg tint)
trend  : string (e.g., "+18%") — optional
href   : string — wraps entire card in Link if provided
```

**Layout:**

```
Top row: Icon box (bg at 10% opacity of color, icon at full color) | Trend badge (right)
Value  : Fraunces, 28px, font-bold, #0D1B2A
Label  : Inter, 14px, font-medium, #4A5568
Sub    : Inter, 12px, #8A96A3
```

---

#### `RatingBreakdownChart` — `/components/features/reviews/RatingBreakdownChart.jsx`

The Google Maps-style star bar chart.

**Props:**

```javascript
breakdown : { 5: number, 4: number, 3: number, 2: number, 1: number }  // percentages
total     : number
average   : number
activeFilter : number | null
onFilter  : function(star)
```

**Layout:**

```
Left: Large average number (Fraunces, 56px, bold) + star row + "N reviews"
Right: 5 rows (5★ → 1★)
  Each row: star number (12px) + Star icon + bar + percentage
  Bar: bg #EDE9E2, fill bg #E9A84C (60% opacity if inactive, 100% if this star is filtered)
  Row is clickable — calls onFilter
```

---

#### `PlanCard` — `/components/features/plans/PlanCard.jsx`

**Props:**

```javascript
plan       : { id, name, price, annualPrice, features, color, textColor, tag, tagBg, tagText }
isAnnual   : boolean
isCurrent  : boolean
onUpgrade  : function
```

**Layout:**

```
Header section (bg = plan.color):
  Icon + Name (Fraunces, 22px) + Tag badge
  Price (Fraunces, 40px, bold) + "/month" text
  Annual savings note (if isAnnual)

Body section (bg white):
  Feature list (CheckCircle2 #4A9E7F for included, X #EDE9E2 for excluded)
  Two-column grid on desktop, single on mobile
  CTA Button at bottom
```

---

#### `OnboardingStep` — `/components/features/onboarding/OnboardingStep.jsx`

Reusable wrapper for each onboarding page.

**Props:**

```javascript
step     : number (1–4)
total    : number (4)
title    : string
subtitle : string
children : React node (the form)
onNext   : function
onBack   : function
nextLabel: string (default "Continue")
```

**Layout:**

```
Progress bar at top: [step/total] filled pills, spaced evenly
  filled pill  : bg #0D1B2A
  empty pill   : bg #EDE9E2
  height: 4px, border-radius 999px
  gap: 4px

Content: title (Fraunces 26px) + subtitle (Inter 14px #8A96A3) + children

Bottom: Back button (ghost) + Next button (primary), side by side
  Back button hidden on step 1
```

---

#### `NotificationItem` — `/components/features/notifications/NotificationItem.jsx`

**Props:**

```javascript
notification : { id, type, title, body, time, isRead, actionLabel, actionHref }
onMarkRead   : function
onDismiss    : function
```

**Visual Specs:**

```
Unread: border 2px solid rgba(13,27,42,0.15), shadow subtle, red dot top-right corner
Read  : border 1px solid rgba(13,27,42,0.06), no shadow

Left: Type icon in colored circle (see type→color map in Section 6.15)
Center:
  Title (font-semibold if unread, font-medium if read, 14px)
  Body (12px, #8A96A3, leading-relaxed)
  Time + Action link row
Dismiss × : appears on hover (opacity 0 → 1), top-right
```

---

#### `UploadDropzone` — `/components/features/records/UploadDropzone.jsx`

**Props:**

```javascript
onFileSelect : function(file)
accept       : string (default "image/*,application/pdf")
maxSizeMB    : number (default 10)
```

**Visual Specs:**

```
Default state:
  border: 2px dashed rgba(13,27,42,0.20)
  bg: #F7F4EF
  border-radius: 16px
  padding: 40px 24px
  text-align: center
  Upload icon (UploadCloud, 40px, #8A96A3)
  "Drag & drop or click to upload" — 14px, #4A5568
  "PDF, JPG, PNG · max 10 MB" — 12px, #8A96A3

Drag-over state:
  border-color: #4A9E7F
  bg: #E6F4EF

File selected state:
  Shows file name + size + remove button
```

---

#### `CheckoutModal` — `/components/features/plans/CheckoutModal.jsx`

**Props:**

```javascript
isOpen   : boolean
onClose  : function
plan     : { name, price }
isAnnual : boolean
onPay    : function
```

**Layout:**

```
Modal header: "Complete Upgrade" + × close
Plan summary box: plan name + billing cycle + price (right-aligned)
Card number input (with CreditCard icon left)
Grid: Expiry input + CVV input
"Pay ₹X via Razorpay" — full-width primary button
"🔒 Secured by Razorpay · Cancel anytime" — 12px, centered, #8A96A3
```

---

### 11.4 COMPONENT DEPENDENCY MAP

Build in this exact order to avoid import errors:

```
Phase 1 — Pure UI (no dependencies):
  Skeleton → Divider → Badge → Avatar → StarRating
  ProgressBar → Toggle → FilterChip

Phase 2 — Composite UI (depend on Phase 1):
  Input → Textarea → Select → SearchBar
  Button → Card → Modal → TabBar → EmptyState → Toast

Phase 3 — Layout (depend on Phase 1+2):
  PageHeader → DashboardLayout → DoctorLayout → OnboardingStep

Phase 4 — Feature (depend on all above):
  StatCard → FamilyMemberSelector → NotificationItem
  HealthRecordCard → MedicineCard → UploadDropzone
  DoctorCard → ReviewCard → RatingBreakdownChart
  AppointmentCard → PlanCard → CheckoutModal
```

---

### 11.5 COMPONENT NAMING CONVENTIONS

```
Files     : PascalCase, .jsx extension — e.g. DoctorCard.jsx
Exports   : named export matching filename — export function DoctorCard()
Props     : camelCase — e.g. avatarBg, isVerified, onMarkRead
CSS vars  : use Tailwind classes + arbitrary values for brand colors
            e.g. bg-[#0D1B2A] text-[#4A9E7F]
Icons     : always import named from lucide-react — import { Star } from 'lucide-react'
            icon size: always use className="h-4 w-4" (never width/height attributes)
```

---

## 11.6 ADMIN PANEL COMPONENTS (`/components/admin/`)

Additional components used only in the admin portal.

#### `AdminStatCard` — `/components/admin/AdminStatCard.jsx`

Same as `StatCard` but on page background `#F4F6FA`. Always wrapped in `<Link>` to the relevant admin page.

#### `AlertBanner` — `/components/admin/AlertBanner.jsx`

```
Props: type ('warning'|'danger'|'info'), message, actionLabel, onAction
Used for: pending verifications, failed payments, flagged reviews
Full-width, rounded-2xl, border + bg tinted by type, icon left, CTA button right
```

#### `DataTable` — `/components/admin/DataTable.jsx`

```
Props: columns, rows, onRowClick, selectable, emptyState
Reusable table shell used by Users, Subscriptions pages
Header row: bg #F4F6FA, text #8A96A3, uppercase 10px tracking-wider
Data rows: hover bg #F9FAFB, border-bottom rgba(0,0,0,0.04)
Checkbox column: accent-color #0D1B2A
```

#### `ActionMenu` — `/components/admin/ActionMenu.jsx`

```
Props: items [{ label, icon, onClick, variant ('default'|'danger') }]
The ⋮ kebab menu on each row
Dropdown: bg white, border, radius 12px, shadow-lg, w-40
Item: px-3 py-2.5, text-sm, hover bg #F4F6FA
Danger variant: text #E8403A, hover bg #FEF2F2
```

#### `BulkActionBar` — `/components/admin/BulkActionBar.jsx`

```
Shown when 1+ rows selected
bg #0D1B2A, text white, rounded-xl, px-4 py-3
Shows: "[N] selected" + action buttons + "Clear" link
```

---

## 12. ADMIN PANEL — FULL SPECIFICATION

---

### 12.1 Admin Portal Overview

The Admin Panel is a **completely separate portal** accessible only to platform owners/staff. It has:

- Its own login at `/admin`
- Its own dark-navy sidebar layout (`AdminLayout`)
- Full read/write access to all platform data
- No connection to patient or doctor JWT — uses a separate `admin_token`

**Admin sidebar background: `#0A0F1E`** (darker than the doctor portal `#0D1B2A`) — visually distinct.

---

### 12.2 Admin Routes

```
/admin                → Admin login page (AdminAuth)
/admin/overview       → Dashboard overview
/admin/analytics      → Platform-wide analytics
/admin/users          → Patient management
/admin/doctors        → Doctor management + verification
/admin/subscriptions  → Billing + plan management
/admin/reviews        → Review moderation
/admin/settings       → Platform settings
```

---

### 12.3 Admin Auth `/admin`

**Design:** Full-screen dark (`#0A0F1E` bg) with subtle grid pattern overlay.

**Login card:**

- `#FFFFFF` with `8%` opacity (glassmorphism-style: `bg-white/8 border border-white/10`)
- Backdrop blur: `backdrop-filter: blur(12px)`
- Red Shield icon logo (`#E8403A` background)
- Email + password fields (dark-themed inputs: `bg-white/8 border-white/10 text-white`)
- Submit button: `bg-[#E8403A]` — "Sign In to Admin Console"
- "Forgot password?" link → `/admin/forgot-password`
- Error state: red border card with `AlertCircle` icon
- Demo credentials hint: shown below card in small muted text

**After login, the system detects role from JWT and adapts the UI:**
- `super_admin` → full sidebar (all menu items visible) + no session timeout warning
- `admin` → limited sidebar (subscription pricing tab hidden) + session timeout active

**Security note for developer:** In production, add 2FA (TOTP) and IP whitelisting. For v1, strong password + separate JWT + session timeout for Regular Admins is sufficient.

---

### 12.4 Admin Layout (`AdminLayout`)

**Sidebar (256px, bg `#0A0F1E`):**

```
Logo block:
  Red Shield icon (8px rounded, bg #E8403A) + "FamilyHealth" (Fraunces white) + "Admin Console" (10px, white/40, uppercase tracking)

Navigation — grouped into 4 sections:
  MAIN:
    Overview    → /admin/overview    (LayoutDashboard icon)
    Analytics   → /admin/analytics   (BarChart3 icon)

  PEOPLE:
    Patients    → /admin/users        (Users icon)       badge: "2.4k"
    Doctors     → /admin/doctors      (Stethoscope icon) badge: "12 new" (amber)

  BUSINESS:
    Subscriptions → /admin/subscriptions (CreditCard icon)
    Reviews       → /admin/reviews       (Star icon) badge: "5 flagged" (red)

  SYSTEM:
    Settings    → /admin/settings    (Settings icon)
    Admins      → /admin/admins      (ShieldCheck icon)  [Super Admin only — hidden for role=admin]

Badge colors:
  flagged/danger → bg rgba(232,64,58,0.20), text #E8403A
  new/warning    → bg rgba(233,168,76,0.20), text #E9A84C
  count          → bg rgba(255,255,255,0.10), text white/50

Bottom section (below divider):
  Admin avatar (32px circle, bg #E8403A for super_admin / bg #4A9E7F for admin) + role label ("Super Admin" or "Admin") + email (white/40, 10px)
  Session timeout indicator (role=admin only): "Session: [N]m remaining" shown in white/30, 10px — turns amber when < 5 min left
  Sign Out button (text white/30, hover white/60)
```

**Nav item active state:**

```
bg rgba(255,255,255,0.10), text white, font-weight 500
border-radius 12px, padding 10px 12px
```

**Desktop topbar (56px, bg white):**

```
Left: Shield icon (red) + "Admin Console" breadcrumb + "/ [Page title]"
Right: Patient View link + Doctor View link + Bell icon + Admin avatar
```

---

### 12.5 Admin Overview `/admin/overview`

**Purpose:** First thing admin sees. Mission control.

**Sections:**

1. **Alert Banner row** (conditional) — shows active alerts:
   - Flagged reviews pending moderation → links to `/admin/reviews`
   - Doctors awaiting verification → links to `/admin/doctors`
   - Failed payments → links to `/admin/subscriptions`

2. **KPI Cards row (4 cards):**
   | Metric | Value | Trend |
   |---|---|---|
   | Total Patients | 2,418 | +8% |
   | Verified Doctors | 247 | +5% |
   | Monthly Revenue | ₹1.48L | +9% |
   | Paid Doctor Plans | 89 | +12% |

3. **Revenue Area Chart** (2/3 width) + **Platform Health stats** (1/3 width):
   - Chart: 6-month revenue trend, `#4A9E7F` line + gradient fill
   - Health stats: Avg Rating, Response Rate, Appointments Today, Active Medicines, Docs Uploaded, WhatsApp Reminders sent

4. **Two-column row:**
   - New Patients (last 4, with avatar, city, plan badge)
   - Pending Doctor Verifications (with Verify + Reject quick-action buttons)

---

### 12.6 Admin Analytics `/admin/analytics`

**Charts (all built with recharts):**

| Chart                    | Type                  | Data                          |
| ------------------------ | --------------------- | ----------------------------- |
| User Growth              | AreaChart (two areas) | Patients + Doctors — 6 months |
| Monthly Revenue          | BarChart              | ₹ per month — 6 months        |
| Doctor Plan Distribution | PieChart (donut)      | Free / Pro / Premium counts   |
| Appointments by Weekday  | BarChart              | Mon–Sun average               |
| Top Specialty Demand     | Horizontal bar list   | Bookings per specialty        |

**KPI cards:** Total Patients, Active Doctors, Monthly Revenue, Appointments Today — all with trend badges.

---

### 12.7 Admin Users (Patients) `/admin/users`

**Features:**

- Search by name, email, city
- Filter by Plan (Free/Family) and Status (Active/Suspended)
- Row selection checkboxes (multi-select → bulk actions)
- Bulk actions bar: Suspend Selected, Export Selected, Clear
- Export CSV button (top right)

**Table columns:** ☐ | Patient (avatar + name + email) | City | Plan badge | Members | Status badge | ⋮ menu

**Row action menu (⋮):**

- View Profile → opens patient detail modal (not in scope v1, link to page)
- Send Email
- Suspend / Reactivate
- Delete Account (danger — confirm dialog required)

**Status badges:**

- Active → `#E6F4EF` bg, `#4A9E7F` text
- Suspended → `#FEF2F2` bg, `#E8403A` text

---

### 12.8 Admin Doctors `/admin/doctors`

**Features:**

- Search by name, specialty, city
- Filter by Status (Active / Pending / Suspended / Rejected) and Plan
- Yellow alert banner when any doctors are in pending state
- Per-doctor quick actions for pending: Verify (green) + Reject (red) buttons
- Row action menu (⋮): View Profile, Verify, Suspend, Reactivate

**Doctor card layout (not a table — card list):**

```
Avatar (48px, rounded-2xl) | Name + BadgeCheck (if verified) + Plan badge
                            | Specialty + City
                            | MCI Reg No (monospace) + Rating + Joined date
Status badge | [Verify + Reject buttons if pending] | ⋮ menu
```

**Verification workflow:**

1. Doctor registers → status = "pending", verified = false
2. Admin sees pending alert banner on Overview
3. Admin goes to /admin/doctors, filters by pending
4. Admin clicks Verify → status → "active", verified → true → BadgeCheck shown
5. OR Admin clicks Reject → status → "rejected" → doctor gets email notification

---

### 12.9 Admin Subscriptions `/admin/subscriptions`

**Features:**

- Search by doctor or specialty
- Filter by Plan and Status
- Red alert banner for failed payments
- Export CSV

**Summary cards:**

- Monthly Revenue (₹)
- Pro Subscribers count
- Premium Subscribers count
- Failed Payments count (red card)

**Table columns:** Doctor | Plan (icon + badge) | Amount | Status | Renewal date | Txn ID

**Status badges:**

- Active → green CheckCircle2 icon + text
- Failed → red XCircle icon + text

**For failed payments:** Trigger Razorpay retry payment link via backend API.

---

### 12.10 Admin Reviews `/admin/reviews`

**Features:**

- Search by doctor, patient, or review text
- Filter by Status (Published / Flagged) and Rating (1★–5★)
- Red alert banner showing count of flagged reviews

**Review card layout:**

```
Doctor avatar (small) + doctor name | · | Patient avatar (tiny) + patient name + date | Status badge
Star rating row
Review text
[Flagged]: Approve button (green) + Remove button (red)
[Published]: Flag button (amber) + Remove button (red)
```

**Moderation rules:**

- Flagged reviews: admin can Approve (publishes back) or Remove (permanently deletes)
- Published reviews: admin can Flag (moves to moderation queue) or Remove

---

### 12.11 Admin Settings `/admin/settings`

**Sections:**

1. **General** — Platform Name, Support Email, Maintenance Mode toggle (⚠️ blocks all users)
2. **Business Rules** — Free plan booking limit, Pro plan booking limit, Auto-flag threshold (N flags to auto-hide)
3. **Razorpay Configuration** — Key ID field (Key Secret only in backend .env, never here)
4. **WhatsApp / Twilio** — Account SID, WhatsApp From number
5. **Admin Notifications** — Toggles: New doctor registration, Failed payment, Flagged review
6. **Danger Zone** — Clear test data button, Reset all doctor plans button (both require confirmation dialog)

---

### 12.12 Admin Database Models

```javascript
// AdminUser model — covers both Super Admin and Regular Admin
{
  _id              : ObjectId,
  name             : String,
  email            : { type: String, unique: true },
  passwordHash     : String,
  role             : { type: String, enum: ['super_admin', 'admin'], default: 'admin' },
  // 'super_admin' = board member / CTO (full access)
  // 'admin'       = employee / operator (limited access)

  isActive         : { type: Boolean, default: true },
  createdBy        : ObjectId (ref: 'AdminUser'),  // Super Admin who created this admin
  lastLogin        : Date,

  // Session timeout — only applies to role='admin'
  sessionTimeoutMinutes: { type: Number, default: 30 },  // configurable per admin
  lastActivityAt   : Date,  // updated on every API request; used to auto-expire session

  // Password reset flow
  passwordResetToken         : String,   // hashed OTP / token
  passwordResetRequestedAt   : Date,
  passwordResetApprovedBySA  : { type: Boolean, default: false },
  passwordResetApprovedAt    : Date,

  createdAt        : Date,
  updatedAt        : Date
}
```

```javascript
// AdminActivityLog model — immutable audit trail of all Regular Admin changes
{
  _id           : ObjectId,
  adminId       : ObjectId (ref: 'AdminUser'),
  adminName     : String,  // denormalized for historical accuracy
  actionType    : { type: String, enum: [
    'user_suspend', 'user_reactivate', 'user_email',
    'doctor_verify', 'doctor_reject', 'doctor_suspend', 'doctor_profile_edit',
    'review_approve', 'review_flag',
    'appointment_modify'
  ]},
  targetType    : { type: String, enum: ['user', 'doctor', 'review', 'appointment'] },
  targetId      : ObjectId,
  targetName    : String,    // e.g. "Dr. Ramesh Sharma" — denormalized
  changeDetails : Object,    // { field: 'status', from: 'active', to: 'suspended' }
  superAdminNotified: { type: Boolean, default: false },
  createdAt     : Date
}
```

```javascript
// AdminPermissionRequest model — for Regular Admin delete requests needing SA approval
{
  _id           : ObjectId,
  requestedBy   : ObjectId (ref: 'AdminUser'),
  actionType    : { type: String, enum: ['delete_user', 'delete_doctor', 'delete_review'] },
  targetType    : String,
  targetId      : ObjectId,
  targetName    : String,
  reason        : String,   // Required — why admin wants to delete
  status        : { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy    : ObjectId (ref: 'AdminUser'),  // Super Admin who reviewed
  reviewedAt    : Date,
  reviewNote    : String,   // Super Admin's optional comment
  createdAt     : Date
}
```

---

### 12.13 Dual Admin System — Role Permissions

#### Super Admin (`role: 'super_admin'`)

The Super Admin is the platform owner / CTO / board member. Full access to everything.

| Feature | Super Admin |
|---|---|
| View all data (users, doctors, analytics) | ✅ |
| Modify customer / doctor data | ✅ |
| Delete any data | ✅ (with confirm dialog) |
| Manage subscription plans & pricing | ✅ (exclusive) |
| Verify / reject doctors | ✅ |
| Manage review moderation | ✅ |
| Platform settings & maintenance mode | ✅ |
| Create / manage Regular Admin accounts | ✅ (exclusive) |
| Set session timeout for Regular Admins | ✅ (exclusive) |
| View full admin activity log | ✅ |
| Approve Regular Admin password reset | ✅ (exclusive) |
| Approve Regular Admin delete requests | ✅ (exclusive) |
| No session timeout | ✅ |

#### Regular Admin (`role: 'admin'`)

The Regular Admin is a platform employee (support, ops, or tech team). Limited access.

| Feature | Regular Admin |
|---|---|
| View platform analytics & data | ✅ |
| View customer and doctor information | ✅ |
| Modify customer / doctor data (non-delete) | ✅ — but triggers SA notification alert |
| Delete any data | ❌ — must submit permission request to Super Admin |
| Access subscription pricing & plan features | ❌ (read-only view at most) |
| Verify / reject doctors | ✅ |
| Moderate reviews (approve / flag) | ✅ |
| Delete reviews permanently | ❌ — requires SA permission request |
| Session timeout | ✅ — auto-logout after inactivity (configurable by SA) |
| Forgot password | ✅ — but requires Super Admin to approve reset before it works |
| See other admin accounts | ❌ |

---

### 12.14 Super Admin Notification System

Whenever a Regular Admin makes **any modification** to a patient or doctor record, the system must:

1. Log the action in `AdminActivityLog` immediately
2. Send an in-app notification to the Super Admin (using the existing `Notification` model with `userType: 'super_admin'`)
3. Optionally send an email alert to the Super Admin's registered email

**Notification format:**

```
Title: "Admin Action: [actionType]"
Body:  "[Admin Name] has [action description] for [target name]."
Example: "Ravi Kumar has suspended user 'Priya Sharma (priya@email.com)'."
```

**Notification bell in admin topbar** — Super Admin sees a red dot whenever unread admin-action alerts exist.

---

### 12.15 Regular Admin Session Timeout

- Session timeout is **only for `role: 'admin'`** accounts (Super Admin is never timed out)
- Default: 30 minutes of inactivity
- Super Admin can configure per-admin timeout (min 5 min, max 480 min / 8 hrs) from `/admin/admins`
- Implementation:
  - Every API call from Regular Admin updates `lastActivityAt` in DB
  - Frontend: `useEffect` polling every 60s checks `(Date.now() - lastActivityAt) > sessionTimeoutMinutes * 60 * 1000`
  - On timeout: display "Session Expired" modal → "Sign In Again" button → redirect to `/admin`
  - Invalidate `admin_token` on timeout (or use short JWT expiry matching `sessionTimeoutMinutes`)

**Session Timeout Modal (design):**

```
Full-screen overlay (bg rgba(10,15,30,0.85))
Card: white, rounded-2xl, padding 32px, max-width 380px, centered
  Lock icon (Lucide <Lock>, 48px, color #E8403A)
  Title: "Session Expired" (Fraunces, 24px)
  Body: "Your session has been inactive for [N] minutes and was automatically signed out for security."
  Button: "Sign In Again" (full-width, bg #E8403A, white text)
```

---

### 12.16 Admin Forgot Password Flow

**Regular Admin → Forgot Password (`/admin/forgot-password`):**

Step 1 — Admin submits reset request:
- Email input (dark-themed, same as admin login)
- "Request Password Reset" button
- On submit → backend creates a pending `passwordResetToken` for this admin and sends notification to Super Admin

Step 2 — Waiting for Super Admin approval:
- Screen shows: "Reset request submitted. Your Super Admin has been notified and must approve this request before you can reset your password."
- Admin cannot proceed until Super Admin approves

**Super Admin approval (from Admin Panel notification bell or `/admin/admins` page):**
- Super Admin sees alert: "Admin [Name] has requested a password reset."
- Approve → backend marks `passwordResetApprovedBySA: true`, sends OTP/reset link email to that admin
- Reject → sends rejection email to admin, no reset allowed

Step 3 — Admin receives reset email and completes reset:
- 6-digit OTP or reset link (same 3-step flow as patient/doctor)
- Token is only valid for 2 hours after Super Admin approval
- On success → redirect to `/admin`

**Super Admin forgot password:**
- Super Admin does NOT go through the approval flow (there is no higher authority)
- Instead: backend uses pre-configured emergency email + OTP to the registered Super Admin email
- In production: additionally notify backup contact (configurable in platform settings)

---

### 12.17 Admin Panel — Subscription Pricing Management (Super Admin Only)

Found under `/admin/settings` → "Subscription Plans" tab.

**This page is ONLY visible and accessible to `role: 'super_admin'`.**
Regular Admin attempting to access this tab sees: "You don't have permission to manage subscription settings. Contact your Super Admin."

**What Super Admin can edit:**

| Setting | Type |
|---|---|
| Plan name (Free / Pro / Premium) | Text |
| Monthly price (₹) | Number |
| Annual price (₹) | Number |
| Bookings per month limit | Number |
| Search placement type | Dropdown |
| Analytics access level | Dropdown |
| WhatsApp reminders included | Toggle |
| Video consultation included | Toggle |
| Account manager included | Toggle |
| Custom clinic page included | Toggle |
| Featured badge included | Toggle |

**UI:**

- 3-column card layout (one per plan), each fully editable
- "Save Changes" button per card — shows confirmation dialog "Are you sure? This will affect all active subscribers."
- Changes are versioned: `SubscriptionPlanHistory` logs old vs new values + who changed it + when
- After save: Razorpay plan sync is triggered if pricing changed (via webhook / API)

**Design:** Same `#0A0F1E` sidebar admin layout. Tab switcher in `/admin/settings` — "General" | "Subscription Plans" | "Maintenance". Regular Admin sees all tabs except "Subscription Plans" is locked with a padlock icon.

---

### 12.18 Admin Management Page `/admin/admins` (Super Admin Only)

**Purpose:** Super Admin creates and manages all Regular Admin accounts.

**Features:**

- Table of all Regular Admin accounts: Name | Email | Status | Last Login | Session Timeout | ⋮ menu
- "Add New Admin" button → modal with: Name, Email, Temporary Password, Session Timeout setting
- Row actions: Edit timeout duration, Suspend, Reactivate, Reset Password (triggers approval flow), Delete
- Pending permission requests tab: shows all Regular Admin delete/dangerous requests awaiting approval
- Admin activity log tab: searchable audit log of all admin actions

---

### 12.19 Admin API Endpoints

All admin routes require `admin_token` JWT middleware. Completely separate from patient/doctor auth.

**Middleware logic:**
- `adminAuth` — verifies `admin_token`, rejects if expired
- `superAdminOnly` — additionally checks `role === 'super_admin'`, returns 403 if not
- `adminActivityMiddleware` — runs on all Regular Admin mutating requests, logs to `AdminActivityLog` and notifies Super Admin

```
POST   /admin/auth/login                        Admin login (both roles) → returns admin_token
GET    /admin/auth/me                           Get current admin profile
POST   /admin/auth/forgot-password              Submit reset request (Regular Admin: pending SA approval; Super Admin: immediate OTP)
POST   /admin/auth/approve-reset/:adminId       [superAdminOnly] Approve a regular admin's reset request
POST   /admin/auth/reject-reset/:adminId        [superAdminOnly] Reject a regular admin's reset request
POST   /admin/auth/reset-password               Complete reset (requires approved token)
PATCH  /admin/auth/update-activity              Update lastActivityAt (called every 60s from frontend)

GET    /admin/stats/overview                    All platform KPIs + alert counts
GET    /admin/stats/analytics                   Time-series data for charts

GET    /admin/users                             List patients (query: search, plan, status, page, limit)
GET    /admin/users/:id                         Get patient detail
PATCH  /admin/users/:id/status                  Suspend / reactivate [logs to AdminActivityLog, notifies SA if role=admin]
DELETE /admin/users/:id                         [superAdminOnly] Permanently delete account + all data

GET    /admin/doctors                           List doctors (query: search, plan, status, page)
GET    /admin/doctors/:id                       Get doctor detail
PATCH  /admin/doctors/:id/verify                Verify doctor [logs if role=admin]
PATCH  /admin/doctors/:id/reject                Reject doctor [logs if role=admin]
PATCH  /admin/doctors/:id/suspend               Suspend doctor [logs if role=admin]
DELETE /admin/doctors/:id                       [superAdminOnly] Delete doctor account

GET    /admin/subscriptions                     List all plan subscriptions
POST   /admin/subscriptions/:id/retry           Trigger Razorpay retry for failed payment
GET    /admin/subscription-plans                [superAdminOnly] Get current plan config
PATCH  /admin/subscription-plans                [superAdminOnly] Update plan pricing / features

GET    /admin/reviews                           List all reviews (query: status, rating, search)
PATCH  /admin/reviews/:id/approve               Un-flag and publish a review [logs if role=admin]
PATCH  /admin/reviews/:id/flag                  Flag a review [logs if role=admin]
DELETE /admin/reviews/:id                       [superAdminOnly] Delete review permanently

GET    /admin/settings                          Get platform settings
PATCH  /admin/settings                          Update platform settings (General + Maintenance; SA only for subscription tab)
POST   /admin/settings/maintenance              [superAdminOnly] Toggle maintenance mode

GET    /admin/admins                            [superAdminOnly] List all admin accounts
POST   /admin/admins                            [superAdminOnly] Create new Regular Admin
PATCH  /admin/admins/:id                        [superAdminOnly] Update admin (timeout, name, status)
DELETE /admin/admins/:id                        [superAdminOnly] Delete admin account

GET    /admin/permission-requests               [superAdminOnly] List pending delete/danger requests from Regular Admins
POST   /admin/permission-requests               [role=admin] Submit a delete permission request
PATCH  /admin/permission-requests/:id/approve   [superAdminOnly] Approve delete request
PATCH  /admin/permission-requests/:id/reject    [superAdminOnly] Reject delete request

GET    /admin/activity-log                      [superAdminOnly] Full audit log (query: adminId, actionType, date)
GET    /admin/notifications                     Admin notifications (SA: all; Regular Admin: own only)
PATCH  /admin/notifications/:id/read            Mark notification as read
```

---

### 12.20 Admin Security Rules

```
1. Admin JWT is separate from patient/doctor JWT:
   - Different secret: process.env.JWT_ADMIN_SECRET
   - Super Admin expiry: 24 hours
   - Regular Admin expiry: matches sessionTimeoutMinutes (frontend also enforces this independently)

2. All /admin/* API routes must use adminAuth middleware — never reuse patient/doctor middleware

3. Destructive actions (delete user, delete doctor, delete review):
   - Super Admin: confirmation dialog on frontend + double-check backend
   - Regular Admin: NOT permitted; must submit permission request via /admin/permission-requests

4. Subscription pricing updates:
   - superAdminOnly middleware on PATCH /admin/subscription-plans
   - Regular Admin cannot see or access this route (403)

5. Maintenance mode:
   - Stored in DB (Settings model)
   - Patient/doctor middleware checks this flag → returns 503 if true
   - Admin routes are NOT affected by maintenance mode

6. Admin credentials:
   - Never store plain passwords — bcrypt, salt rounds: 12
   - Rate limit: 5 failed login attempts → 15min lockout (applies to both roles)

7. Session timeout (Regular Admin only):
   - Frontend polls every 60s, measures inactivity
   - Backend also validates lastActivityAt on each request and rejects stale tokens
   - On timeout: show session expired modal, force re-login

8. Admin activity logging:
   - All mutating actions by Regular Admin auto-logged via adminActivityMiddleware
   - Super Admin is notified via in-app notification + email on each log entry
   - Logs are immutable — no DELETE endpoint for AdminActivityLog

9. Admin panel is NOT linked from patient or doctor portals (security by obscurity)
   - Access only via direct URL: /admin
   - Remove all "← Admin" links in production
```

---

### 12.15 Adding Admin Panel to Route Map (complete updated map)

```
PATIENT ROUTES:
/                         Landing page
/signup                   Patient signup
/onboarding/*             4-step onboarding
/app                      Patient dashboard
/app/records              Health records
/app/medicines            Medicine tracker
/app/doctor-prep          Doctor visit prep
/app/doctors              Find doctors
/app/doctors/[id]         Doctor profile
/app/insights             Health insights
/app/emergency            Emergency info
/app/notifications        Notifications
/app/settings             Settings

DOCTOR ROUTES:
/doctor                   Doctor login/signup
/doctor/overview          Doctor dashboard
/doctor/appointments      Appointments management
/doctor/reviews           Reviews management
/doctor/profile           Edit profile
/doctor/plans             Plans & billing

ADMIN ROUTES:
/admin                    Admin login (Super Admin + Regular Admin, single login page)
/admin/forgot-password    Admin forgot password (requires Super Admin approval)
/admin/overview           Admin dashboard
/admin/analytics          Platform analytics
/admin/users              Patient management
/admin/doctors            Doctor management + verification
/admin/subscriptions      Billing management (Super Admin: full access; Regular Admin: view only)
/admin/reviews            Review moderation
/admin/settings           Platform settings (subscription pricing — Super Admin only)
/admin/admins             Manage admin accounts (Super Admin only)
```

---

## 13. KEY FEATURES & BUSINESS LOGIC

- All data is scoped to `familyId` + `memberId`
- User can only see data for their own family
- Family member selector on dashboard filters all widgets

### Medicine Reminder Logic

1. When a medicine is added with `whatsappReminder: true`, schedule a daily cron job
2. Cron fires at the configured times (morning/afternoon/evening/night)
3. Send WhatsApp message via Twilio/WATI: "Reminder: [Name] take [Medicine] [Dosage]"
4. Log reminder as sent in `MedicineLog`
5. If stock drops below 5 days, send low-stock alert

### Doctor Search Algorithm

Sort order for default "Relevance":

1. Verified doctors first
2. Higher rating
3. Closer distance (if geolocation available)
4. Pro/Premium plan doctors ranked above Free

### Doctor Plan Monetization

- **Free:** Max 10 bookings/month, standard search rank
- **Pro:** Max 100/month, priority rank, WhatsApp reminders, basic analytics
- **Premium:** Unlimited, top disease-search rank, advanced analytics, account manager
- Razorpay handles payment, webhook updates plan in DB on success

### Review System Rules

- Only patients who have had a completed appointment can review (enforce on backend)
- Doctors can reply once per review
- "Helpful" click is once per session (store in localStorage client-side)
- Flagged reviews are hidden from public after 3 flags (manual review queue for admin)

### Profile Verification

- Doctors enter Medical Council of India (MCI) registration number
- Admin panel (not in scope for v1, manual process) verifies and sets `isVerified: true`
- Verified badge (`BadgeCheck` icon in `#4A9E7F`) shown on listing and profile

---

## 13. THIRD-PARTY INTEGRATIONS

### Cloudinary (File Storage)

```javascript
// Upload preset: 'health_records'
// Folder structure: /families/{familyId}/records/
// Allowed formats: jpg, png, pdf
// Max file size: 10MB
// Return: secure_url, public_id
```

### Twilio / WATI (WhatsApp Reminders)

```javascript
// Send template message via WhatsApp Business API
// Template: "Reminder: {{name}}, please take {{medicine}} ({{dosage}}) {{timing}}"
// Must be pre-approved template on WATI dashboard
```

### Razorpay (Doctor Plan Payments)

```javascript
// Create order on backend → send order_id to frontend
// Frontend: open Razorpay checkout modal
// On success: frontend sends payment_id to backend
// Backend: verify payment signature, update doctor plan in DB
```

### Google Maps / OpenStreetMap

```javascript
// For "distance away" calculation:
// Store doctor lat/lng on signup
// Use Haversine formula on backend to calculate distance
// OR use Google Maps Distance Matrix API
```

---

## 14. MOBILE-FIRST & ACCESSIBILITY REQUIREMENTS

### Tap Targets

- **Minimum 48×48px** for all clickable elements (buttons, links, toggles)
- This is non-negotiable — elderly users are primary audience

### Font Sizes

- Body minimum: **16px**
- Metadata minimum: **12px**
- Never use font-size < 12px

### Touch Gestures

- Bottom sheets dismiss on downward swipe
- Horizontal scrolling for specialty pills (no pagination)
- Pull-to-refresh on dashboard (mobile)

### Loading States

- Skeleton loaders on all card lists (not just spinners)
- Show skeleton for: Doctor cards, Health records, Medicine list

### Error States

- Empty state illustration + helpful message for every list
- Form validation: inline errors below fields (not toast)
- Network error: retry button shown

### Offline Handling

- Emergency Info page must cache last data (localStorage/Service Worker)
- Show "Offline" indicator in header if no connection

### Color Contrast

- All text on `#F7F4EF` background: minimum 4.5:1 contrast ratio
- `#4A5568` on white: ✓ passes
- `#8A96A3` on white: use only for non-critical metadata

---

## 15. FOLDER STRUCTURE

### Next.js (Frontend)

```
/
├── app/
│   ├── (auth)/
│   │   ├── signup/page.jsx
│   │   ├── forgot-password/page.jsx          ← Patient forgot password (3-step)
│   │   └── onboarding/
│   │       ├── family/page.jsx
│   │       ├── members/page.jsx
│   │       ├── reminder/page.jsx
│   │       └── upload/page.jsx
│   ├── (patient)/
│   │   ├── layout.jsx            ← DashboardLayout
│   │   ├── app/page.jsx          ← Dashboard
│   │   ├── app/records/page.jsx
│   │   ├── app/medicines/page.jsx
│   │   ├── app/doctor-prep/page.jsx
│   │   ├── app/doctors/page.jsx
│   │   ├── app/doctors/[id]/page.jsx
│   │   ├── app/insights/page.jsx
│   │   ├── app/emergency/page.jsx
│   │   ├── app/notifications/page.jsx
│   │   └── app/settings/page.jsx
│   ├── (doctor)/
│   │   ├── doctor/page.jsx               ← DoctorAuth (+ Google OAuth button)
│   │   ├── doctor/forgot-password/page.jsx ← Doctor forgot password (3-step)
│   │   ├── doctor/layout.jsx             ← DoctorLayout
│   │   ├── doctor/overview/page.jsx
│   │   ├── doctor/appointments/page.jsx
│   │   ├── doctor/reviews/page.jsx
│   │   ├── doctor/profile/page.jsx
│   │   └── doctor/plans/page.jsx
│   ├── (admin)/
│   │   ├── admin/page.jsx                ← AdminAuth (dual role login)
│   │   ├── admin/forgot-password/page.jsx ← Admin forgot password (SA-approval flow)
│   │   ├── admin/layout.jsx              ← AdminLayout (role-aware sidebar)
│   │   ├── admin/overview/page.jsx
│   │   ├── admin/analytics/page.jsx
│   │   ├── admin/users/page.jsx
│   │   ├── admin/doctors/page.jsx
│   │   ├── admin/subscriptions/page.jsx
│   │   ├── admin/reviews/page.jsx
│   │   ├── admin/settings/page.jsx       ← subscription pricing tab = SA only
│   │   └── admin/admins/page.jsx         ← SA only: manage admin accounts
│   ├── api/
│   │   └── auth/[...nextauth]/route.js   ← next-auth Google OAuth handler
│   ├── layout.jsx                ← Root layout (fonts, providers, SessionProvider)
│   └── page.jsx                  ← Landing page
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Avatar.jsx
│   │   ├── StarRating.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Skeleton.jsx
│   │   └── GoogleAuthButton.jsx           ← Reusable "Continue with Google" button
│   ├── layout/
│   │   ├── DashboardLayout.jsx
│   │   ├── DoctorLayout.jsx
│   │   ├── AdminLayout.jsx                ← Role-aware admin sidebar
│   │   └── Navbar.jsx
│   ├── admin/
│   │   ├── AdminStatCard.jsx
│   │   ├── AlertBanner.jsx
│   │   ├── DataTable.jsx
│   │   ├── ActionMenu.jsx
│   │   ├── BulkActionBar.jsx
│   │   ├── SessionTimeoutModal.jsx        ← Session expiry overlay for Regular Admin
│   │   ├── PermissionRequestModal.jsx     ← Modal for Regular Admin to request delete
│   │   └── AdminNotificationBell.jsx      ← SA notification bell with admin activity alerts
│   └── features/
│       ├── doctors/DoctorCard.jsx
│       ├── doctors/ReviewCard.jsx
│       ├── medicines/MedicineCard.jsx
│       ├── records/RecordCard.jsx
│       └── family/MemberAvatar.jsx
├── lib/
│   ├── api.js                    ← axios instance with base URL + interceptors
│   ├── auth.js                   ← JWT helpers
│   ├── authOptions.js            ← next-auth config (Google provider + JWT callbacks)
│   └── utils.js                  ← helper functions
├── hooks/
│   ├── useAuth.js
│   ├── useAdminSession.js        ← tracks lastActivityAt, fires session timeout logic
│   ├── useFamilyMembers.js
│   └── useNotifications.js
├── styles/
│   ├── globals.css               ← Tailwind base + font import + CSS variables
│   └── theme.css                 ← Design token variables
└── public/
    └── icons/
        └── google-logo.svg       ← Official Google G logo for OAuth button
```

### Express (Backend)

```
/backend
├── server.js                     ← Entry point
├── config/
│   ├── db.js                     ← MongoDB connection
│   └── cloudinary.js
├── models/
│   ├── User.js
│   ├── Family.js
│   ├── FamilyMember.js
│   ├── HealthRecord.js
│   ├── Medicine.js
│   ├── MedicineLog.js
│   ├── Doctor.js
│   ├── Appointment.js
│   ├── Review.js
│   ├── Notification.js
│   ├── AdminUser.js              ← Covers both super_admin and admin roles
│   ├── AdminActivityLog.js       ← Immutable audit trail
│   └── AdminPermissionRequest.js ← Regular Admin delete requests
├── routes/
│   ├── auth.js
│   ├── family.js
│   ├── members.js
│   ├── records.js
│   ├── medicines.js
│   ├── doctors.js
│   ├── appointments.js
│   ├── reviews.js
│   ├── doctorAuth.js
│   ├── doctorDashboard.js
│   ├── notifications.js
│   └── admin/
│       ├── adminAuth.js          ← Login, forgot-password, approve-reset
│       ├── adminStats.js
│       ├── adminUsers.js
│       ├── adminDoctors.js
│       ├── adminSubscriptions.js ← Pricing updates: superAdminOnly middleware
│       ├── adminReviews.js
│       ├── adminSettings.js
│       ├── adminAdmins.js        ← superAdminOnly: manage admin accounts
│       └── adminPermissions.js   ← Permission request flow
├── middleware/
│   ├── auth.js                   ← Patient JWT verify
│   ├── doctorAuth.js             ← Doctor JWT verify
│   ├── adminAuth.js              ← Admin JWT verify (any role)
│   ├── superAdminOnly.js         ← Must be role=super_admin
│   ├── adminActivity.js          ← Logs action + notifies SA (for mutating Regular Admin requests)
│   ├── adminSessionCheck.js      ← Validates lastActivityAt for Regular Admins
│   └── upload.js                 ← multer + cloudinary
├── controllers/                  ← (one per route file)
├── utils/
│   ├── whatsapp.js               ← Twilio/WATI helpers
│   ├── razorpay.js
│   ├── notifications.js          ← Create notification helper
│   └── adminNotify.js            ← Send SA notification on admin actions
└── cron/
    └── medicineReminders.js      ← node-cron scheduled jobs
```

---

## 16. ENVIRONMENT VARIABLES

### Frontend (`.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSy...

# Google OAuth (next-auth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
GOOGLE_CLIENT_ID=xxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Backend (`.env`)

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/familyhealth
JWT_SECRET=your_super_secret_jwt_key_here
JWT_DOCTOR_SECRET=separate_jwt_secret_for_doctors
JWT_ADMIN_SECRET=separate_jwt_secret_for_admins

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Super Admin emergency email (for SA password resets)
SUPER_ADMIN_BACKUP_EMAIL=cto@yourcompany.com
```

---

## 17. DEVELOPER QUICK-START CHECKLIST

Copy this checklist and work through it in order:

### Phase 1 — Foundation (Week 1)

- [ ] Set up Next.js 14 project with App Router
- [ ] Configure Tailwind CSS v4
- [ ] Add Google Fonts (Fraunces + Inter) to `globals.css`
- [ ] Set up all CSS variables (colors, radius, shadows) in `theme.css`
- [ ] Set up Express.js backend with MongoDB Atlas connection
- [ ] Create all Mongoose models (User, Family, FamilyMember, HealthRecord, Medicine, MedicineLog, Doctor, Appointment, Review, Notification, AdminUser, AdminActivityLog, AdminPermissionRequest)
- [ ] Set up Cloudinary account and configure upload middleware
- [ ] Build `<Button>`, `<Card>`, `<Badge>`, `<Avatar>`, `<Input>`, `<Modal>` base components
- [ ] Build `<GoogleAuthButton>` component (reusable across patient + doctor)

### Phase 2 — Auth & Onboarding (Week 1–2)

- [ ] Patient signup/login API + JWT
- [ ] Google OAuth for patient (`next-auth` + `/api/auth/[...nextauth]/route.js` + `POST /auth/google` backend)
- [ ] Patient forgot-password 3-step flow (`/forgot-password` page + API: forgot → verify-otp → reset)
- [ ] Doctor signup/login API + separate JWT
- [ ] Google OAuth for doctor (`POST /doctor/auth/google` backend endpoint)
- [ ] Doctor forgot-password 3-step flow (`/doctor/forgot-password` page + API)
- [ ] Landing page
- [ ] Patient auth pages (signup form + Google button)
- [ ] Onboarding flow (4 steps)
- [ ] Protected route middleware (frontend + backend)
- [ ] Doctor auth page (login + 2-step signup + Google button)

### Phase 3 — Patient Core Features (Week 2–3)

- [ ] DashboardLayout (sidebar + mobile bottom nav)
- [ ] Dashboard page
- [ ] Health Records (upload + list + delete with Cloudinary)
- [ ] Medicine Tracker (CRUD + today's schedule)
- [ ] Emergency Info page
- [ ] Settings page

### Phase 4 — Doctor System (Week 3–4)

- [ ] DoctorLayout (dark sidebar)
- [ ] Find Doctors page (with filters, search)
- [ ] Doctor Profile page (public)
- [ ] Doctor Overview dashboard
- [ ] Doctor Appointments (with actions)
- [ ] Doctor Reviews (reply, flag)
- [ ] Doctor Edit Profile (with preview)
- [ ] Doctor Plans + Razorpay integration

### Phase 5 — Admin Panel (Week 4–5)

- [ ] AdminLayout (role-aware sidebar — SA sees all, Regular Admin has restricted nav)
- [ ] Dual admin login page (`/admin`) — single form, role detected from token after login
- [ ] Admin forgot-password flow — Regular Admin submits request → SA gets notification → SA approves → admin gets OTP email
- [ ] Super Admin exclusive: `/admin/admins` page (create, manage, set session timeout for Regular Admins)
- [ ] Admin overview dashboard
- [ ] Admin analytics page
- [ ] Admin users (patient management)
- [ ] Admin doctors (verification + management)
- [ ] Admin subscriptions page (view for Regular Admin, full management for SA)
- [ ] Admin settings page — "Subscription Plans" tab visible and editable by SA only; locked with padlock for Regular Admin
- [ ] Admin reviews moderation
- [ ] `adminAuth` + `superAdminOnly` + `adminActivity` + `adminSessionCheck` middleware
- [ ] `AdminActivityLog` — auto-log every Regular Admin mutation + notify SA
- [ ] `AdminPermissionRequest` — Regular Admin requests delete → SA approves/rejects
- [ ] `SessionTimeoutModal` component for Regular Admin inactivity
- [ ] SA notification bell for admin activity alerts
- [ ] `useAdminSession` hook (polls inactivity, triggers timeout modal)

### Phase 6 — Advanced Features (Week 5–6)

- [ ] WhatsApp reminders (Twilio/WATI cron jobs)
- [ ] Doctor Visit Prep page
- [ ] Health Insights page (charts with recharts)
- [ ] Notifications system
- [ ] Doctor Analytics page

### Phase 7 — Polish (Week 6–7)

- [ ] Skeleton loaders on all list pages
- [ ] Empty states on all lists
- [ ] Error handling and retry states
- [ ] Mobile responsive testing (all pages)
- [ ] Performance audit (Lighthouse > 85)
- [ ] Accessibility audit (48px tap targets, contrast ratios)

---

## IMPORTANT NOTES FOR DEVELOPERS

1. **Fonts must be loaded before any component renders** — add to root `layout.jsx` `<head>`, not lazy-loaded.

2. **Never use inline styles** except for dynamic values (avatar background color, chart colors). All static styles must be Tailwind classes.

3. **Doctor portal is a separate auth context** — use two separate `localStorage` keys (`patient_token` and `doctor_token`), never mix them.

4. **WhatsApp reminders require pre-approved templates** on WATI/Twilio — set this up before building the feature, approval takes 24–48hrs.

5. **Razorpay integration:** Always verify payment signature on the **server-side** before marking a plan as active. Never trust the client.

6. **File uploads:** Always upload to Cloudinary from the backend (not directly from frontend) to keep API credentials secure.

7. **Mobile bottom nav (patient):** Shows only 5 items — Home, Records, Medicines, Family, More. "More" opens a drawer for remaining nav items.

8. **Age-sensitive design:** Font sizes 16px minimum, tap targets 48px minimum — this is for elderly Indian users who are primary users.

9. **Indian-specific UX:** Phone numbers in +91 format, ₹ symbol for all currency (not $), date format DD MMM YYYY (not MM/DD/YYYY), time in 12hr format with AM/PM.

10. **The cream background `#F7F4EF` is the page background** — cards are white `#FFFFFF`. Never put white text on cream — use it only on dark navy or colored backgrounds.

11. **Google OAuth:** Use `next-auth` v5 for the frontend OAuth flow. On the backend, when receiving a Google token from the frontend, verify it with Google's tokeninfo endpoint before creating/logging in the user. Never trust an unverified Google token.

12. **Dual Admin roles are strictly enforced on the backend** — never rely only on frontend UI to hide Super Admin features. Every Super-Admin-only API route must use the `superAdminOnly` middleware and return 403 for Regular Admins.

13. **Regular Admin session timeout is enforced on BOTH frontend AND backend** — the `adminSessionCheck` middleware must reject requests where `lastActivityAt` is older than `sessionTimeoutMinutes`. Frontend timeout UI is for UX only; the backend is the source of truth.

14. **Admin activity logs are immutable** — there is no DELETE endpoint for `AdminActivityLog`. Build no UI for deleting logs. These are permanent audit records.

15. **Subscription pricing changes must be versioned** — maintain a `SubscriptionPlanHistory` collection so the Super Admin can see a changelog of all price/feature edits.

---

_End of Developer Handoff Document — Family Health Command Center v2.0_