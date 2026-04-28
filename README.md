# 📁 SLRTCE Drive Manager

## 🚀 Overview

SLRTCE Drive Manager is a secure, automated file distribution system designed for institutional use. It enables faculty members to distribute files directly into students’ Google Drive accounts after verifying their identity through Google OAuth.

The system eliminates manual sharing methods (such as email or messaging platforms) and ensures controlled, authenticated, and automated delivery of academic resources.

---

## 🎯 Problem Statement

In educational institutions, file sharing is often:

* Manual (WhatsApp, email, Drive links)
* Uncontrolled (no guarantee of delivery)
* Insecure (links can be shared externally)
* Inefficient (no automation or tracking)

---

## ✅ Solution

This system provides:

* Secure authentication using Google OAuth
* Verified student authorization before access
* Automated file delivery directly to student Google Drives
* Centralized dashboard for teacher control

---

## 🧠 Key Features

### 🔐 Authentication & Authorization

* Teacher login restricted to institutional domain (@slrtce.in)
* Student authorization using Google OAuth
* Email verification to prevent unauthorized access

### 👥 Student Management

* Add students manually
* Bulk import using CSV
* Search and filter students
* Select and delete students
* Authorization status tracking (Pending / Approved)

### 📂 File Distribution

* Upload file once
* Select multiple students
* Automatically send file to each student’s Google Drive
* No manual sharing required

### ☁️ Google Drive Integration

* Automatic folder creation in student Drive
* File upload via Google Drive API
* Uses refresh tokens for persistent access

### 🔔 User Experience

* Snackbar notifications for feedback
* Confirmation modals for critical actions
* Clean, enterprise-style dashboard UI

---

## 🔄 System Workflow

1. Teacher logs in using Google OAuth
2. Teacher registers student email
3. Student authorizes access via Google OAuth
4. System stores refresh token in database
5. Teacher uploads file
6. Backend distributes file to each student’s Drive

---

## 🏗️ System Architecture

### 🖥️ Frontend

* React (Vite)
* Handles UI, user interactions, and dashboard

### ⚙️ Backend

* Node.js + Express
* Handles API requests, authentication, and business logic

### 🗄️ Database

* MongoDB
* Stores:

  * Student records
  * Authorization status
  * Refresh tokens
  * File distribution records

### 🔐 Authentication

* Google OAuth 2.0
* Secure login and authorization

### ☁️ External APIs

* Google Drive API (file upload & folder management)

---

## 🔑 Key Concepts

### OAuth

OAuth allows secure authorization without sharing passwords. It is used for:

* Teacher login
* Student Drive access

---

### Access Token vs Refresh Token

| Token Type    | Description                                         |
| ------------- | --------------------------------------------------- |
| Access Token  | Short-lived token used to access APIs               |
| Refresh Token | Long-lived token used to generate new access tokens |

---

### Why Refresh Tokens?

Refresh tokens allow the system to:

* Access student Drive anytime
* Avoid repeated login
* Enable automation

---

## 🛠️ Technologies Used

* Frontend: React (Vite)
* Backend: Node.js, Express.js
* Database: MongoDB (Atlas)
* Authentication: Google OAuth 2.0
* File Storage: Google Drive API
* File Handling: Multer
* HTTP Client: Axios

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd slrtce-drive-manager
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
SESSION_SECRET=your_secret
MONGO_URI=your_mongodb_uri
PORT=5000
```

Run backend:

```bash
node server.js
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Application URLs

* Frontend: http://localhost:5173
* Backend: http://localhost:5000

---

## 📡 API Endpoints

### Authentication

* `GET /auth/google` → Teacher login
* `GET /auth/google/callback` → OAuth callback

### Student Management

* `POST /students` → Add student
* `GET /students` → Get all students
* `DELETE /students` → Delete students

### File Distribution

* `POST /upload` → Send file to selected students

### Utility

* `GET /me` → Check login session

---

## 🔐 Security Measures

* Domain restriction for teacher login
* Email validation for students
* OAuth-based secure authentication
* Token-based API access
* No password storage

---

## ⚠️ Limitations

* Runs on localhost (not deployed)
* Requires manual student authorization
* No real-time notifications
* Limited to Google ecosystem

---

## 🚀 Future Enhancements

* Cloud deployment (Vercel + Render)
* Email-based authorization links
* File tracking and analytics
* Role-based access control
* Activity logs and audit system
* Real-time notifications

---

## 🎓 Conclusion

SLRTCE Drive Manager transforms traditional file sharing into a secure, automated, and scalable system. By leveraging OAuth and Google Drive API, it ensures efficient and controlled distribution of academic resources in an institutional environment.

---

## 👨‍💻 Author

Developed as an academic project for demonstration and learning purposes.

---

## 📌 One-Line Summary

> A secure, automated system that distributes files directly to students’ Google Drive using OAuth and Google APIs.
