/**
 * Vercel Serverless Function – /api/psn
 * Exchanges the OAuth code for the PSN Account ID (Base64).
 * Avoids browser CORS restrictions.
 */

const CLIENT_ID = "ba495a24-818c-472b-b12d-ff231c1b5745";
const CLIENT_SECRET = "mvaiZkRsAsI1IBkY";
const REDIRECT_URI = "https://remoteplay.dl.playstation.net/remoteplay/redirect";
const TOKEN_URL = "https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/token";

export default async function handler(req, res) {
  // CORS headers (optional – same origin is fine)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code } = req.body || {};
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Missing or invalid “code” parameter" });
    }

    // 1. Exchange code for access token
    const tokenBody = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI
    });

    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    const tokenRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`
      },
      body: tokenBody.toString()
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return res.status(tokenRes.status).json({
        error: `Token exchange failed (${tokenRes.status})`,
        details: text.slice(0, 300)
      });
    }

    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;
    if (!accessToken) {
      return res.status(500).json({ error: "No access_token in response" });
    }

    // 2. Fetch account info
    const accountRes = await fetch(`${TOKEN_URL}/${encodeURIComponent(accessToken)}`, {
      method: "GET",
      headers: { Authorization: `Basic ${credentials}` }
    });

    if (!accountRes.ok) {
      const text = await accountRes.text();
      return res.status(accountRes.status).json({
        error: `Account info failed (${accountRes.status})`,
        details: text.slice(0, 300)
      });
    }

    const accountInfo = await accountRes.json();
    const userIdStr = accountInfo.user_id;
    if (!userIdStr) {
      return res.status(500).json({ error: "user_id missing in account response" });
    }

    // 3. Convert to 8-byte little-endian Base64
    const userId = BigInt(userIdStr);
    const bytes = Buffer.alloc(8);
    let n = userId;
    for (let i = 0; i < 8; i++) {
      bytes[i] = Number(n & 0xffn);
      n >>= 8n;
    }

    const base64 = bytes.toString("base64");
    const hex = bytes.toString("hex");

    return res.status(200).json({
      base64,
      userId: userIdStr,
      hex
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
