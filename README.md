# AY BURRO — landing page

A single-page, bilingual (EN / ES) landing page that collects emails via **Loops.so**.
Plain HTML / CSS / JS — **no build step**. Open `index.html` to view; drop the folder on any static host to go live.

```
index.html      → the page
privacy.html    → Privacy Policy (EN + ES)
styles.css      → all styling
script.js       → language toggle, headline animation, Loops form
assets/burro.svg→ mascot PLACEHOLDER (replace with the real Figma art — see below)
```

---

## 1. Email form (Loops.so) — CONFIGURED ✅

The form is connected and live. It posts straight to Loops from the browser
(no API key needed, CORS is allowed) and sends:

- `email`
- `firstName` (from the NAME field — stored on the contact's First Name property)
- `source` = `"Website"` (so you can see where signups came from in Loops)

The form ID lives at the top of `script.js`:

```js
const LOOPS_FORM_ID = "cmqzfa44g035i0j2g4ptzokgd";
```

To point it at a different Loops form later, just replace that ID. Rate-limit (HTTP 429)
responses are handled with a friendly message. Setting the ID back to `""` re-enables DEMO mode.

---

## 2. Languages (EN / ES) — how it works

- Every visible string lives in the `I18N` object in `script.js` (and a small table at the bottom of `privacy.html`).
- A visitor switches language with the **EN / ES** toggle in the header.
- The choice is **remembered** (localStorage) and carries across both pages.
- On a first visit with no saved choice, the page **auto-detects** the browser language: Spanish browsers see ES, everyone else sees EN.
- **The English copy is exactly as the design.** Spanish only appears when the visitor picks ES.

To edit wording, change the values in `I18N` (`en` and `es` blocks). To add a third language, copy the `en` block, translate it, and add a matching toggle button.

---

## 3. Mascot

`assets/burro.png` is the real donkey, extracted straight from your Figma SVG export
(transparent background, 1024×1536). It's already wired into the page, the favicon, and
the social-share image. To swap it later, just replace that file.

> The PNG is ~2.2 MB. For faster loads you can optimize it (e.g. run it through
> [tinypng.com](https://tinypng.com) or resize to ~700 px wide) — quality stays the same,
> file size drops a lot.

The two source files in the folder — `Home _ Agency.svg` and the `ChatGPT Image … .svg` —
are no longer needed by the site and can be deleted so they aren't deployed.

---

## 4. Deploy to hayburro.com (Netlify)

No build step — it's a static site, so you just upload this folder.

**A. Put the site live (drag & drop)**
1. Sign in at [app.netlify.com](https://app.netlify.com) (free).
2. **Add new site → Deploy manually.**
3. Drag the whole `Website` folder onto the drop zone.
4. Netlify gives you a temp URL like `something.netlify.app` — open it and check it works.

**B. Connect the custom domain**
1. Site → **Domain management → Add a domain →** enter `hayburro.com`.
2. Easiest: choose **Use Netlify DNS** — Netlify shows ~4 nameservers. Log in to your
   domain registrar (where you bought hayburro.com) and replace its nameservers with those.
3. Or keep your registrar's DNS and add the records Netlify shows
   (apex `A → 75.2.60.5`, and `www CNAME → <your-site>.netlify.app`).
4. Wait for DNS to propagate (minutes–hours). Netlify auto-issues a free SSL cert; then
   turn on **Force HTTPS**.

**Future updates:** drag the folder again (or connect a Git repo for auto-deploys).

---

## Notes / things to confirm

- **Brand spelling:** the design shows **"AY BURRO"** and the footer/Privacy Policy say **"AYBURRO" / "Ayburro"**, while the domain is **hayburro.com**. I kept each exactly as supplied. Let me know if you want them unified.
- **Contact emails:** the header **CONTACT US** button links to **info@hayburro.com** (as requested). The Privacy Policy lists **contact@ayburro.com** because that's what your PDF says — tell me if it should be `info@hayburro.com` instead.
- **"ENCRYPTED INPUT" tag** is decorative styling from the design; the form uses standard HTTPS like any web form.
