# SmartPark — Deployment & Production Guide

This guide details deployment of the SmartPark MERN stack on **MongoDB Atlas**, **Render** (Node.js API), and **Vercel** (Vite React Client).

---

## 1. Database: MongoDB Atlas

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a cluster (M0 Free Tier is sufficient for staging).
3. Under **Database Access**, create a user `smartpark_admin` with read/write privileges.
4. Under **Network Access**, add IP `0.0.0.0/0` (or Render's outbound IPs).
5. Copy the connection URI:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/smartpark_prod?retryWrites=true&w=majority
   ```
6. Indexes are created automatically by Mongoose upon startup (including 2dsphere and unique constraints).

---

## 2. Backend API: Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your Git repository.
3. Configure service settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
4. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Atlas Connection String>`
   - `JWT_SECRET`: `<32+ character cryptographically random string>`
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: `https://your-smartpark-frontend.vercel.app`
5. Render exposes the public service URL: `https://your-smartpark-api.onrender.com`.

---

## 3. Frontend SPA: Vercel

1. Create a new project on [Vercel](https://vercel.com).
2. Connect your Git repository.
3. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-smartpark-api.onrender.com/api`
5. Deploy. Vercel automatically handles Single Page Application routing (rewriting all requests to `index.html`).

---

## 4. Initial System Administrator Bootstrap

Once the backend is live in production, run the bootstrap script using your production database URI:

```bash
MONGODB_URI="<your-atlas-uri>" ADMIN_BOOTSTRAP_EMAIL="admin@smartpark.hyderabad.gov" ADMIN_BOOTSTRAP_PASSWORD="YourStrongProdPassword#2026" node scripts/create-admin.js
```
This guarantees that no public admin registration endpoint exists, protecting administrative security.
