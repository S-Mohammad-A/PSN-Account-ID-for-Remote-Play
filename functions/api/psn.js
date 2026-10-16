/**
 * Cloudflare Pages Function: POST /api/psn
 * Exchanges a one-time Sony OAuth code and returns the PSN Account ID.
 * Configure PSN_CLIENT_SECRET as a Cloudflare Pages secret; never put it in frontend code.
 */
const CLIENT_ID = "ba495a24-818c-472b-b12d-ff231c1b5745";
const REDIRECT_URI = "https://remoteplay.dl.playstation.net/remoteplay/redirect";
const TOKEN_URL = "https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/token";
const MAX_CODE_LENGTH = 4096;

export async function onRequestPost({ request, env }) {
  // This endpoint is intended to be called by the site's own frontend.
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return json({ error: "Cross-origin request denied." }, 403);
      }
    } catch {
      return json({ error: "Invalid request origin." }, 403);
    }
  }

  const clientSecret = env.PSN_CLIENT_SECRET;
  if (!clientSecret || typeof clientSecret !== "string") {
    return json({ error: "Server is not configured. Set the PSN_CLIENT_SECRET secret in Cloudflare Pages." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const code = body?.code;
  if (typeof code !== "string" || !code.trim() || code.length > MAX_CODE_LENGTH) {
    return json({ error: "Missing or invalid authorization code." }, 400);
  }

  const credentials = btoa(`${CLIENT_ID}:${clientSecret}`);
  const tokenBody = new URLSearchParams({
    grant_type: "authorization_code",
    code: code.trim(),
    redirect_uri: REDIRECT_URI
  });

  try {
    const tokenRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`
      },
      body: tokenBody.toString()
    });

    if (!tokenRes.ok) {
      // Do not forward upstream response bodies: they can contain sensitive details.
      return json({
        error: tokenRes.status === 400 || tokenRes.status === 401
          ? "Sony rejected the authorization code. It may be expired or already used; sign in again."
          : "Sony token exchange failed. Please try again later."
      }, tokenRes.status === 400 || tokenRes.status === 401 ? 400 : 502);
    }

    const tokenData = await tokenRes.json();
    if (typeof tokenData?.access_token !== "string" || !tokenData.access_token) {
      return json({ error: "Sony did not return an access token." }, 502);
    }

    const accountRes = await fetch(`${TOKEN_URL}/${encodeURIComponent(tokenData.access_token)}`, {
      method: "GET",
      headers: { Authorization: `Basic ${credentials}` }
    });

    if (!accountRes.ok) {
      return json({ error: "Could not retrieve account information from Sony. Please sign in again." }, 502);
    }

    const accountData = await accountRes.json();
    const userId = accountData?.user_id;
    if (!(typeof userId === "string" || (typeof userId === "number" && Number.isSafeInteger(userId))) || !/^\d+$/.test(String(userId))) {
      return json({ error: "Sony response did not contain a valid user ID." }, 502);
    }

    const userIdString = String(userId);
    const numericId = BigInt(userIdString);
    if (numericId < 0n || numericId > 0xffffffffffffffffn) {
      return json({ error: "Sony returned an account ID outside the supported range." }, 502);
    }

    const bytes = new Uint8Array(8);
    let value = numericId;
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Number(value & 0xffn);
      value >>= 8n;
    }

    return json({
      base64: btoa(String.fromCharCode(...bytes)),
      userId: userIdString,
      hex: Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
    }, 200);
  } catch {
    // Intentionally avoid logging the code, tokens, or upstream response contents.
    return json({ error: "A network or server error occurred. Please try again." }, 502);
  }
}

export async function onRequest({ request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { "Allow": "POST, OPTIONS" } });
  }
  return json({ error: "Method not allowed." }, 405, { Allow: "POST, OPTIONS" });
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders
    }
  });
}
