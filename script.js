/* ============================================================
   AY BURRO — landing page logic
   - Per-letter headline reveal
   - EN / ES language toggle
   - Loops.so email capture
   ============================================================ */

/* ---------------------------------------------------------------
   1) LOOPS.SO CONFIG  ←★ EDIT THIS
   ---------------------------------------------------------------
   Create a Sign-up Form in Loops (Forms → New form → "Use your own
   form / API"). Loops gives you an endpoint that ends in an ID, e.g.
   https://app.loops.so/api/newsletter-form/clxxxxxxxxxxxxxx
   Paste ONLY that ID below.

   Leave it as "" to run in DEMO mode (the form fakes a success so you
   can preview the flow without sending anything).
---------------------------------------------------------------- */
const LOOPS_FORM_ID = "cmqzfa44g035i0j2g4ptzokgd";

/* ---------------------------------------------------------------
   2) TRANSLATIONS
   English copy is kept exactly as the design. Spanish is shown only
   when the visitor switches to ES.
---------------------------------------------------------------- */
const I18N = {
  en: {
    contact:          "CONTACT US",
    line1:            "WHERE WILL",
    line2:            "HE GO NEXT?",
    label_name:       "NAME",
    ph_name:          "Enter your name",
    label_email:      "EMAIL",
    ph_email:         "SECURE.COMMS@DOMAIN.COM",
    encrypted:        "ENCRYPTED INPUT",
    submit:           "LET'S GO",
    footer_instagram: "INSTAGRAM",
    footer_privacy:   "PRIVACY",
    footer_copy:      "© 2026 HAYBURRO. ALL RIGHTS RESERVED.",
    status_sending:   "SENDING…",
    status_ok:        "YOU'RE ON THE LIST.",
    status_invalid:   "ENTER A VALID EMAIL.",
    status_error:     "SOMETHING WENT WRONG. TRY AGAIN.",
    status_rate:      "TOO MANY ATTEMPTS. WAIT A MOMENT.",
  },
  es: {
    contact:          "CONTÁCTANOS",
    line1:            "¿A DÓNDE",
    line2:            "IRÁ DESPUÉS?",
    label_name:       "NOMBRE",
    ph_name:          "Escribe tu nombre",
    label_email:      "CORREO",
    ph_email:         "Email",
    encrypted:        "ENTRADA CIFRADA",
    submit:           "VAMOS",
    footer_instagram: "INSTAGRAM",
    footer_privacy:   "PRIVACIDAD",
    footer_copy:      "© 2026 HAYBURRO. TODOS LOS DERECHOS RESERVADOS.",
    status_sending:   "ENVIANDO…",
    status_ok:        "ESTÁS EN LA LISTA.",
    status_invalid:   "INGRESA UN CORREO VÁLIDO.",
    status_error:     "ALGO SALIÓ MAL. INTÉNTALO DE NUEVO.",
    status_rate:      "DEMASIADOS INTENTOS. ESPERA UN MOMENTO.",
  },
};

let currentLang = "en";

/* ---------------------------------------------------------------
   Apply translations to the DOM
---------------------------------------------------------------- */
function applyLang(lang) {
  currentLang = I18N[lang] ? lang : "en";
  const dict = I18N[currentLang];
  document.documentElement.lang = currentLang;

  // text content
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] != null) el.textContent = dict[key];
  });

  // placeholders
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    const key = el.getAttribute("data-i18n-ph");
    if (dict[key] != null) el.setAttribute("placeholder", dict[key]);
  });

  // headline (needs per-letter rebuild)
  renderHeadline(dict);

  // toggle active state
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });

  try { localStorage.setItem("ayburro-lang", currentLang); } catch (e) {}
}

/* ---------------------------------------------------------------
   Headline: wrap each character in a span and stagger the reveal
---------------------------------------------------------------- */
function renderHeadline(dict) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let i = 0;

  document.querySelectorAll(".headline .line").forEach((line) => {
    const key = line.getAttribute("data-i18n-headline");
    const text = dict[key] || "";
    line.textContent = "";

    for (const ch of text) {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = ch;                 // spaces preserved via white-space: pre
      span.style.setProperty("--i", i++);
      if (reduce) span.classList.add("reveal");
      line.appendChild(span);
    }
  });

  if (reduce) return;
  // next frame → trigger the staggered transition
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll(".headline .char").forEach((c) => c.classList.add("reveal"));
  }));
}

/* ---------------------------------------------------------------
   Language: detect + wire toggle
---------------------------------------------------------------- */
function initLang() {
  let lang = "en";
  try {
    const saved = localStorage.getItem("ayburro-lang");
    if (saved) lang = saved;
    else if ((navigator.language || "").toLowerCase().startsWith("es")) lang = "es";
  } catch (e) {}

  applyLang(lang);

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });
}

/* ---------------------------------------------------------------
   Signup form → Loops.so
---------------------------------------------------------------- */
function initForm() {
  const form = document.getElementById("signup-form");
  const status = document.getElementById("form-status");
  const submitBtn = form.querySelector(".btn-submit");
  if (!form) return;

  const setStatus = (key, kind) => {
    status.textContent = I18N[currentLang][key] || "";
    status.classList.toggle("is-ok", kind === "ok");
    status.classList.toggle("is-error", kind === "error");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const name = form.name.value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("status_invalid", "error");
      form.email.focus();
      return;
    }

    submitBtn.disabled = true;
    setStatus("status_sending", null);

    // DEMO mode — no form ID configured yet
    if (!LOOPS_FORM_ID) {
      console.warn(
        "[HAY BURRO] Loops is in DEMO mode. Add your form ID to LOOPS_FORM_ID in script.js to send real submissions."
      );
      setTimeout(() => {
        onSuccess(form, submitBtn, setStatus);
      }, 500);
      return;
    }

    try {
      const body = new URLSearchParams();
      body.append("email", email);
      if (name) body.append("firstName", name);
      body.append("source", "Website"); // shows up in Loops as the contact source

      const res = await fetch(
        `https://app.loops.so/api/newsletter-form/${LOOPS_FORM_ID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        }
      );
      if (res.status === 429) {
        setStatus("status_rate", "error");
        submitBtn.disabled = false;
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        onSuccess(form, submitBtn, setStatus);
      } else {
        console.error("[HAY BURRO] Loops error:", data);
        setStatus("status_error", "error");
        submitBtn.disabled = false;
      }
    } catch (err) {
      console.error("[HAY BURRO] Network error:", err);
      setStatus("status_error", "error");
      submitBtn.disabled = false;
    }
  });
}

function onSuccess(form, submitBtn, setStatus) {
  setStatus("status_ok", "ok");
  form.reset();
  submitBtn.disabled = false;
}

/* ---------------------------------------------------------------
   Boot
---------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initLang();
  initForm();
});
