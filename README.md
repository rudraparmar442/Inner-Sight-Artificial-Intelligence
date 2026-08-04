# 🧠 Inner Sight AI

> AI-powered Mood Intelligence Platform that analyzes a user's emotional state, provides personalized wellness recommendations, and delivers actionable insights through an intelligent full-stack web application.

![Status](https://img.shields.io/badge/Status-Completed-success)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-black)
![JavaScript](https://img.shields.io/badge/Frontend-JavaScript-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)

---

# 📌 Overview

Inner Sight AI is an intelligent mood analysis platform designed to understand how users feel through an interactive questionnaire.

Based on the responses, the platform analyzes emotional patterns using an AI-powered mood engine and generates personalized wellness recommendations such as breathing exercises, mindfulness activities, journaling prompts, movement suggestions, and relaxation techniques.

The project combines modern frontend development with a scalable Node.js backend, email integration, session management, and REST APIs.

---

# ✨ Features

### 🧠 AI Mood Analysis

- Intelligent mood prediction
- Confidence score generation
- Mood intensity calculation
- Primary & secondary mood detection

Supported moods:

- 😊 Happy
- 🌊 Calm
- ⚡ Energised
- 😰 Anxious
- 😔 Sad
- 😐 Neutral

---

### 💡 Personalized Recommendations

Every detected mood returns curated wellness activities including:

- Breathing exercises
- Meditation
- Journaling
- Focus techniques
- Music therapy
- Movement activities
- Creative exercises
- Social connection ideas
- Daily planning

---

### 📧 Email Integration

Users can:

- Join the waitlist
- Receive mood analysis summaries via email
- Get personalized wellness recommendations

Powered by:

- Nodemailer
- Gmail App Password Authentication

---

### 💾 Session Management

The backend stores:

- Quiz sessions
- Mood results
- User feedback
- Waitlist subscribers

No database is required.

Data is stored using JSON persistence.

---

### 📊 Admin Dashboard APIs

Protected admin endpoints provide:

- Total users
- Mood distribution
- Average ratings
- AI usage statistics
- Session analytics
- Waitlist downloads (CSV)

---

### 🔒 Security

- Helmet
- CORS Protection
- Rate Limiting
- Admin Authentication
- Input Validation
- Compression
- Error Handling

---

# 🏗️ Project Architecture

```
                   Frontend
          HTML • CSS • JavaScript
                     │
                     │ REST API
                     ▼
            Express.js Backend
                     │
     ┌───────────────┼────────────────┐
     │               │                │
 Mood Engine     Email Service   Session Store
     │               │                │
     │          Nodemailer       JSON Storage
     │
 Local AI / OpenAI
```

---

# 🛠 Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript (ES6)

---

## Backend

- Node.js
- Express.js

---

## Middleware

- Helmet
- CORS
- Morgan
- Compression
- Express Rate Limit

---

## AI

- Local Mood Classification Engine
- OpenAI GPT Integration (Optional)

---

## Email

- Nodemailer
- Gmail SMTP

---

## Storage

- JSON File Persistence

---

## Tools

- Git
- GitHub
- VS Code
- Postman

---

# 📂 Folder Structure

```
Inner-Sight-AI
│
├── frontend
│   ├── css
│   ├── js
│   ├── images
│   └── index.html
│
├── inner-sight-backend
│   ├── middleware
│   ├── routes
│   ├── services
│   ├── data
│   ├── tests
│   ├── server.js
│   └── package.json
│
├── README.md
└── .env.example
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/Inner-Sight-AI.git

cd Inner-Sight-AI
```

---

## Backend

```bash
cd inner-sight-backend

npm install

npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## Frontend

Open the frontend using VS Code Live Server.

Example:

```
http://127.0.0.1:5501
```

---

# ⚙️ Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000
NODE_ENV=development

FRONTEND_URL=http://127.0.0.1:5501

OPENAI_API_KEY=

EMAIL_FROM=

EMAIL_APP_PASSWORD=

EMAIL_FROM_NAME=Inner Sight AI

ADMIN_EMAIL=

ADMIN_KEY=
```

---

# 📡 API Endpoints

## Health

```
GET /api/health
```

---

## Mood Analysis

```
POST /api/mood/analyse
```

---

## Feedback

```
POST /api/mood/feedback
```

---

## Email

```
POST /api/email/subscribe

POST /api/email/result
```

---

## Sessions

```
POST /api/sessions/save

GET /api/sessions
```

---

## Admin

```
GET /api/admin/stats

GET /api/admin/waitlist

GET /api/admin/sessions
```

---

# 📸 Screenshots

## Home Page

<img width="1681" height="921" alt="image" src="https://github.com/user-attachments/assets/8a407596-f11e-4bb1-beb3-afa3348abb1b" />


---

## Mood Quiz

<img width="1438" height="881" alt="image" src="https://github.com/user-attachments/assets/4d9dce8d-59d5-4f41-bf43-ae7ce4cc419f" />


---

## AI Result

<img width="1453" height="798" alt="image" src="https://github.com/user-attachments/assets/9824cc1b-58a2-49b8-8f4a-f19a76fca9e7" />


---

## Email Report

<img width="1209" height="845" alt="image" src="https://github.com/user-attachments/assets/cea56588-de19-466e-9bdc-20e25848ca23" />


---


# 🎯 Future Enhancements

- User Authentication
- Google Login
- Dashboard Analytics
- Database Migration (PostgreSQL / MongoDB)
- Mood History Graphs
- AI Chat Companion
- Voice Emotion Detection
- Journal Tracking
- Mobile Responsive PWA
- Docker Deployment

---

# 📈 Project Highlights

- Full Stack AI Web Application
- RESTful API Architecture
- Email Automation
- Modular Backend Design
- Secure API Middleware
- Production Ready Structure
- Local + OpenAI Mood Engine
- Admin Analytics APIs
- JSON Persistence (Database Independent)

---

# 👨‍💻 Author

**Rudra Parmar**

B.Tech (AI & ML)

GitHub:
https://github.com/rudraparmar442

LinkedIn:
# 🧠 Inner Sight AI

> AI-powered Mood Intelligence Platform that analyzes a user's emotional state, provides personalized wellness recommendations, and delivers actionable insights through an intelligent full-stack web application.

![Status](https://img.shields.io/badge/Status-Completed-success)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-black)
![JavaScript](https://img.shields.io/badge/Frontend-JavaScript-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)

---

# 📌 Overview

Inner Sight AI is an intelligent mood analysis platform designed to understand how users feel through an interactive questionnaire.

Based on the responses, the platform analyzes emotional patterns using an AI-powered mood engine and generates personalized wellness recommendations such as breathing exercises, mindfulness activities, journaling prompts, movement suggestions, and relaxation techniques.

The project combines modern frontend development with a scalable Node.js backend, email integration, session management, and REST APIs.

---

# ✨ Features

### 🧠 AI Mood Analysis

- Intelligent mood prediction
- Confidence score generation
- Mood intensity calculation
- Primary & secondary mood detection

Supported moods:

- 😊 Happy
- 🌊 Calm
- ⚡ Energised
- 😰 Anxious
- 😔 Sad
- 😐 Neutral

---

### 💡 Personalized Recommendations

Every detected mood returns curated wellness activities including:

- Breathing exercises
- Meditation
- Journaling
- Focus techniques
- Music therapy
- Movement activities
- Creative exercises
- Social connection ideas
- Daily planning

---

### 📧 Email Integration

Users can:

- Join the waitlist
- Receive mood analysis summaries via email
- Get personalized wellness recommendations

Powered by:

- Nodemailer
- Gmail App Password Authentication

---

### 💾 Session Management

The backend stores:

- Quiz sessions
- Mood results
- User feedback
- Waitlist subscribers

No database is required.

Data is stored using JSON persistence.

---

### 📊 Admin Dashboard APIs

Protected admin endpoints provide:

- Total users
- Mood distribution
- Average ratings
- AI usage statistics
- Session analytics
- Waitlist downloads (CSV)

---

### 🔒 Security

- Helmet
- CORS Protection
- Rate Limiting
- Admin Authentication
- Input Validation
- Compression
- Error Handling

---

# 🏗️ Project Architecture

```
                   Frontend
          HTML • CSS • JavaScript
                     │
                     │ REST API
                     ▼
            Express.js Backend
                     │
     ┌───────────────┼────────────────┐
     │               │                │
 Mood Engine     Email Service   Session Store
     │               │                │
     │          Nodemailer       JSON Storage
     │
 Local AI / OpenAI
```

---

# 🛠 Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript (ES6)

---

## Backend

- Node.js
- Express.js

---

## Middleware

- Helmet
- CORS
- Morgan
- Compression
- Express Rate Limit

---

## AI

- Local Mood Classification Engine
- OpenAI GPT Integration (Optional)

---

## Email

- Nodemailer
- Gmail SMTP

---

## Storage

- JSON File Persistence

---

## Tools

- Git
- GitHub
- VS Code
- Postman

---

# 📂 Folder Structure

```
Inner-Sight-AI
│
├── frontend
│   ├── css
│   ├── js
│   ├── images
│   └── index.html
│
├── inner-sight-backend
│   ├── middleware
│   ├── routes
│   ├── services
│   ├── data
│   ├── tests
│   ├── server.js
│   └── package.json
│
├── README.md
└── .env.example
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/Inner-Sight-AI.git

cd Inner-Sight-AI
```

---

## Backend

```bash
cd inner-sight-backend

npm install

npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## Frontend

Open the frontend using VS Code Live Server.

Example:

```
http://127.0.0.1:5501
```

---

# ⚙️ Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000
NODE_ENV=development

FRONTEND_URL=http://127.0.0.1:5501

OPENAI_API_KEY=

EMAIL_FROM=

EMAIL_APP_PASSWORD=

EMAIL_FROM_NAME=Inner Sight AI

ADMIN_EMAIL=

ADMIN_KEY=
```

---

# 📡 API Endpoints

## Health

```
GET /api/health
```

---

## Mood Analysis

```
POST /api/mood/analyse
```

---

## Feedback

```
POST /api/mood/feedback
```

---

## Email

```
POST /api/email/subscribe

POST /api/email/result
```

---

## Sessions

```
POST /api/sessions/save

GET /api/sessions
```

---

## Admin

```
GET /api/admin/stats

GET /api/admin/waitlist

GET /api/admin/sessions
```

---

# 📸 Screenshots

## Home Page

(Add Screenshot)

---

## Mood Quiz

(Add Screenshot)

---

## AI Result

(Add Screenshot)

---

## Email Report

(Add Screenshot)

---

## Admin Dashboard

(Add Screenshot)

---

# 🎯 Future Enhancements

- User Authentication
- Google Login
- Dashboard Analytics
- Database Migration (PostgreSQL / MongoDB)
- Mood History Graphs
- AI Chat Companion
- Voice Emotion Detection
- Journal Tracking
- Mobile Responsive PWA
- Docker Deployment

---

# 📈 Project Highlights

- Full Stack AI Web Application
- RESTful API Architecture
- Email Automation
- Modular Backend Design
- Secure API Middleware
- Production Ready Structure
- Local + OpenAI Mood Engine
- Admin Analytics APIs
- JSON Persistence (Database Independent)

---

# 👨‍💻 Author

**Rudra Parmar**

B.Tech (AI & ML)

GitHub:
https://github.com/rudraparmar442

LinkedIn:
https://www.linkedin.com/in/rudra-parmar-551386329/
---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

---

# 📄 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

---

# 📄 License

This project is licensed under the MIT License.
