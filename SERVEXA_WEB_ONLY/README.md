# SERVEXA — Web-only Smart Home Service Platform

A responsive React + Vite web application with a Node.js/Express REST API and MongoDB. This build removes the Flutter/mobile app and brings the customer, provider, and admin experiences into one web application with role-based workspaces.

## Features

### Customer
- Register/sign in, manage profile and service address
- Browse service categories; search and filter verified professionals
- View professional skills, experience, service area, ratings and indicative price
- Create service requests with issue description, date/time, address and optional image URL
- Track booking status, cancel pending requests, record a **demo-only** payment after completion, leave a rating/review
- Create and track support complaints

### Service provider
- Register/sign in and maintain professional profile, skills, service area, experience, rate and availability
- Choose service categories
- View incoming jobs; accept/reject pending requests; move accepted jobs to in-progress and completed
- Review job status and customer feedback
- Provider verification is controlled by the admin

### Admin
- Demo admin login and overview metrics
- Verify/reject provider accounts
- View and enable/disable accounts
- Manage bookings, service categories and support complaint status

## Tech stack
- Web UI: React, Vite, CSS, Lucide icons
- API: Node.js, Express.js, JWT, bcrypt
- Database: MongoDB / MongoDB Atlas

## Run on Windows
1. Install Node.js LTS, MongoDB Community Server, and VS Code.
2. Extract the ZIP. Open the `SERVEXA_WEB_ONLY` folder in VS Code.
3. Start MongoDB service in `services.msc` (if using local MongoDB).
4. In a terminal:
   ```powershell
   cd backend
   Copy-Item .env.example .env
   ```
   Edit `backend/.env` and set a long unique `JWT_SECRET` plus your MongoDB URI. Example:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://127.0.0.1:27017/servexa
   JWT_SECRET=replace_with_a_long_random_secret
   JWT_EXPIRES_IN=7d
   CLIENT_ORIGIN=http://localhost:5173
   ```
5. Seed service categories and the demo admin:
   ```powershell
   npm install
   npm run seed
   npm run dev
   ```
   Keep this terminal open. API health: `http://localhost:5000/api/health`.
6. Open a second terminal:
   ```powershell
   cd web
   Copy-Item .env.example .env
   npm install
   npm run dev
   ```
7. Open the URL shown by Vite, normally `http://localhost:5173`.

### Demo administrator
- Email: `admin@servexa.local`
- Password: `Admin@12345`
- Run the seed command before first login. Change the demo password and JWT secret before any deployment.

## Important integration notes
- The project uses real local API/database operations for registration, login, profile changes, provider verification, service categories, bookings, status transitions, reviews and complaint handling.
- The payment action is explicitly **demo-only**; it does not charge money. Razorpay needs merchant credentials and server-side verification before real use.
- The problem-photo field accepts an image URL for this MVP. Cloudinary/file uploads need configured cloud credentials and upload validation.
- GPS/live tracking, map navigation, live chat, OTP/email verification, and push/SMS notifications require their corresponding external providers and credentials; they are not represented as live integrations in this build.
- This is an academic MVP, not a production-hardened marketplace. Before deployment add stronger validation, provider document upload/review, audit logs, password reset, email verification, payment webhooks, privacy/legal pages, tests and production secrets management.
