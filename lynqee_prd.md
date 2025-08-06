# Product Requirements Document: Lynqee v1.0

## 🧭 Overview

**Lynqee** is a web application that enables individuals—such as content creators, professionals, and small business owners—to create and manage a single, simple public page containing their collection of important links.

### 🧩 Problem

Many individuals have a presence on various online platforms (social media, portfolios, online stores, etc.). Sharing all these links separately is highly inefficient.

### 💡 Solution

Lynqee provides a single unique link (e.g., `lynqee.com/username`) that serves as a central hub for all other important links, making it easy for audiences to find all relevant platforms in one place.

### 🎯 Target Audience

Content creators, freelancers, musicians, artists, influencers, and small business owners who are active on multiple digital platforms.

### ⭐ Value Proposition

- Simplifies the link-sharing process  
- Strengthens personal branding  
- Provides audiences with easy access to all relevant channels from one centralized location

---

## 🔧 Core Features (MVP)

### 1. Flexible User Authentication

- **What it does**:  
  Allows users to sign up and log in to Lynqee via:

  - **OAuth with Google**
  - **Email & Password**

- **Why it's important**:  
  Provides options according to user preference—OAuth offers ease and speed, while manual registration serves users who prefer account separation.

- **How it works**:  
  Supabase Auth manages both flows:
  - Google handles OAuth token
  - Email/password flow handles hashing and optional email confirmation  
  All users are stored in the same `auth.users` table.

---

### 2. Public User Profile

- **What it does**:  
  Each user gets a public profile page accessible via a unique URL (e.g., `lynqee.com/username`). This page displays their name, profile picture, short bio, and a list of links.

- **Why it's important**:  
  This is the core public-facing product. A clean and memorable URL is crucial for personal branding.

- **How it works**:  
  After registration, users are prompted to choose a unique username. Other profile info (display name, bio) can be updated on the settings page.

---

### 3. Link Management

- **What it does**:  
  Users can create, edit, delete, and reorder the links on their profile via a private dashboard.

- **Why it's important**:  
  Empowers users to maintain relevant and up-to-date content.

- **How it works**:  
  The dashboard includes:
  - Form to add a new link (title + URL)
  - Ability to edit/delete links
  - Drag-and-drop interface to reorder links

---

## 👥 User Experience

### 👤 User Personas

**Sasha** – The Content Creator  
A YouTuber and Instagram influencer. Needs an easy way to direct her followers to her latest content and shops via her bio link.

**Budi** – The Freelance Designer  
A graphic designer looking for clients. Wants to share a single link that leads to his Behance, LinkedIn, and contact form.

---

### 🔁 Key User Flows

#### Onboarding Flow

- **Path A (Google)**:  
  Landing page → Click "Login with Google" → Google OAuth → Redirected to "Setup Profile"

- **Path B (Manual)**:  
  Landing page → Click "Register with Email" → Fill form → (Optional: Email verification) → Redirect to "Setup Profile"

#### Link Management Flow

1. User accesses dashboard and clicks "Add New Link"
2. Enters title and URL, then saves
3. Link appears in list
4. User reorders via drag-and-drop
5. User visits public profile to see changes

#### Visitor Flow

1. Visitor accesses `lynqee.com/username`
2. Sees profile with photo, name, bio, and links
3. Clicks a link → redirected to target URL

---

## 🏗️ Technical Architecture

| Layer       | Stack / Tooling                             |
|-------------|---------------------------------------------|
| Frontend    | React (Vite), Tailwind CSS                  |
| Backend     | Supabase (Auth, DB, Storage, RLS)           |
| Database    | PostgreSQL (managed by Supabase)            |
| APIs        | Supabase JS Client (used in frontend)       |
| Deployment  | Frontend: Vercel / Netlify                  |
| Backend     | Supabase (serverless)                       |

---

## 📆 Development Roadmap

### 📍 Phase 1: MVP

#### Setup & Authentication

- Initialize React Vite + Tailwind project
- Setup Supabase project with:
  - Google Auth provider
  - Email/password enabled
- Implement:
  - "Login with Google" button
  - Email/password forms

#### Core Backend Logic

- Create `profiles` and `links` tables
- Configure RLS so users access only their data
- Create database trigger/function:
  - Auto-insert a profile row after new user signs up

#### Dashboard & Link Management

- Build `/dashboard` route (auth-protected)
- Implement CRUD for links
- Add UI to edit profile info

#### Public Profile Page

- Create dynamic route `/[username]`
- Fetch/display user profile & links
- Ensure mobile-first design & performance

---

### 🚀 Phase 2: Future Enhancements

- **Analytics**: Track link click counts
- **Customization**: Allow theme, color, font changes
- **Link Thumbnails**: Add image preview per link
- **Magic Link Login**: Enable passwordless auth

---

## 🔗 Logical Dependency Chain

1. **Supabase Setup**: Project & RLS config
2. **Authentication**: Login/logout flow
3. **Public Profile Page**: First public output
4. **Link Creation**: Enable core interaction
5. **Link Management**: Full CRUD + reordering

---

## ⚠️ Risks and Mitigations

| Risk       | Mitigation                                                           |
|------------|----------------------------------------------------------------------|
| Username conflicts                  | Real-time username availability check                                 |
| Invalid or malicious URLs           | Frontend URL format validation                            |
| Dependency on Supabase              | Acceptable for MVP. Monitor uptime. Provide status fallback.                      |

---
