# Quick start — Windows

**You need:** Node.js LTS, MongoDB Community Server (or a MongoDB Atlas URI), and VS Code.

1. Extract the ZIP and open the extracted folder in VS Code.
2. Start MongoDB if using local MongoDB.
3. Terminal 1:
   ```powershell
   cd backend
   Copy-Item .env.example .env
   ```
   Edit `.env`; set `MONGO_URI` and a long random `JWT_SECRET`.
   ```powershell
   npm install
   npm run seed
   npm run dev
   ```
4. Terminal 2:
   ```powershell
   cd web
   Copy-Item .env.example .env
   npm install
   npm run dev
   ```
5. Open `http://localhost:5173`.
6. Admin demo: `admin@servexa.local` / `Admin@12345`.

If PowerShell says `Copy-Item` destination exists, do not overwrite it; edit the existing `.env` instead. If API requests fail, confirm `http://localhost:5000/api/health` works and MongoDB is running.
