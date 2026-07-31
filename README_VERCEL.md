# Vercel Deployment Guide

1. Create a free database on **Neon** (neon.tech) or **Supabase** (supabase.com).
2. Copy the **Database Connection URL** (e.g. `postgresql://user:password@host/db`).
3. Export this AI Studio project to **GitHub**.
4. Go to **Vercel**, click "Add New Project", and import your GitHub repository.
5. In the Vercel deployment settings, under **Environment Variables**, add:
   - Key: `DATABASE_URL`
   - Value: `<your-neon-or-supabase-connection-url>`
6. Click **Deploy**.

Vercel will automatically build the frontend and deploy your Express API endpoints as Serverless Functions.
