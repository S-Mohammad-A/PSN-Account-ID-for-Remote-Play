# PSN Account ID Finder

Free open-source web tool that extracts your **PlayStation Network Account ID** in the **8-byte little-endian Base64** format required by Remote Play clients such as **Chiaki**, **chiaki-ng**, **PSPlay** and **PXPlay**.

Supports **English** and **Persian (فارسی)**.

---

## Features

- One-click official Sony login
- Paste the redirect URL → get Base64 / Decimal / Hex IDs
- Fully bilingual (EN / FA) with RTL support
- **Static mode** (client-side) + **Serverless mode** (no CORS issues)
- Ready for **Vercel** and **Cloudflare Workers**

---

## Quick Start (Static / GitHub Pages)

1. Upload the contents of the `public/` folder (or the whole repo) to any static host.
2. Open the page, choose language, click **Sign in with PlayStation**.
3. After login, copy the full redirect URL from the address bar.
4. Paste it and click **Get Account ID**.

> **Note:** Pure static hosting may hit browser CORS restrictions when talking to Sony’s API.  
> For a reliable experience deploy the serverless version below.

---

## Deploy on Vercel (Recommended)

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Vercel will detect `vercel.json` and `api/psn.js` automatically.
4. Deploy. Your site will be live at `https://your-project.vercel.app`.

The frontend automatically calls `/api/psn`, so there are **no CORS problems**.

### Local development with Vercel

```bash
npm i -g vercel
vercel dev
```

---

## Deploy on Cloudflare Workers

1. Install Wrangler:
   ```bash
   npm i -g wrangler
   ```
2. Go to the `cloudflare/` folder:
   ```bash
   cd cloudflare
   wrangler login
   wrangler deploy
   ```
3. You will get a worker URL like `https://psn-account-id.your-subdomain.workers.dev`.
4. Point your static frontend’s API calls to that URL (or serve the HTML from the same worker).

You can also paste `cloudflare/worker.js` directly into the Cloudflare dashboard → Workers → Create.

---

## Project Structure

```
psn-account-id/
├── public/                 # Static frontend (HTML / CSS / JS)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── api/
│   └── psn.js              # Vercel serverless function
├── cloudflare/
│   ├── worker.js           # Cloudflare Worker
│   └── wrangler.toml
├── vercel.json
├── LICENSE
└── README.md
```

---

## How the Account ID is calculated

1. User authenticates → receives a one-time `code`.
2. The code is exchanged for an access token (Sony OAuth).
3. The token is used to fetch the numeric `user_id`.
4. The 64-bit integer is converted to **8 little-endian bytes** and then **Base64-encoded**.

This is exactly the format expected by Chiaki and most third-party Remote Play clients.

---

## Security

- Your PSN email / password never leave Sony’s official login page.
- The one-time authorization `code` is used only once and discarded.
- No data is stored on the server or in the browser beyond the current session.
- Client ID & Secret used here are the same public values published in the open-source Chiaki project.

---

## Credits

Based on the excellent work of the **Chiaki** project:

- Original scripts by **grill2010** and **thestr4ng3r**
- [https://github.com/thestr4ng3r/chiaki](https://github.com/thestr4ng3r/chiaki)

---

## License

MIT License – see [LICENSE](LICENSE).

PlayStation and PSN are trademarks of Sony Interactive Entertainment Inc.  
This project is not affiliated with or endorsed by Sony.
