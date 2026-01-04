
<p align="center">
  <h1 align="center">CabMate</h1>
  <p align="center">
    <strong>Smart Campus Mobility Solution</strong>
  </p>
  <p align="center">
    A modern,centralized,full-stack carpooling platform designed to replace chaotic WhatsApp groups with a structured, safe, and algorithmic way for students to find and share rides.
  </p>
  <p align="center">
    <a href="https://cabmate.pages.dev"><strong>View Live Site »</strong></a>
    <br />
    <br />
    <a href="#-tech-stack">Tech Stack</a>
    ·
    <a href="#-features">Features</a>
    ·
    <a href="#-installation--setup">Setup Guide</a>
  </p>
</p>

---

## 💡 The Problem
Students often struggle to find affordable travel options. Coordination happens in disorganized chat groups, leading to missed rides, safety concerns, and inefficient splitting of costs. **CabMate** centralizes this process, connecting travelers with verified peers in real-time.

## ✨ Features
CabMate is engineered for trust and efficiency:

* **🔐 Secure Authentication:** Custom JWT-based authentication system for secure sign-up and login.
* **🗺️ Dynamic Ride Matching:** Interactive ride discovery powered by the **Google Maps API**.
* **📊 User Dashboard:**  Real-time summary of travel activity, active rides, and requests.
* **🤝 Request System:** A "Request-Approve" workflow ensuring drivers have full control over who joins their ride.
* **📱 Contact Masking:** Phone numbers are only revealed *after* a ride request is approved by the driver.
* **🚕 Local Directory:** Integrated directory of fixed-rate local cab services for backup options.

---

## 🛠️ Tech Stack
This project transitioned from a serverless BaaS architecture to a **robust, containerized microservice architecture**.

### **Frontend (Client)**
* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS / Modern UI
* **Maps:** Google Maps Platform API
* **Deployment:** Cloudflare Pages

### **Backend (Server)**
* **Language:** Python 3.10+
* **Framework:** FastAPI (High-performance async API)
* **Server:** Uvicorn (ASGI)
* **Architecture:** RESTful API with Pydantic models

### **Database & DevOps**
* **Database:** MongoDB Atlas (NoSQL Cloud Database)
* **Containerization:** Docker & Docker Compose
* **Production Host:** AWS EC2 (t3.micro) / Render (Hybrid Deployment)
* **Reverse Proxy:** Nginx / Cloudflare Tunneling

---

## 🚀 Installation & Setup

To run CabMate locally, you need to set up both the **Frontend** and the **Backend**.

### Prerequisites
* Node.js (v16+)
* Python (v3.10+)
* MongoDB Atlas Connection String
* Google Maps API Key

### 1️⃣ Backend Setup
Navigate to the server directory:
```bash
cd cabmate-backend
Create a virtual environment and install dependencies:

Bash

# Create virtual env
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate
# Activate it (Mac/Linux)
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
Create a .env file in the backend folder:

Ini, TOML

MONGO_URI="mongodb+srv://<your_user>:<password>@cluster0.mongodb.net/cabmate?retryWrites=true&w=majority"
SECRET_KEY="your_secret_key_for_jwt"
Run the server:

Bash

uvicorn app.main:app --reload
# Server running at http://localhost:8000
2️⃣ Frontend Setup
Navigate to the client directory:

Bash

cd cabmate-frontend
Install dependencies:

Bash

npm install
Create a .env file in the frontend folder:

Ini, TOML

VITE_API_BASE_URL="http://localhost:8000"
VITE_GOOGLE_MAPS_API_KEY="your_google_maps_key"
Run the client:

Bash

npm run dev
# App running at http://localhost:5173
🐳 Docker Support
The application is fully containerized. To run the backend in a container:

Bash

docker build -t cabmate-backend .
docker run -d -p 8000:8000 --env-file .env cabmate-backend
📄 License
Distributed under the MIT License. See LICENSE for more information.

Built by Mohammad Alman Farooqui
