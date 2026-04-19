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

/* ── Generate ───────────────────────────────────────────────────────────── */
async function generateQuestions() {
  const topic = topicInput.value.trim();

  if (!topic) {
    showError("Please enter a topic.");
    shakeInput();
    return;
  }

  if (topic.length < 2) {
    showError("Topic too short.");
    shakeInput();
    return;
  }

  currentTopic = topic;
  await fetchAndRender(topic, false);
}

/* ── Regenerate ─────────────────────────────────────────────────────────── */
async function regenerate() {
  if (!currentTopic) return;
  await fetchAndRender(currentTopic, true);
}

/* ── Fetch + render ─────────────────────────────────────────────────────── */
async function fetchAndRender(topic, isRegen) {
  setLoading(true);
  hideError();
  if (!isRegen) hideResults();

  try {
    const res = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Server error");
    }

    renderResults(data);

  } catch (err) {
    console.error(err);
    showError("⚠️ Server not reachable. Try again later.");
  } finally {
    setLoading(false);
  }
}

/* ── Render results ─────────────────────────────────────────────────────── */
function renderResults(data) {
  // FIXED HERE ✅
  resultsMeta.textContent = `${data?.count || 0} questions`;
  resultsTopic.textContent = data?.topic || "Topic";

  buildCards(data?.questions || []);
  showResults();
}

/* ── Build cards ────────────────────────────────────────────────────────── */
function buildCards(questions) {
  cardsGrid.innerHTML = "";

  if (!questions.length) {
    cardsGrid.innerHTML = "<p>No questions found.</p>";
    return;
  }

  questions.forEach((qa) => {
    const div = document.createElement("div");
    div.className = "qa-card";

    div.innerHTML = `
      <h3>${qa.id}. ${escapeHtml(qa.question)}</h3>
      <p>${escapeHtml(qa.answer)}</p>
    `;

    cardsGrid.appendChild(div);
  });
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
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

function shakeInput() {
  topicInput.style.animation = "shake 0.4s ease";
  setTimeout(() => (topicInput.style.animation = ""), 400);
}

/* ── Prevent HTML injection ─────────────────────────────────────────────── */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}