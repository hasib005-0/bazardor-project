# 🛒 বাজার দর (BazarDor)

বাংলাদেশের নিত্যপ্রয়োজনীয় পণ্যের বাজারদর এক নজরে দেখার responsive web application। Product price, category এবং price movement সহজে দেখা যায়।

## Technologies
- Next.js App Router + TypeScript
- Tailwind CSS v4
- Better Auth + MongoDB
- react-hot-toast, Lucide React
- Programming Hero BazarDor API

## Features
1. Responsive Bangla-first homepage with price ticker.
2. Product grid with Bengali currency and price-change badges.
3. Category pages with numeric ascending/descending sorting.
4. Protected product details and market-price summary.
5. Email/password sign in and sign up using Better Auth.
6. Google and GitHub social login when OAuth credentials are configured.
7. Toast feedback, loading skeletons, and friendly 404 page.
8. My Profile and update-name form.

## Run locally

```bash
npm install
cp .env.example .env.local
# Edit .env.local and set MongoDB URI and Better Auth secret
npm run dev
```

Open http://localhost:3000.

### Environment variables
- `BAZARDOR_API_URL`: API base URL. Default: `https://openapi.programming-hero.com/api/bazardor`. If unavailable, try `https://api.api-store.workers.dev/api/bazardor` or `https://api.abcz.workers.dev/api/bazardor`.
- `MONGODB_URI`: MongoDB Atlas connection string.
- `BETTER_AUTH_SECRET`: random secret, at least 32 characters.
- `BETTER_AUTH_URL`: application base URL.
- `NEXT_PUBLIC_APP_URL`: public application URL.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: optional Google OAuth credentials.
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`: optional GitHub OAuth credentials.

## OAuth callback URLs
Configure these exact callback URLs in the OAuth providers, replacing the domain with your deployment domain:
- Google: `https://YOUR_DOMAIN/api/auth/callback/google`
- GitHub: `https://YOUR_DOMAIN/api/auth/callback/github`

For local testing use `http://localhost:3000/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/github`.

## Deploy to Vercel
1. Push this project to your own GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Add all environment variables from `.env.local` in **Settings → Environment Variables**. Never commit `.env.local`.
4. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your exact Vercel production URL (for example `https://your-project.vercel.app`, without a trailing slash).
5. Add the deployed callback URLs to Google/GitHub OAuth settings.
6. Deploy. After changing environment variables, redeploy.
7. Test home, category routes, product detail while signed in and signed out, sign up/in/out, profile update, refresh on dynamic routes, and mobile layout.

## Git commit checklist
Use separate meaningful commits as features are added, for example:
1. `chore: initialize Next.js and Tailwind`
2. `feat: add BazarDor API client and types`
3. `feat: build responsive navbar and price ticker`
4. `feat: add homepage product sections`
5. `feat: add category filtering and price sorting`
6. `feat: add protected product details`
7. `feat: configure Better Auth and social login`
8. `feat: add profile update and deployment docs`

## Notes
The external API may use field names or response wrappers that change. Check the API response in the browser if product lists are empty, then adjust normalization in `lib/api.ts`. Price changes and market-level data are displayed only when supplied by the API; no real market data is invented.
