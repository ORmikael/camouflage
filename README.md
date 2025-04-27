# Camouflage Fullstack CRM

**Camouflage CRM** is a fullstack monorepo for a tour and travel customer relationship management platform. It contains:

- **Frontend:** A modern React app for the client UI.
- **Backend:** A Flask API server for data handling and business logic.

---

## 📁 Project Structure
camouflage/ 
    ├── backend/ # Flask REST API
    ├── camouflage_crm/ # React frontend 
    ├── .gitignore # Global ignores 
    ├── README.md # Project overview


---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/en/) v18+
- [Python](https://www.python.org/) v3.10+
- A virtualenv manager (e.g. `venv`, `pipenv`)
- Git

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/camouflage.git
cd camouflage

### 2. Setup frontend
cd camouflage_crm
npm install
npm start

### 3. Setup backend
cd ../backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py




📦 Deployment
Coming soon – Dockerfile, NGINX config, and CI/CD pipeline.

📄 License
MIT












 🔧 Development Notes

Monorepo, (frontend and backend ) but separated for clarity and modularity

Backend requires Python 3.11+, frontend uses Node 18+

Git - global .git file in root for monorepo backup contol and version tracking 

Preferred editors: VS Code (with workspace settings in .vscode)

VS Code (.vscode/settings.json)

.env files (for each section frontend an backend within their directory stracture  to manage their global environment variables )

Use consistent branch naming: feature/*, bugfix/*, docs/*
