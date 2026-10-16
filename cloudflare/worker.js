/**
 * Cloudflare Worker – PSN Account ID API
 * Deploy with: wrangler deploy
 * Or paste into the Cloudflare dashboard.
 */

const CLIENT_ID = "ba495a24-818c-472b-b12d-ff231c1b5745";
const CLIENT_SECRET = "mvaiZkRsAsI1IBkY";
const REDIRECT_URI = "https://remoteplay.dl.playstation.net/remoteplay/redirect";
const TOKEN_URL = "https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/token";

export default {
  async fetch(request, env, ctx) {
    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    try {
      const body = await request.json();
      const code = body?.code;
      if (!code || typeof code !== "string") {
        return json({ error: "Missing or invalid “code” parameter" }, 400);
      }

      // 1. Token exchange
      const tokenBody = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI
      });

      const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

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
        return json({
          error: `Token exchange failed (${tokenRes.status})`,
          details: text.slice(0, 300)
        }, tokenRes.status);
      }

      const tokenJson = await tokenRes.json();
      const accessToken = tokenJson.access_token;
      if (!accessToken) {
        return json({ error: "No access_token in response" }, 500);
      }

      // 2. Account info
      const accountRes = await fetch(`${TOKEN_URL}/${encodeURIComponent(accessToken)}`, {
        method: "GET",
        headers: { Authorization: `Basic ${credentials}` }
      });

      if (!accountRes.ok) {
        const text = await accountRes.text();
        return json({
          error: `Account info failed (${accountRes.status})`,
          details: text.slice(0, 300)
        }, accountRes.status);
      }

      const accountInfo = await accountRes.json();
      const userIdStr = accountInfo.user_id;
      if (!userIdStr) {
        return json({ error: "user_id missing in account response" }, 500);
      }

      // 3. Encode
      const userId = BigInt(userIdStr);
      const bytes = new Uint8Array(8);
      let n = userId;
      for (let i = 0; i < 8; i++) {
        bytes[i] = Number(n & 0xffn);
        n >>= 8n;
      }

      const base64 = btoa(String.fromCharCode(...bytes));
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return json({ base64, userId: userIdStr, hex });
    } catch (err) {
      return json({ error: err.message || "Internal server error" }, 500);
    }
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders()
    }
  });
}
