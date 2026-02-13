
# 🤖 Joe-bot

![Joe-bot](apps/joe-bot/public/joe-head.png)

Joe-bot is a small AI chat app built to experiment, learn, and ship fast.

## Landing page project links

The landing page links to joe-bot and todo-app. URLs are determined by:

- **Local**: Detects `localhost` or `127.0.0.1` and uses ports 3010 (joe-bot), 3012 (todo)
- **Production**: Set `NEXT_PUBLIC_JOE_BOT_URL` and `NEXT_PUBLIC_TODO_APP_URL` in Vercel Environment Variables for the landing-page project; otherwise fallback URLs are used

It loosely answers questions the way **Joe would**:

---

Joe-bot will say dumb things on purpose.  
That’s the point.