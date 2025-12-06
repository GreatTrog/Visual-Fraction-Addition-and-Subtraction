# How to Deploy to Vercel

This guide explains how to deploy the Visual Fraction Addition and Subtraction app to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- The project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

1. **Log in to Vercel**: Go to [vercel.com](https://vercel.com) and log in.
2. **Add New Project**: Click on the **"Add New..."** button and select **"Project"**.
3. **Import Repository**: 
    - Find your repository in the list (you might need to adjust permissions if it's not visible).
    - Click **"Import"**.
4. **Configure Project**:
    - **Framework Preset**: Vercel should automatically detect **"Vite"**. If not, select it manually.
    - **Root Directory**: Leave as `./` (default).
    - **Build and Output Settings**: 
        - Build Command: `npm run build` (default)
        - Output Directory: `dist` (default)
        - Install Command: `npm install` (default)
5. **Environment Variables**:
    - Expand the **"Environment Variables"** section.
    - Add the following variable:
        - **Key**: `GEMINI_API_KEY`
        - **Value**: Your actual Gemini API Key
6. **Deploy**: Click **"Deploy"**.

## Post-Deployment

- Vercel will build your project. Wait for the checks to complete.
- Once finished, you will get a dashboard link and a live URL for your app.
- If you encounter 404 errors on refresh, the `vercel.json` file included in this project should handle the routing automatically.

## Troubleshooting

- **Build Failed**: Check the logs in the Vercel dashboard. Ensure `npm install` runs successfully.
- **Environment Variables**: If the app fails to fetch data, verify the `GEMINI_API_KEY` is set correctly in the Project Settings > Environment Variables.
