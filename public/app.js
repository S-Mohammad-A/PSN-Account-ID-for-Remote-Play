/**
 * PSN Account ID Finder – bilingual (EN / FA).
 * OAuth code exchange happens only in the same-origin Cloudflare Pages Function.
 */
const CLIENT_ID = "ba495a24-818c-472b-b12d-ff231c1b5745";
const REDIRECT_URI = "https://remoteplay.dl.playstation.net/remoteplay/redirect";

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
    err_cors: "Could not reach the site API. Make sure the site is deployed on Cloudflare Pages with its Functions enabled.",
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
    err_cors: "ارتباط با API سایت برقرار نشد. مطمئن شوید سایت روی Cloudflare Pages و با فعال بودن Functions منتشر شده است.",
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

    // The code is exchanged server-side only. No browser-side fallback is used.
    const apiRes = await fetch("/api/psn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ code })
    });
    const data = await apiRes.json().catch(() => ({}));
    if (!apiRes.ok) {
      throw new Error(data.error || `API request failed (${apiRes.status})`);
    }
    if (typeof data.base64 !== "string" || typeof data.userId !== "string" || typeof data.hex !== "string") {
      throw new Error(t("err_generic"));
    }

    accountIdBase64.value = data.base64;
    userIdDecimal.value = data.userId;
    userIdHex.value = data.hex;
    showResult();
  } catch (err) {
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
