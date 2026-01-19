# Shubham EPC – EHS Reporting & Analytics System

## Tech Stack
- **Frontend:** Next.js 14, Tailwind CSS, Recharts
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT Role Based (Admin/Manager)

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running
- Create a database named `ehs_db`

### Backend Setup
1. Navigate to backend: `cd backend`
2. Install dependencies: `npm install`
3. Configure `.env`:
   - Check `.env` file and update DB_PASSWORD or other credentials if needed.
4. Run Database Schema:
   - Run the SQL commands in `schema.sql` in your Postgres database or use a tool like pgAdmin.
5. Seed Data:
   - Run `node seed.js` to create initial Admin and Manager accounts.
   - Credentials:
     - Admin: `admin` / `password123`
     - Manager: `manager1` / `password123`
6. Start Server:
   - `npm start` or `npm run dev`

### Frontend Setup
1. Navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
   - Additional libs: `npm install axios recharts lucide-react`
3. Start Dev Server:
   - `npm run dev`
4. Access App: `http://localhost:3000`

## Features
- **Admin Dashboard:** KPIs, Charts, Project Management.
- **Site Manager:** Monthly EHS Reporting, File Uploads.
- **Export:** Export data to Excel/CSV (Implemented on demand or via frontend tables).

## Project Structure
- `backend/`: API and Database logic.
- `frontend/`: Next.js UI Application.
