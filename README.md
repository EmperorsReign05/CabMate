# CabMate
**Smart Campus Mobility Solution**

A modern, centralized, full-stack carpooling platform designed to provide a structured, safe, and algorithmic way for students to find and share rides.

[View Live Site](https://cabmate.pages.dev) | [API Docs (Swagger)](https://cabmate-auaw.onrender.com/docs)

---

## The Problem
Students often struggle to find affordable travel options. Coordination happens in disorganized chat groups, leading to missed rides, safety concerns, and inefficient splitting of costs. **CabMate** centralizes this process, connecting travelers with verified peers in real-time.

## Features
CabMate is engineered for trust and efficiency:

* **Secure Authentication:** Custom JWT-based authentication system for secure sign-up and login.
* **Dynamic Ride Matching:** Interactive ride discovery powered by the OpenStreetMap/Nominatim API.
* **User Dashboard:** Real-time summary of travel activity, active rides, and requests.
* **Request System:** A "Request-Approve" workflow ensuring creators have full control over who joins their ride.
* **Contact Masking:** Phone numbers are only revealed after a ride request is approved by the creator.
* **Local Directory:** Integrated directory of fixed-rate local cab services for backup options.

---

## Tech Stack
This project utilizes a robust, containerized microservice architecture.

### Frontend (Client)
* **Framework:** React.js (Vite)
* **Styling:** Material UI / Vanilla CSS
* **Routing:** React Router DOM
* **Deployment:** Cloudflare Pages

### Backend (Server)
* **Language:** Python 3.10+
* **Framework:** FastAPI (High-performance async API)
* **Server:** Uvicorn (ASGI)
* **Architecture:** RESTful API with Pydantic models

### Database & DevOps
* **Database:** MongoDB Atlas (NoSQL Cloud Database)
* **Containerization:** Docker & Docker Compose
* **Production Host:** AWS EC2 / Render
* **Reverse Proxy:** Nginx / Cloudflare Tunneling

---

## Installation & Setup

To run CabMate locally, you need to set up both the Frontend and the Backend.

### Prerequisites
* Node.js (v18+)
* Python (v3.10+)
* MongoDB Atlas Connection String

### 1. Backend Setup
Navigate to the server directory:
```bash
cd cabmate-backend
```

Create a virtual environment and install dependencies:
```bash
# Create virtual env
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate
# Activate it (Mac/Linux)
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

Create a `.env` file in the backend folder:
```ini
MONGO_URI="mongodb+srv://<your_user>:<password>@cluster0.mongodb.net/cabmate?retryWrites=true&w=majority"
SECRET_KEY="your_secret_key_for_jwt"
```

Run the server:
```bash
uvicorn app.main:app --reload
# Server running at http://localhost:8000
```

### 2. Frontend Setup
Navigate to the client directory:
```bash
cd cabmate-frontend
```

Install dependencies:
```bash
npm install
```

Create a `.env.local` file in the frontend folder:
```ini
VITE_API_BASE_URL="http://localhost:8000"
```

Run the client:
```bash
npm run dev
# App running at http://localhost:5173
```

### Docker Support
The application is fully containerized. To run the backend in a container:
```bash
docker build -t cabmate-backend .
docker run -d -p 8000:8000 --env-file .env cabmate-backend
```

## License
Distributed under the MIT License. See LICENSE for more information.

Built by Mohammad Alman Farooqui
