/* ── Config ──────────────────────────────────────────────────────────────── */
const API_BASE = "http://localhost:3001";

/* ── State ───────────────────────────────────────────────────────────────── */
let currentTopic = "";

/* ── Element refs ────────────────────────────────────────────────────────── */
const topicInput     = document.getElementById("topicInput");
const generateBtn    = document.getElementById("generateBtn");
const regenBtn       = document.getElementById("regenBtn");
const loader         = document.getElementById("loader");
const errorBanner    = document.getElementById("errorBanner");
const errorMsg       = document.getElementById("errorMsg");
const resultsSection = document.getElementById("resultsSection");
const resultsMeta    = document.getElementById("resultsMeta");
const resultsTopic   = document.getElementById("resultsTopic");
const cardsGrid      = document.getElementById("cardsGrid");
const charCount      = document.getElementById("charCount");

/* ── Enter key shortcut ──────────────────────────────────────────────────── */
topicInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") generateQuestions();
});

/* ── Live input hint ─────────────────────────────────────────────────────── */
topicInput.addEventListener("input", () => {
  const len = topicInput.value.trim().length;
  charCount.textContent =
    len === 0
      ? "Press Enter or click Generate"
      : `${len} character${len !== 1 ? "s" : ""} · ready to generate`;
});

/* ── Generate (from input) ───────────────────────────────────────────────── */
async function generateQuestions() {
  const topic = topicInput.value.trim();

  if (!topic) {
    showError("Please enter a topic before generating questions.");
    topicInput.focus();
    shakeInput();
    return;
  }
  if (topic.length < 2) {
    showError("Topic is too short — try something more descriptive.");
    shakeInput();
    return;
  }

  currentTopic = topic;
  await fetchAndRender(topic, /* isRegen */ false);
}

/* ── Regenerate (same topic, fresh questions) ────────────────────────────── */
async function regenerate() {
  if (!currentTopic) return;

  regenBtn.classList.add("spinning");
  regenBtn.addEventListener("animationend", () => regenBtn.classList.remove("spinning"), { once: true });

  await fetchAndRender(currentTopic, /* isRegen */ true);
}

/* ── Core fetch + render ─────────────────────────────────────────────────── */
async function fetchAndRender(topic, isRegen) {
  setLoading(true, isRegen);
  hideError();
  if (!isRegen) hideResults();

  try {
    const res = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Server returned an unexpected response (${res.status}).`);
    }

    if (!res.ok) {
      throw new Error(data.error || `Server error: ${res.status}`);
    }

    renderResults(data, isRegen);

  } catch (err) {
    const isNetworkError =
      err instanceof TypeError &&
      (err.message.includes("fetch") ||
       err.message.includes("Failed to fetch") ||
       err.message.includes("NetworkError"));

    if (isNetworkError) {
      showError("Cannot reach the server. Make sure the backend is running on port 3001.");
    } else {
      showError(err.message || "An unexpected error occurred. Please try again.");
    }
  } finally {
    setLoading(false, isRegen);
  }
}

/* ── Reset to blank state ────────────────────────────────────────────────── */
function resetAll() {
  currentTopic = "";
  hideResults();
  hideError();
  topicInput.value = "";
  charCount.textContent = "Press Enter or click Generate";
  topicInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ── Render results ──────────────────────────────────────────────────────── */
function renderResults(data, isRegen) {
  const d = new Date(data.generatedAt);
  const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  resultsMeta.textContent = `${data.count} questions · generated at ${timeStr}`;
  resultsTopic.textContent = data.topic;

  if (isRegen) {
    // Fade old cards out, swap, fade back in
    cardsGrid.style.opacity = "0";
    cardsGrid.style.transform = "translateY(-8px)";
    cardsGrid.style.transition = "opacity 0.2s ease, transform 0.2s ease";

    setTimeout(() => {
      buildCards(data.questions);
      cardsGrid.style.opacity = "";
      cardsGrid.style.transform = "";
      cardsGrid.style.transition = "";
    }, 220);
  } else {
    buildCards(data.questions);
    showResults();
    setTimeout(() => {
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  if (isRegen) showResults(); // ensure visible if hidden
}

/* ── Build all cards ─────────────────────────────────────────────────────── */
function buildCards(questions) {
  cardsGrid.innerHTML = "";
  questions.forEach((qa, idx) => {
    cardsGrid.appendChild(buildCard(qa, idx));
  });
}

/* ── Build a single Q&A card ─────────────────────────────────────────────── */
function buildCard(qa, idx) {
  const card = document.createElement("div");
  card.className = "qa-card glass";
  card.style.animationDelay = `${idx * 65}ms`;

  // Question row
  const questionDiv = document.createElement("div");
  questionDiv.className = "card-question";
  questionDiv.setAttribute("role", "button");
  questionDiv.setAttribute("tabindex", "0");
  questionDiv.setAttribute("aria-expanded", "false");
  questionDiv.innerHTML = `
    <span class="card-num">${qa.id}</span>
    <p class="question-text">${escapeHtml(qa.question)}</p>
    <svg class="card-toggle" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  `;

  // Answer panel
  const answerDiv = document.createElement("div");
  answerDiv.className = "card-answer";

  const answerInner = document.createElement("div");
  answerInner.className = "card-answer-inner";

  const answerBody = document.createElement("p");
  answerBody.className = "answer-body";
  answerBody.textContent = qa.answer;

  // Copy button
  const answerFooter = document.createElement("div");
  answerFooter.className = "answer-footer";

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.setAttribute("aria-label", "Copy answer to clipboard");
  copyBtn.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
    Copy answer
  `;
  copyBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // don't toggle accordion
    copyToClipboard(qa.answer, copyBtn);
  });

  answerFooter.appendChild(copyBtn);
  answerInner.appendChild(answerBody);
  answerInner.appendChild(answerFooter);
  answerDiv.appendChild(answerInner);
  card.appendChild(questionDiv);
  card.appendChild(answerDiv);

  // Accordion toggle (click + keyboard)
  const toggle = () => {
    const isOpen = card.classList.contains("open");
    document.querySelectorAll(".qa-card.open").forEach((c) => {
      if (c !== card) {
        c.classList.remove("open");
        c.querySelector(".card-question").setAttribute("aria-expanded", "false");
      }
    });
    card.classList.toggle("open", !isOpen);
    questionDiv.setAttribute("aria-expanded", String(!isOpen));
  };

  questionDiv.addEventListener("click", toggle);
  questionDiv.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
  });

  return card;
}

/* ── Copy to clipboard ───────────────────────────────────────────────────── */
async function copyToClipboard(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for http:// contexts or older browsers
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  btn.classList.add("copied");
  btn.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    Copied!
  `;
  setTimeout(() => {
    btn.classList.remove("copied");
    btn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      Copy answer
    `;
  }, 2000);
}

/* ── UI state helpers ────────────────────────────────────────────────────── */
function setLoading(on, isRegen = false) {
  if (isRegen) {
    regenBtn.disabled = on;
  } else {
    loader.classList.toggle("hidden", !on);
    generateBtn.disabled = on;
    generateBtn.querySelector(".btn-text").textContent = on ? "Generating…" : "Generate";
  }
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorBanner.classList.remove("hidden");
}
function hideError() { errorBanner.classList.add("hidden"); }
function showResults() { resultsSection.classList.remove("hidden"); }
function hideResults() { resultsSection.classList.add("hidden"); }

/* ── Input shake ─────────────────────────────────────────────────────────── */
function shakeInput() {
  topicInput.style.animation = "none";
  void topicInput.offsetWidth; // force reflow
  topicInput.style.animation = "shake 0.4s ease";
  topicInput.addEventListener("animationend", () => {
    topicInput.style.animation = "";
  }, { once: true });
}

/* ── Safe HTML escape ────────────────────────────────────────────────────── */
function escapeHtml(str) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

/* ── Inject keyframes ────────────────────────────────────────────────────── */
const extraStyles = document.createElement("style");
extraStyles.textContent = `
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%     { transform: translateX(-6px); }
  40%     { transform: translateX(6px); }
  60%     { transform: translateX(-4px); }
  80%     { transform: translateX(4px); }
}`;
document.head.appendChild(extraStyles);
