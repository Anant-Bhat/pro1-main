const express = require("express");
const cors = require("cors");

const app = express();

// 🔥 IMPORTANT FIX
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── Helpers ─────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Templates ───────────────────────────────────────

const QA_TEMPLATES = [
  {
    question: (t) => `What is ${t} and why does it matter?`,
    answer: (t) => ` ${t} is an important concept used to solve real-world problems. It provides a structured approach to understanding complex systems and improving efficiency.`,
  },
  {
    question: (t) => `How does ${t} work?`,
    answer: (t) => `${t} works by processing input data, applying logical rules, and producing meaningful output.`,
  },
  {
    question: (t) => `What are the advantages of ${t}?`,
    answer: (t) => `${t} improves efficiency, scalability, and decision-making across different domains.`,
  },
  {
    question: (t) => `Where is ${t} used?`,
    answer: (t) => `${t} is used in industries like technology, healthcare, finance, and education.`,
  },
  {
    question: (t) => `What are challenges of ${t}?`,
    answer: (t) => `${t} can be complex to implement and requires proper understanding and resources.`,
  },
];

// ── Generate Q&A ────────────────────────────────────

function generateQA(topic, count = 5) {
  const selected = shuffle(QA_TEMPLATES).slice(0, count);
  return selected.map((template, idx) => ({
    id: idx + 1,
    question: template.question(topic),
    answer: template.answer(topic),
  }));
}

// ── Routes ─────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/generate", (req, res) => {
  const { topic } = req.body;

  if (!topic || topic.trim().length < 2) {
    return res.status(400).json({
      error: "Invalid topic",
    });
  }

  const questions = generateQA(topic.trim());

  res.json({
    topic,
    questions,
  });
});

// ── Start Server ────────────────────────────────────

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});