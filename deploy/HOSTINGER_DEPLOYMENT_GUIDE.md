# Hostinger Business Web Hosting Deployment Guide for Chess Play

This guide details how to host both **`https://chessplay.in`** (Marketing Website) and **`https://app.chessplay.in`** (Chess SaaS Platform) on your Hostinger Business Web Hosting plan.

---

## Architecture Overview

| Domain / Subdomain | Application | Local Directory | Hostinger Directory |
| :--- | :--- | :--- | :--- |
| **`https://chessplay.in`** | Marketing & Academy Landing Site | `apps/web/dist/` | `public_html/` |
| **`https://app.chessplay.in`** | SaaS Portal, Stockfish Engine & LMS | `apps/app/dist/` | `public_html/app/` (or Subdomain root) |

---

## Step 1: Subdomain Setup in Hostinger hPanel

1. Log in to your [Hostinger hPanel](https://hpanel.hostinger.com/).
2. Select your hosting account for **`chessplay.in`**.
3. In the left navigation menu, go to **Websites** > **Subdomains**.
4. Enter the subdomain details:
   - **Subdomain Name**: `app`
   - **Custom folder for subdomain**: Check this box and enter `public_html/app` (or default `domains/app.chessplay.in/public_html`).
5. Click **Create**.

---

## Step 2: DNS & SSL Setup

1. **DNS Records** (Under **Advanced** > **DNS Zone Editor**):
   - **A Record**: `@` points to your Hostinger server IP.
   - **CNAME Record**: `www` points to `chessplay.in`.
   - **CNAME Record**: `app` points to `chessplay.in` (or an A record pointing to your server IP).
2. **SSL Certificate**:
   - In hPanel, navigate to **Security** > **SSL**.
   - Hostinger provides free Let's Encrypt SSL certificates with automatic renewal.
   - Ensure SSL is activated for both **`chessplay.in`** and **`app.chessplay.in`**.
   - Enable **Force HTTPS**.

---

## Step 3: Generating Production Build Bundles

In your local terminal, run:

```bash
# From the project root (/Users/drkgp/GIT HUB/ChessPlay)
bash deploy/package_deploy.sh
```

This generates two ready-to-upload zip files inside `deploy/dist_packages/`:
1. `app_chessplay_in.zip` (for `app.chessplay.in`)
2. `chessplay_in_marketing.zip` (for `chessplay.in`)

---

## Step 4: Uploading Files to Hostinger File Manager

1. In Hostinger hPanel, open **File Manager** (Files > File Manager).
2. **Deploy Marketing Website (`chessplay.in`)**:
   - Navigate to `/public_html/`.
   - Upload `chessplay_in_marketing.zip`.
   - Right-click and **Extract** directly into `/public_html/`.
   - Ensure `.htaccess` and `index.html` are at the root of `public_html/`.
3. **Deploy Web App (`app.chessplay.in`)**:
   - Navigate to `/public_html/app/` (the folder created in Step 1).
   - Upload `app_chessplay_in.zip`.
   - Right-click and **Extract** directly into `/public_html/app/`.
   - Ensure `.htaccess` and `index.html` are present inside `/public_html/app/`.

---

## Step 5: LiteSpeed Cache & Performance Verification

Both applications come pre-configured with `.htaccess` rules tailored for Hostinger's LiteSpeed Enterprise web server:
- **SPA Routing**: LiteSpeed automatically redirects sub-routes back to `index.html` without 404 errors.
- **Gzip & Brotli Compression**: Pre-activated for JS, CSS, SVG, and WASM.
- **Zero Server CPU Drain**: Stockfish 16+ NNUE runs client-side in browser Web Workers, meaning 1,000+ simultaneous students will never trigger Hostinger CloudLinux CPU throttles!

Test both URLs in your browser:
- `https://chessplay.in`
- `https://app.chessplay.in`
