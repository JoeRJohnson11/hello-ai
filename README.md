
# 🤖 Joe-bot

![Joe-bot](apps/joe-bot/public/joe-head.png)

Joe-bot is a small AI chat app built to experiment, learn, and ship fast.

## Deployment (Vercel)

Deploy each app as a separate Vercel project. Set **Root Directory** to the app folder (`apps/joe-bot`, `apps/todo-app`, `apps/landing-page`).

### Environment variables

| Project | Variable | Purpose |
|---------|----------|---------|
| **landing-page** | `NEXT_PUBLIC_JOE_BOT_URL` | Joe-bot URL (fallback: joe-bot.vercel.app) |
| **landing-page** | `NEXT_PUBLIC_TODO_APP_URL` | Todo app URL (fallback: joes-todo-app.vercel.app) |
| **joe-bot** | `NEXT_PUBLIC_LANDING_PAGE_URL` | Home link target (fixes 404) |
| **todo-app** | `NEXT_PUBLIC_LANDING_PAGE_URL` | Home link target (fixes 404) |

If the Home link on joe-bot or todo-app returns 404, deploy the landing page and set `NEXT_PUBLIC_LANDING_PAGE_URL` in both apps to its production URL (e.g. `https://hello-ai-landing-page.vercel.app`).

### E2E against Vercel Preview (optional)

On pull requests, CI can run E2E tests against Vercel Preview URLs instead of local dev servers. To enable:

1. **GitHub repository variables** (Settings > Secrets and variables > Actions):
   - `VERCEL_PREVIEW_ENABLED` = `true`
   - `VERCEL_PROJECT_ID_LANDING_PAGE` = project ID from Vercel (Project Settings > General)
   - `VERCEL_PROJECT_ID_JOE_BOT` = project ID
   - `VERCEL_PROJECT_ID_TODO_APP` = project ID
   - `VERCEL_TEAM_ID` = team ID (if using a team; from vercel.com/teams)

2. **GitHub secret**: `VERCEL_TOKEN` (create at vercel.com/account/tokens)

3. Grant the token read access to deployments.

### Landing page project links

- **Local**: Detects `localhost` or `127.0.0.1` and uses ports 3010 (joe-bot), 3012 (todo)
- **Production**: Set the env vars above in each Vercel project; otherwise fallback URLs are used

It loosely answers questions the way **Joe would**:

---

Joe-bot will say dumb things on purpose.  
That’s the point.