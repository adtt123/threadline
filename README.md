# Threadline — Setup Guide (Written for Absolute Beginners)

This guide assumes you have never coded before. Every step tells you exactly what to click,
type, or copy. Follow them in order, top to bottom. Don't skip ahead.

**Total cost: $0.** The only possible future cost is $99/year, and only if you later want the
app on the Apple App Store — this guide skips that entirely for now.

---

## Before you start: install 3 free programs on your computer

1. **Node.js** — this lets your computer run the app's code.
   Go to https://nodejs.org, click the button that says "LTS", download it, and open the
   installer. Click "Next" through all the default options.

2. **Git** — this lets you save and upload your code to GitHub.
   Go to https://git-scm.com/downloads, download it for your operating system, and install it
   with all default options (just keep clicking "Next").

3. **A code editor** — this is where you'll open and look at the files. We recommend
   **VS Code**: go to https://code.visualstudio.com, download it, install it.

That's it for computer setup. You will not need to write any new code — everything is already
written for you in the files provided.

---

## Step 1 — Create your free GitHub account and repository

1. Go to https://github.com and click "Sign up" (skip this if you already have an account).
2. Once logged in, click the **+** icon in the top-right corner → **New repository**.
3. Name it `threadline`. Leave everything else as-is. Click **Create repository**.
4. GitHub will show you a page with some commands. Ignore those for now — we'll use simpler
   ones below.

### Put the app's files into your repository

1. Unzip the `threadline` folder you downloaded from this conversation onto your computer
   (for example, onto your Desktop).
2. Open a terminal window:
   - **Windows:** press the Windows key, type "Command Prompt", press Enter.
   - **Mac:** press Cmd+Space, type "Terminal", press Enter.
3. Type this, then press Enter, to move into the folder (adjust the path if you put it
   somewhere other than the Desktop):
   ```
   cd Desktop/threadline
   ```
4. Now type each of these lines one at a time, pressing Enter after each:
   ```
   git init
   git add .
   git commit -m "First upload"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/threadline.git
   git push -u origin main
   ```
   Replace `YOUR-USERNAME` with your actual GitHub username. It may ask you to log in — follow
   the on-screen prompts.
5. Refresh your GitHub repository page in your browser. You should now see all the files there.
   **You just uploaded your code to GitHub — that part is done forever, you'll only repeat the
   last 3 lines (`add`, `commit`, `push`) whenever you make future changes.**

---

## Step 2 — Create your free Supabase account (this is your database)

Supabase is where every contact, reminder, and expense Anupam adds actually gets saved,
permanently, for free.

1. Go to https://supabase.com and click **Start your project**. Sign up (it's free).
2. Click **New Project**.
3. Fill in:
   - **Name:** `threadline`
   - **Database Password:** make one up and **write it down somewhere safe** — you'll rarely
     need it, but don't lose it.
   - **Region:** pick whichever is closest to where Anupam is based.
4. Click **Create new project**. Wait about 2 minutes while it sets itself up (there's a
   loading screen — just wait).

### Get your two secret keys

1. Once it's ready, click the **gear icon (Settings)** in the left sidebar → **API**.
2. You'll see two things you need:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public key** (a long string of letters and numbers)
3. Keep this browser tab open — you'll copy these in Step 4.

---

## Step 3 — Create the database tables

This step creates the actual "filing cabinets" that store contacts, reminders, and expenses.

1. In Supabase, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file `supabase/schema.sql` from the threadline folder (open it in VS Code, or any
   text editor, or Notepad).
4. Select all the text in that file (Ctrl+A or Cmd+A), copy it (Ctrl+C or Cmd+C).
5. Paste it into the Supabase SQL Editor box (Ctrl+V or Cmd+V).
6. Click the green **Run** button (bottom-right).
7. You should see "Success. No rows returned." That means it worked. If you see a red error,
   make sure you copied the *entire* file, not just part of it.

---

## Step 4 — Make sure only Anupam can ever use this app

1. In Supabase, click **Authentication** in the left sidebar → **Providers**.
2. Click on **Email**.
3. Find the toggle that says **"Allow new users to sign up"** and turn it **OFF**.
   This is the single most important step — it means no one, ever, can create a new account.
4. Now go to **Authentication → Users** (in the left sidebar).
5. Click **Add user** → **Create new user**.
6. Type in Anupam's real email address and make up a password (write this password down too —
   you'll type it in one time in Step 6).
7. Click **Create user**.

You have now created the one and only account this app will ever have.

---

## Step 5 — Turn on the AI "listening" feature and the news feed

These are two small free cloud functions that do the smart parts: understanding what Anupam
says out loud, and fetching news headlines.

1. Get a free Anthropic (Claude) API key:
   - Go to https://console.anthropic.com and sign up.
   - Once inside, find **API Keys** in the menu, click **Create Key**, and copy the key it
     gives you (starts with `sk-ant-`). You'll need to add a small amount of billing credit
     here (a few dollars covers months of normal use) — there's no other way around this
     specific cost, since it's what powers the "understand what I just said" feature.

2. Install the Supabase command-line tool. In your terminal, type:
   ```
   npm install -g supabase
   ```
3. Log in:
   ```
   supabase login
   ```
   This opens your browser — click "Authorize."

4. Link your project (find "your-project-ref" in your Supabase Project URL from Step 2 — it's
   the part before `.supabase.co`):
   ```
   supabase link --project-ref your-project-ref
   ```

5. Save your Claude API key as a secret (replace with your real key):
   ```
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-real-key-here
   ```

6. Deploy both functions:
   ```
   supabase functions deploy extract-contact
   supabase functions deploy get-news
   ```

That's it — the "brain" behind voice add and the news feed are now live, for free (aside from
the small Claude API cost above).

---

## Step 6 — Connect the app to your database

1. In the `threadline` folder, find the file called `.env.example`.
2. Make a copy of it and rename the copy to exactly `.env` (no ".example" at the end).
3. Open `.env` in your text editor. Replace the placeholder text with your real values from
   Step 2:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-real-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-real-anon-key
   ```
4. Save the file.

---

## Step 7 — Install the app's building blocks

1. In your terminal, make sure you're still inside the `threadline` folder (`cd Desktop/threadline`).
2. Type:
   ```
   npm install
   ```
   This downloads everything the app needs. It may take a few minutes — that's normal.

---

## Step 8 — Build the real, installable Android app (free)

**Important:** because the voice-recognition feature uses your phone's real microphone system
(not something a simple preview tool can do), we need to build a real installable app file
rather than using the basic "Expo Go" preview app. Don't worry — this is still completely free,
just one extra step.

1. Install the free build tool:
   ```
   npm install -g eas-cli
   ```
2. Create a free Expo account if you don't have one (it'll prompt you):
   ```
   eas login
   ```
3. Start the build:
   ```
   eas build --platform android --profile preview
   ```
4. It will ask a few yes/no questions the first time (like "Generate a new Android Keystore?")
   — just press Enter to accept the defaults each time.
5. This uploads your code to Expo's free servers and builds the actual app file. It takes
   roughly 10–20 minutes. You'll see a progress link in your terminal — you can click it to
   watch the progress in your browser.
6. When it's done, you'll get a link ending in `.apk`. Open that link on Anupam's Android phone
   (or email/text it to him) and tap it — Android will ask to confirm installing an app from
   outside the Play Store. Tap "Install anyway" (this is completely safe, it's just Android
   being cautious about apps not from its store).

**The app is now installed on his phone and fully working — voice recognition, contacts,
reminders, expenses, and news, all live and saving to the database.**

---

## Step 9 — The one-time sign-in

The very first time Anupam (or you, setting it up for him) opens the app, it will show a
"one-time setup" sign-in screen. This is separate from the daily 1972 code.

1. Type in the email and password you created for him in Step 4.
2. Tap **Connect Account**.
3. The app will now remember this forever — he will never see this screen again unless he
   deletes and reinstalls the app.
4. From now on, every time he opens the app, he'll just see the **1972 keypad** — nothing else.

---

## Everyday use, from now on

- Open the app → type **1972** → he's in.
- Tap **Add** → tap the microphone → speak naturally → review what the AI understood → tap
  **Save Connection**.
- Tap **Contacts** to search, view, or edit anyone.
- Tap **Home** to see who to follow up with, upcoming reminders, and this month's expenses —
  with "+ Add" buttons right there for reminders and expenses.
- Tap **News** for headlines pulled directly from BBC, NPR, CNBC, and MarketWatch.

Any part of the app that's empty (no contacts yet, no reminders yet, no expenses yet) will
simply say so in plain words, instead of looking broken or blank.

---

## Making future updates

Whenever you or a developer changes any file:
```
git add .
git commit -m "describe what you changed"
git push
```
Then, if you want a new version installed on the phone, repeat Step 8's `eas build` command —
it produces a fresh `.apk` link to reinstall.

---

## Switching to iPhone later (when you're ready)

Everything in this project already includes the iPhone-specific permission text needed (you can
see it in `app.json` under `"ios"`), so no code needs to change. The only two differences later:

1. You'll need an **Apple Developer account** ($99/year) — this is Apple's rule, not something
   this app or Supabase charges you.
2. Instead of `eas build --platform android`, you'd run:
   ```
   eas build --platform ios
   ```
   and follow Expo's prompts to connect your Apple Developer account.

Until you're ready for that, Android works today at no cost at all.

---

## Cost recap

| Item | Cost |
|---|---|
| GitHub | Free |
| Supabase (database, login, cloud functions) | Free |
| Expo + EAS Android build | Free |
| Claude API (the "understand what I said" feature) | A few dollars a month, pay-as-you-go |
| iPhone App Store distribution (optional, later) | $99/year — skip for now |

**You can have this fully working on Android today for $0, aside from the small Claude API
credit you add once in Step 5.**
