# TaskFlow – Smart Team Workflow & Productivity Management Platform

JavaScript-only MVP. Stack:
- Backend: Express, MySQL, JWT, Socket.io, Nodemailer, node-cron
- Frontend: Next.js (React), Recharts, socket.io-client

## 1) Folder structure
- server → API, sockets, cron, DB schema
- client → Next.js app (dashboard, chat, simple analytics)

## 2) Prerequisites
- Node 18+
- MySQL 8+

## 3) Setup
### Database
1) Create DB and import schema
```
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS taskflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p taskflow < server/schema.sql
```

### Backend (server)
1) Copy env
```
cp server/.env.example server/.env
```
2) Edit `server/.env` with your DB credentials and email SMTP (optional for daily summary)
3) Install and run
```
cd server
npm install
npm run dev
```
Server runs at http://localhost:5000

### Frontend (client)
1) Copy env
```
cp client/.env.local.example client/.env.local
```
2) Install and run
```
cd client
npm install
npm run dev
```
App runs at http://localhost:3000

## 4) Using the app
1) Open http://localhost:3000 → Sign up a user (first user can be admin by editing DB or sign up then change role in DB)
2) Login → Dashboard loads
3) Projects
   - Create a project via API temporarily (POST /api/projects) using a REST client, or add directly in DB. Minimal UI focuses on tasks/board + chat.
4) Tasks
   - In Dashboard, select a project. Create tasks, change status (To Do / In Progress / Completed), set priority.
5) Chat
   - Open a project chat from Dashboard. Messages are real-time via Socket.io.
6) Analytics
   - Simple line chart of task counts by date.
7) Daily summaries (optional)
   - Configure SMTP in server/.env. A cron job emails project members daily at 18:30 server time.

## 5) API quick reference
Base URL: http://localhost:5000/api
- POST /auth/signup {name,email,password,role?}
- POST /auth/login {email,password}
- GET /projects (auth)
- POST /projects (admin/manager) {name,description,memberIds?}
- GET /projects/:id (auth)
- GET /tasks?projectId= (auth)
- POST /tasks (auth) {title,description?,projectId,assigneeId?,priority?,status?,dueDate?}
- PATCH /tasks/:id (auth)
- DELETE /tasks/:id (auth)
- GET /messages/:projectId (auth)
- GET /notifications (auth)
- POST /notifications/read {ids: number[]} (auth)

Auth: Send `Authorization: Bearer <token>` returned by login/signup.

## 6) Notes and next steps
- Roles: admin/manager/member. For quick testing, set role directly:
```
UPDATE users SET role='admin' WHERE email='you@example.com';
```
- Security/validation is minimal for MVP. Add rate limits, stronger validation, file uploads for chat, etc.
- Kanban is simplified (no drag-and-drop). Add drag DnD (e.g., react-beautiful-dnd) later.
- Project creation UI is minimal; currently basic via API/DB.
- Add notifications on task changes and online users list in chat as future enhancements.
