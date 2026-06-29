# Technovation - Smart Club OS

Smart Club OS is a comprehensive club management web application designed for "Technovation". It provides a centralized platform for managing club members, events, attendance, tasks, recruitment, and internal communication.

## Features

- **Role-Based Authentication**: Secure login and registration for different roles: Member, Department Lead, and President.
- **Department Segmentation**: Organized wings for Tech, Design, PR, and Common.
- **Notice Board**: Broadcast important updates and announcements to club members.
- **Event Management**: Create, view, and manage events using the Events Registry and Calendar.
- **Attendance Tracking**: Keep track of member participation and attendance for meetings/events.
- **Task Management (Kanban Tracker)**: Assign, monitor, and track tasks across different stages.
- **Internal Chat Panel**: Seamless communication between club members.
- **Recruitment / ATS**: Manage public applications and the recruitment pipeline (Admin ATS).
- **Form Builder**: Easily create custom forms for various club needs.
- **Feedback Board**: Collect and review feedback from members.

## Tech Stack

**Frontend:**
- React (v19)
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React (for icons)

**Backend:**
- Node.js & Express.js (v5)
- MongoDB & Mongoose
- JWT (JSON Web Tokens) for Authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB (Local or Atlas)

## Setup Process

### 1. Clone the repository
```bash
git clone <repository-url>
cd "Smart Club OS"
```

### 2. Backend Setup
Navigate to the `backend` directory, install dependencies, and start the server.

```bash
cd backend
npm install
```

**Environment Variables:**
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

**Start the Backend Server:**
```bash
node server.js
```
The backend server will run on `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal window, navigate to the `frontend` directory, install dependencies, and start the development server.

```bash
cd frontend
npm install
```

**Start the Frontend Development Server:**
```bash
npm run dev
```
The frontend application will be accessible at the URL provided by Vite (usually `http://localhost:5173`).

## Project Structure
- `/frontend` - Contains the React user interface and components.
- `/backend` - Contains the Express server, Mongoose models, and API routes.