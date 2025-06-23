# Vercel Deployment Guide

This guide explains how to deploy this Next.js application to Vercel.

## One-Time Setup (For the first deployment)

If this is your first time deploying this specific version of the project, you need to configure a few things on the Vercel dashboard.

1.  **Log in to Vercel:** Go to [vercel.com](https://vercel.com) and log in.
2.  **Navigate to your Project:** Find and select your existing `cosmolaser-ui` project.
3.  **Add KV Database:**
    *   Go to the **Storage** tab.
    *   Click **Create Database** and choose **KV (Key-Value)**.
    *   Follow the instructions to create the database.
    *   **Crucially, connect the new KV store to your `cosmolaser-ui` project.** This is required for the settings to save correctly.
4.  **Add Environment Variables:**
    *   Go to **Settings** -> **Environment Variables**.
    *   Ensure the following two variables exist. If not, add them:
        *   **Key:** `DATAFORSEO_LOGIN`, **Value:** `your-dataforseo-login`
        *   **Key:** `DATAFORSEO_PASSWORD`, **Value:** `your-dataforseo-password`

## Deploying Updates

Once the initial setup is complete, you can deploy any new updates by running a single command from your terminal.

1.  **Navigate to the project's UI folder:**
    ```bash
    cd ~/cosmolaser-content-gap/cosmolaser-ui
    ```

2.  **Run the deploy command:**
    To update your production (live) URL, use:
    ```bash
    vercel --prod
    ```

Vercel will automatically detect the linked project, build your code, and deploy the new version. 