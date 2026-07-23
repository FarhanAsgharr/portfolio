# Setup — start here

Two things to do. Take about ten minutes.

1. **Get a free database** so your edits have somewhere to live.
2. **Set a password** so only you can edit.

Until you do, the site still runs and looks right — it just shows the example content and can't save changes.

---

## Step 1 — Run it

```bash
npm install
npm run dev
```

Open **http://localhost:3000**.

> If that port is busy, use `PORT=3001 npm run dev` and open port 3001 instead.

---

## Step 2 — Get a free database

You need one line of text called a **connection string**. Here's how to get one from Neon (free, no card).

1. Go to **https://neon.tech** and sign up.
2. Click **Create project**. Any name is fine.
3. On the dashboard, find **Connection string** and click **Copy**.

It looks like this:

```
postgresql://neondb_owner:AbC123xyz@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
```

That whole line is your `DATABASE_URL`. Keep it private — it's the key to your data.

<details>
<summary>Prefer Supabase?</summary>

1. Sign up at **https://supabase.com** and create a project.
2. Go to **Project Settings → Database → Connection string**.
3. Choose the **URI** tab and copy it.
4. Replace `[YOUR-PASSWORD]` in that string with the database password you set when creating the project.

Use the **Session pooler** string if one is offered — it handles more connections.
</details>

---

## Step 3 — Create your settings file

In the project folder, make a new file called exactly:

```
.env.local
```

Put this inside, pasting your own connection string:

```bash
DATABASE_URL=postgresql://paste-the-whole-thing-here
ADMIN_PASSWORD=choose-a-long-password-here
```

Two rules:

- **No quotes**, no spaces around the `=`.
- Make the password long. Anyone who has it can edit your site. A short phrase you'll remember — `blue-tractor-marmalade-91` — beats a short cryptic one.

**Now stop the server and start it again.** Settings files are only read at startup, so a running server won't see them.

```bash
# Ctrl+C to stop, then:
npm run dev
```

You don't need to create any tables. The app does that itself the first time it connects.

---

## Step 4 — Sign in and edit

Go to **http://localhost:3000/admin** and enter your password.

You'll see tabs down the left:

| Tab | What's in it |
| --- | --- |
| **You** | Name, job title, bio, **profile photo**, **résumé PDF**, availability, headline numbers |
| **Contact** | Email, location, and your GitHub / LinkedIn / X links |
| **Projects** | Add, edit, reorder and delete projects, with cover images |
| **AI Lab** | The eight AI capability cards |
| **Skills** | Skill groups and the sliders that set each bar |
| **Experience** | Jobs, dates and achievements |
| **Education** | Degrees and certificates |
| **Services** | What people can hire you for |
| **Testimonials** | Client quotes |
| **Tech stack** | The scrolling technology rail |
| **GitHub** | Your repo and follower counts |
| **Site & SEO** | Your domain and search keywords |

Edit anything, then press **Save changes** (or `⌘S` / `Ctrl+S`). Open the site in another tab and refresh — it's already updated.

**Uploading your photo and CV:** go to the **You** tab. There's a **Choose file** button under *Profile photo* and another under *Résumé*. Large photos are shrunk automatically before uploading, so a phone picture is fine.

---

## Step 5 — Put it online

The site is a normal Next.js app. Vercel is the simplest host and free for this.

1. Push this folder to a GitHub repository.
2. Go to **https://vercel.com/new** and import that repository.
3. Before clicking Deploy, open **Environment Variables** and add the same two settings from your `.env.local`:
   - `DATABASE_URL`
   - `ADMIN_PASSWORD`
4. Deploy.

Then, **in the admin panel**, go to **Site & SEO** and set *Your domain* to your real address (e.g. `https://farhanasghar.com`). Save. That fixes your Google listing and link previews.

Once it's live, `yourdomain.com/admin` works from your phone too. Same password.

---

## Optional — make the contact form send email

Without this, the contact form still works: it validates, blocks spam, and tells the sender it went through. It just doesn't put anything in your inbox.

To get the emails:

1. Sign up at **https://resend.com** (free tier).
2. Create an API key.
3. Add two more lines to `.env.local` (and to Vercel):

```bash
RESEND_API_KEY=re_your_key_here
CONTACT_TO_EMAIL=your@email.com
```

---

## If something goes wrong

**"No database connected" banner in the admin panel**
`DATABASE_URL` isn't being read. Check the file is named `.env.local` exactly (not `env.local` or `.env.local.txt`), is in the project's top folder, and that you restarted the server.

**The login page shows setup instructions instead of a password box**
`ADMIN_PASSWORD` isn't set. Same checks as above.

**"That password isn't right"**
The password is whatever is after `ADMIN_PASSWORD=` in `.env.local`, exactly — no quotes, no trailing spaces.

**Connection errors mentioning SSL or timeouts**
Make sure you copied the *whole* connection string including `?sslmode=require`. On Supabase, check you replaced `[YOUR-PASSWORD]` with your real password.

**I edited something and want the examples back**
Admin panel → **Reset to example** at the bottom of the left sidebar. This wipes your content, so be sure.

**Locked out**
Change `ADMIN_PASSWORD` in `.env.local` (or in Vercel's settings) and restart. There's no email recovery — the password *is* the account.
