/* ── Config ──────────────────────────────────────────────────────────────── */
const API_BASE = "https://pro1-main.onrender.com";

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
  await fetchAndRender(topic, false);
}

/* ── Regenerate ─────────────────────────────────────────────────────────── */
async function regenerate() {
  if (!currentTopic) return;

  regenBtn.classList.add("spinning");
  regenBtn.addEventListener("animationend", () => regenBtn.classList.remove("spinning"), { once: true });

  await fetchAndRender(currentTopic, true);
}

/* ── Fetch + render ─────────────────────────────────────────────────────── */
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
      throw new Error(`Server returned unexpected response (${res.status})`);
    }

    if (!res.ok) {
      throw new Error(data.error || `Server error: ${res.status}`);
    }

    renderResults(data, isRegen);

  } catch (err) {
    showError("Cannot connect to server. Please try again later.");
  } finally {
    setLoading(false, isRegen);
  }
}

/* ── Reset ─────────────────────────────────────────────────────────────── */
function resetAll() {
  currentTopic = "";
  hideResults();
  hideError();
  topicInput.value = "";
  charCount.textContent = "Press Enter or click Generate";
  topicInput.focus();
}

/* ── Render results ─────────────────────────────────────────────────────── */
function renderResults(data, isRegen) {
  resultsMeta.textContent = `${data.count} questions`;
  resultsTopic.textContent = data.topic;

  buildCards(data.questions);
  showResults();
}

/* ── Build cards ────────────────────────────────────────────────────────── */
function buildCards(questions) {
  cardsGrid.innerHTML = "";
  questions.forEach((qa, idx) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${qa.id}. ${qa.question}</h3>
      <p>${qa.answer}</p>
    `;
    cardsGrid.appendChild(div);
  });
}

/* ── UI helpers ─────────────────────────────────────────────────────────── */
function setLoading(on) {
  loader.classList.toggle("hidden", !on);
  generateBtn.disabled = on;
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorBanner.classList.remove("hidden");
}

function hideError() {
  errorBanner.classList.add("hidden");
}

function showResults() {
  resultsSection.classList.remove("hidden");
}

function hideResults() {
  resultsSection.classList.add("hidden");
}

/* ── Shake ──────────────────────────────────────────────────────────────── */
function shakeInput() {
  topicInput.style.animation = "shake 0.4s ease";
  setTimeout(() => topicInput.style.animation = "", 400);
}