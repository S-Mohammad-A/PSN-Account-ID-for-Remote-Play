/**
 * PSN Account ID Finder – bilingual (EN / FA)
 * Supports both pure client-side and serverless API (/api/psn)
 */

const CLIENT_ID = "ba495a24-818c-472b-b12d-ff231c1b5745";
const CLIENT_SECRET = "mvaiZkRsAsI1IBkY";
const REDIRECT_URI = "https://remoteplay.dl.playstation.net/remoteplay/redirect";
const TOKEN_URL = "https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/token";

const LOGIN_URL =
  "https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/authorize" +
  "?service_entity=urn:service-entity:psn" +
  "&response_type=code" +
  `&client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  "&scope=psn:clientapp" +
  "&request_locale=en_US" +
  "&ui=pr" +
  "&service_logo=ps" +
  "&layout_type=popup" +
  "&smcid=remoteplay" +
  "&prompt=always" +
  "&PlatformPrivacyWs1=minimal" +
  "&no_captcha=true";

/* ──────────────────── i18n ──────────────────── */
const translations = {
  en: {
    subtitle: "Extract your PlayStation Network Account ID in Base64 format",
    step1_title: "Sign in to PlayStation",
    step1_desc: "Click the button below to open the official Sony login page. Sign in with your PSN account. After signing in you will see a page that says <strong>redirect</strong>.",
    btn_login: "Sign in with PlayStation",
    hint_password: "Your password is entered only on Sony’s official site and is never sent to this tool.",
    step2_title: "Paste the redirect URL",
    step2_desc: "After a successful login, copy the full address from the browser’s address bar (it usually starts with <code>https://remoteplay.dl.playstation.net/remoteplay/redirect?code=...</code>) and paste it into the box below.",
    btn_extract: "Get Account ID",
    result_title: "Result",
    label_base64: "PSN Account ID (Base64 – for Chiaki / PSPlay)",
    label_decimal: "User ID (Decimal)",
    label_hex: "Hex (Little-Endian)",
    btn_copy: "Copy",
    btn_copied: "Copied!",
    success_msg: "Account ID extracted successfully. You can use it in Chiaki or other Remote Play apps.",
    error_title: "Error",
    loading: "Contacting Sony servers...",
    footer_privacy: "This tool is fully client-side (or uses a short-lived serverless function) and does not store any of your account data. Based on the open-source Chiaki scripts.",
    footer_disclaimer: "Not affiliated with Sony Interactive Entertainment. PlayStation and PSN are trademarks of Sony Interactive Entertainment Inc.",
    err_invalid_url: "The URL you pasted is invalid. Make sure you copied the full redirect address (it must contain a “code” parameter).",
    err_no_token: "Could not obtain an access token. The code may have expired. Please sign in again and copy a fresh redirect URL.",
    err_no_userid: "User ID was not found in the server response.",
    err_cors: "The request failed due to browser CORS restrictions. Deploy the serverless version (Vercel / Cloudflare) or open the page from a local server.",
    err_generic: "An unexpected error occurred. Please try again."
  },
  fa: {
    subtitle: "استخراج شناسه حساب پلی‌استیشن به فرمت Base64",
    step1_title: "ورود به حساب پلی‌استیشن",
    step1_desc: "روی دکمه زیر کلیک کنید تا صفحه ورود رسمی سونی باز شود. با حساب PSN خود وارد شوید. بعد از ورود، صفحه‌ای با نوشته <strong>redirect</strong> ظاهر می‌شود.",
    btn_login: "شروع ورود به PSN",
    hint_password: "رمز عبور شما فقط در سایت رسمی سونی وارد می‌شود و هیچ‌وقت به این ابزار ارسال نمی‌شود.",
    step2_title: "کپی لینک Redirect",
    step2_desc: "بعد از ورود موفق، آدرس کامل نوار مرورگر (که معمولاً با <code>https://remoteplay.dl.playstation.net/remoteplay/redirect?code=...</code> شروع می‌شود) را کپی کنید و در کادر زیر بچسبانید.",
    btn_extract: "دریافت Account ID",
    result_title: "نتیجه",
    label_base64: "PSN Account ID (Base64 – مناسب Chiaki / PSPlay)",
    label_decimal: "User ID (عدد دهدهی)",
    label_hex: "Hex (Little-Endian)",
    btn_copy: "کپی",
    btn_copied: "کپی شد!",
    success_msg: "شناسه با موفقیت استخراج شد. می‌توانید آن را در Chiaki یا سایر برنامه‌های Remote Play استفاده کنید.",
    error_title: "خطا",
    loading: "در حال ارتباط با سرورهای سونی...",
    footer_privacy: "این ابزار کاملاً سمت کلاینت است (یا از یک تابع سرور موقت استفاده می‌کند) و هیچ‌کدام از اطلاعات حساب شما را ذخیره نمی‌کند. بر پایه اسکریپت‌های متن‌باز Chiaki ساخته شده است.",
    footer_disclaimer: "این پروژه وابسته به Sony Interactive Entertainment نیست. PlayStation و PSN علائم تجاری متعلق به سونی هستند.",
    err_invalid_url: "لینک وارد شده معتبر نیست. مطمئن شوید که آدرس کامل صفحه redirect را کپی کرده‌اید (باید پارامتر code داشته باشد).",
    err_no_token: "توکن دسترسی دریافت نشد. ممکن است کد منقضی شده باشد. دوباره وارد شوید و لینک جدید را کپی کنید.",
    err_no_userid: "شناسه کاربر در پاسخ سرور یافت نشد.",
    err_cors: "درخواست به دلیل محدودیت CORS مرورگر ناموفق بود. نسخه سمت‌سرور (Vercel / Cloudflare) را دیپلوی کنید یا صفحه را از یک سرور محلی باز کنید.",
    err_generic: "خطای ناشناخته رخ داد. لطفاً دوباره تلاش کنید."
  }
};

let currentLang = localStorage.getItem("psn-lang") || "en";

function t(key) {
  return translations[currentLang][key] || translations.en[key] || key;
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("psn-lang", lang);

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  document.body.dir = lang === "fa" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = t(key);
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      // skip
    } else {
      el.innerHTML = value;
    }
  });

  // Update step numbers for RTL
  const numbers = document.querySelectorAll(".step-number");
  if (numbers.length >= 2) {
    numbers[0].textContent = lang === "fa" ? "۱" : "1";
    numbers[1].textContent = lang === "fa" ? "۲" : "2";
  }

  // Active button
  document.getElementById("langEn").classList.toggle("active", lang === "en");
  document.getElementById("langFa").classList.toggle("active", lang === "fa");
}

/* ──────────────────── DOM ──────────────────── */
const btnLogin = document.getElementById("btnLogin");
const redirectUrlInput = document.getElementById("redirectUrl");
const btnExtract = document.getElementById("btnExtract");
const resultSection = document.getElementById("resultSection");
const errorSection = document.getElementById("errorSection");
const errorMsg = document.getElementById("errorMsg");
const loading = document.getElementById("loading");
const accountIdBase64 = document.getElementById("accountIdBase64");
const userIdDecimal = document.getElementById("userIdDecimal");
const userIdHex = document.getElementById("userIdHex");

redirectUrlInput.addEventListener("input", () => {
  btnExtract.disabled = !redirectUrlInput.value.trim();
});

btnLogin.addEventListener("click", () => {
  window.open(LOGIN_URL, "_blank", "noopener,noreferrer");
});

btnExtract.addEventListener("click", async () => {
  const urlStr = redirectUrlInput.value.trim();
  if (!urlStr) return;

  hideError();
  hideResult();
  showLoading();

  try {
    const code = extractCode(urlStr);
    if (!code) throw new Error(t("err_invalid_url"));

    // Prefer serverless API if available (avoids CORS)
    let data;
    try {
      const apiRes = await fetch("/api/psn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      if (apiRes.ok) {
        data = await apiRes.json();
      } else {
        // API exists but returned error – surface it
        const errBody = await apiRes.json().catch(() => ({}));
        throw new Error(errBody.error || `API error ${apiRes.status}`);
      }
    } catch (apiErr) {
      // If the path /api/psn does not exist (static hosting) fall back to client-side
      if (apiErr.message && (apiErr.message.includes("Failed to fetch") || apiErr.message.includes("404"))) {
        data = await clientSideFlow(code);
      } else {
        throw apiErr;
      }
    }

    accountIdBase64.value = data.base64;
    userIdDecimal.value = data.userId;
    userIdHex.value = data.hex;
    showResult();
  } catch (err) {
    console.error(err);
    let msg = err.message || t("err_generic");
    if (msg.includes("CORS") || msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      msg = t("err_cors");
    }
    showError(msg);
  } finally {
    hideLoading();
  }
});

document.querySelectorAll(".btn-copy").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    if (input && input.value) {
      navigator.clipboard.writeText(input.value).then(() => {
        const original = btn.textContent;
        btn.textContent = t("btn_copied");
        setTimeout(() => (btn.textContent = original), 1500);
      });
    }
  });
});

document.getElementById("langEn").addEventListener("click", () => applyLanguage("en"));
document.getElementById("langFa").addEventListener("click", () => applyLanguage("fa"));

/* ──────────────────── helpers ──────────────────── */
function extractCode(urlStr) {
  try {
    let url;
    if (urlStr.startsWith("http")) {
      url = new URL(urlStr);
    } else {
      url = new URL("https://dummy?" + urlStr.replace(/^\?/, ""));
    }
    return url.searchParams.get("code");
  } catch {
    const match = urlStr.match(/[?&]code=([^&]+)/);
    return match ? match[1] : null;
  }
}

async function clientSideFlow(code) {
  const tokenData = await exchangeCodeForToken(code);
  const accessToken = tokenData.access_token;
  if (!accessToken) throw new Error(t("err_no_token"));

  const accountInfo = await getAccountInfo(accessToken);
  const userIdStr = accountInfo.user_id;
  if (!userIdStr) throw new Error(t("err_no_userid"));

  const userId = BigInt(userIdStr);
  return {
    base64: encodeAccountId(userId),
    userId: userIdStr,
    hex: toLittleEndianHex(userId)
  };
}

async function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI
  });
  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`
    },
    body: body.toString()
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token request failed (${response.status}): ${text.slice(0, 180)}`);
  }
  return response.json();
}

async function getAccountInfo(accessToken) {
  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const response = await fetch(`${TOKEN_URL}/${encodeURIComponent(accessToken)}`, {
    method: "GET",
    headers: { Authorization: `Basic ${credentials}` }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Account info failed (${response.status}): ${text.slice(0, 150)}`);
  }
  return response.json();
}

function encodeAccountId(userId) {
  const bytes = new Uint8Array(8);
  let n = userId;
  for (let i = 0; i < 8; i++) {
    bytes[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return btoa(String.fromCharCode(...bytes));
}

function toLittleEndianHex(userId) {
  const bytes = new Uint8Array(8);
  let n = userId;
  for (let i = 0; i < 8; i++) {
    bytes[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function showLoading() { loading.classList.remove("hidden"); }
function hideLoading() { loading.classList.add("hidden"); }
function showResult() { resultSection.classList.remove("hidden"); }
function hideResult() { resultSection.classList.add("hidden"); }
function showError(msg) {
  errorMsg.textContent = msg;
  errorSection.classList.remove("hidden");
}
function hideError() { errorSection.classList.add("hidden"); }

/* Init */
applyLanguage(currentLang);
