const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Question + Answer pairs (each entry has a question fn AND an answer fn) ───
// Answers are multi-sentence, topic-specific, and varied per template.

const QA_TEMPLATES = [
  {
    question: (t) => `What is ${t} and why does it matter?`,
    answer: (t) => pick([
      `${t} refers to a structured body of knowledge, methods, and principles that address a specific set of problems or phenomena. It matters because it provides a reliable framework through which practitioners can understand, predict, and influence outcomes in its domain. Without a clear grasp of what ${t} is, it becomes difficult to apply it correctly or to build upon its foundations. Its importance has grown significantly as more industries recognize the value it brings in terms of efficiency, insight, and competitive advantage. Whether you are a beginner or an expert, understanding the 'what' and 'why' of ${t} is the essential starting point for deeper study.`,

      `At its most fundamental level, ${t} is a discipline or concept that emerged to solve real-world problems that couldn't be adequately addressed by prior approaches. It matters because it has demonstrated measurable impact across a variety of contexts — from academic research to everyday practice. The significance of ${t} lies not just in its direct applications, but in the way it reshapes how we think about related problems. Gaining a solid definition of ${t} helps learners avoid common misapplications and sets the stage for more advanced understanding. Its relevance only continues to grow as the field develops.`,
    ]),
  },
  {
    question: (t) => `How does ${t} work at a fundamental level?`,
    answer: (t) => pick([
      `At a fundamental level, ${t} operates by breaking down complex inputs or situations into manageable components, applying a defined set of rules or transformations, and producing a coherent output or outcome. The process typically involves several interacting layers: an initial phase where data or context is gathered, a processing phase where the core logic of ${t} is applied, and an output or evaluation phase where results are assessed. Understanding each layer individually makes the overall mechanism of ${t} much easier to grasp. Many learners find it helpful to trace a single example through the entire process from start to finish.`,

      `The mechanics of ${t} are built on a set of foundational principles that govern how inputs relate to outputs. In practice, this means that ${t} relies on both deterministic rules — things that always happen the same way — and probabilistic or adaptive behaviors that change based on context. The interplay between these elements is what gives ${t} both its power and its complexity. A key insight is that ${t} rarely works in isolation; it typically depends on supporting systems, assumptions, or data that must themselves be well understood. Grasping these dependencies is what separates a surface-level understanding from genuine expertise.`,
    ]),
  },
  {
    question: (t) => `What are the core principles behind ${t}?`,
    answer: (t) => pick([
      `The core principles of ${t} can generally be grouped into a few key ideas: abstraction, which involves representing complex reality in a simplified and useful form; consistency, which ensures that the rules of ${t} hold reliably across different situations; and composability, which allows smaller elements to be combined into more powerful structures. These principles are not arbitrary — they reflect hard-won lessons from decades of practical application and theoretical refinement. Learners who internalize these principles find that many specific techniques within ${t} become intuitive rather than mysterious. It is worth revisiting these principles regularly as your understanding deepens.`,

      `Every well-developed field or concept has underlying principles that give it coherence, and ${t} is no exception. Its core principles typically include clarity of purpose — defining precisely what problem ${t} is solving — along with modularity, which means complex behaviors are built from simpler, well-defined parts. Another key principle is feedback: ${t} systems often incorporate mechanisms to learn from errors or to adjust behavior based on results. Together, these principles form a kind of 'grammar' for ${t} that makes it both teachable and scalable. Understanding them helps practitioners make better decisions when facing novel situations not covered by any specific rule.`,
    ]),
  },
  {
    question: (t) => `What are the most common misconceptions about ${t}?`,
    answer: (t) => pick([
      `One of the most widespread misconceptions about ${t} is that it is either far simpler or far more complicated than it actually is. Beginners often underestimate the nuance involved, assuming that a surface-level understanding is sufficient for effective application — only to encounter unexpected failures. Conversely, some people are intimidated by ${t} and assume it requires rare expertise, when in fact its core ideas are accessible with patience and structured learning. Another common misconception is that ${t} is a fixed, finished body of knowledge, when in reality it is an evolving field where best practices shift over time. Correcting these misconceptions early saves a great deal of wasted effort.`,

      `Perhaps the biggest misconception about ${t} is that knowing the terminology is the same as understanding the concept. Many people can recite definitions but struggle to apply ${t} in a novel context because their understanding is shallow. A related misconception is that ${t} has a single 'correct' way of being applied, when in reality context matters enormously and the same principles can be implemented very differently depending on goals and constraints. Finally, some assume that ${t} is only relevant to specialists, when in practice a working knowledge of ${t} benefits anyone who interacts with its domain, even indirectly.`,
    ]),
  },
  {
    question: (t) => `How has ${t} evolved over time?`,
    answer: (t) => pick([
      `The history of ${t} is a story of incremental refinement punctuated by occasional paradigm shifts. In its early stages, ${t} was often informal, relying on intuition and trial-and-error rather than systematic methods. Over time, researchers and practitioners identified recurring patterns and failure modes, which led to the development of more rigorous frameworks and standards. Each major advancement in ${t} typically came in response to a real-world limitation that existing approaches couldn't handle well. Today, ${t} stands on the shoulders of many generations of accumulated insight, and understanding its history helps explain why certain conventions exist and where the field might be heading next.`,

      `${t} has not always looked the way it does today. Its evolution reflects broader changes in technology, society, and the types of problems practitioners face. Early approaches to ${t} were often limited by available tools and incomplete theoretical understanding, leading to methods that were effective in narrow circumstances but brittle in others. As new tools emerged and more data became available, the field was able to tackle more ambitious problems and develop more generalizable solutions. The trajectory of ${t} suggests continued growth, with increasing integration of computational approaches and a broader recognition of its importance across disciplines.`,
    ]),
  },
  {
    question: (t) => `What are real-world applications of ${t}?`,
    answer: (t) => pick([
      `The real-world applications of ${t} span a remarkably wide range of industries and contexts. In commercial settings, ${t} is used to improve decision-making, optimize processes, and create new products or services that weren't previously possible. In research, ${t} enables scientists and engineers to model complex systems, test hypotheses, and interpret large volumes of data. In everyday life, many tools and technologies that people use without thinking are built on principles derived from ${t}. The breadth of these applications is one reason why ${t} has attracted so much attention and investment in recent years. Studying applied examples is one of the best ways to develop genuine intuition for the field.`,

      `Applications of ${t} exist wherever there is a structured problem to be solved or a process to be optimized. Healthcare, finance, logistics, education, and engineering are just a few sectors where ${t} plays a significant role. In each domain, the specific implementation varies, but the underlying principles remain consistent. This transferability is a major strength of ${t}: skills developed in one application area are often applicable in others with relatively minor adaptation. For students, exploring a few diverse use cases early on helps build the mental flexibility needed to tackle unfamiliar problems later.`,
    ]),
  },
  {
    question: (t) => `What are the key advantages and limitations of ${t}?`,
    answer: (t) => pick([
      `The primary advantages of ${t} include its ability to handle complexity in a structured way, its scalability from small problems to large ones, and its well-documented track record across many domains. When applied correctly, ${t} can dramatically reduce the time and effort required to achieve a goal compared to ad hoc approaches. However, ${t} also has meaningful limitations. It typically requires a certain level of prerequisite knowledge to apply effectively, and it can be misapplied when practitioners force it onto problems it wasn't designed to solve. Additionally, the assumptions underlying ${t} may not always hold in real-world conditions, which can lead to unexpected outcomes if those assumptions are not carefully examined.`,

      `Like any powerful tool, ${t} comes with both significant benefits and important caveats. On the advantage side, ${t} provides structure, repeatability, and a shared vocabulary that makes collaboration and communication easier. It also tends to be well-supported by literature, tooling, and community knowledge. On the limitation side, ${t} can become a crutch that discourages creative thinking, or it can be applied rigidly in situations that call for flexibility. Performance can also degrade when the conditions under which ${t} was developed differ significantly from the current context. Awareness of these limitations is what distinguishes expert practitioners from those who simply follow instructions.`,
    ]),
  },
  {
    question: (t) => `How does ${t} compare to related concepts in the field?`,
    answer: (t) => pick([
      `${t} is best understood not in isolation but in relation to the concepts that surround it. Compared to more traditional or established approaches, ${t} often offers greater flexibility or expressive power, but may require more upfront learning to use effectively. Compared to more recent alternatives, ${t} may have the advantage of maturity — more documentation, more examples, and a larger community of practitioners. The key differentiator for ${t} is usually the specific trade-off it makes between generality and specialization. Knowing where ${t} sits in the landscape of related ideas helps practitioners choose the right tool for each situation rather than defaulting to habit.`,

      `When placed alongside related concepts, ${t} occupies a specific niche defined by the problems it is best suited to solve and the methods it uses to solve them. Some related concepts are complementary — they are often used alongside ${t} to handle aspects it doesn't address well. Others are alternatives — they take a different approach to the same class of problems and may outperform ${t} in certain conditions. The honest answer is that no single concept is universally superior; the right choice depends on context, constraints, and goals. A practitioner with a broad understanding of ${t} and its neighbors is much better equipped to make that choice than one with a narrow view.`,
    ]),
  },
  {
    question: (t) => `What challenges do practitioners face when working with ${t}?`,
    answer: (t) => pick([
      `Working with ${t} in practice introduces a set of challenges that are rarely visible when studying it in theory. One of the most common is the gap between idealized conditions and messy real-world data or environments — ${t} often assumes a level of cleanliness, consistency, or completeness that real situations don't provide. Another challenge is communicating about ${t} with stakeholders who have different levels of familiarity; translating technical insights into actionable decisions requires skills that go beyond the technical itself. Practitioners also frequently encounter the challenge of keeping up with a field that evolves quickly, making it necessary to invest in continuous learning even after achieving proficiency.`,

      `The practical challenges of ${t} can be grouped into technical, organizational, and human factors. On the technical side, challenges include correctly scoping the problem, selecting appropriate methods, and validating that results are meaningful rather than artifacts of the approach. Organizationally, ${t} often requires buy-in from multiple stakeholders, access to resources, and alignment on goals — none of which can be taken for granted. On the human side, biases, assumptions, and habits of mind can lead even experienced practitioners astray. Recognizing and addressing these challenges proactively is a hallmark of mature practice in ${t}.`,
    ]),
  },
  {
    question: (t) => `What does the future of ${t} look like?`,
    answer: (t) => pick([
      `The future of ${t} is likely to be shaped by several converging trends. First, increasing access to computational power and data means that methods within ${t} that were previously impractical are becoming feasible at scale. Second, growing interdisciplinary interest is bringing perspectives from adjacent fields that are enriching the theoretical foundations of ${t}. Third, automation and tooling are lowering the barrier to entry, enabling a wider range of practitioners to engage with ${t} meaningfully. While it is impossible to predict exactly how ${t} will look in a decade, the trajectory suggests a field that is more capable, more accessible, and more integrated with other areas of knowledge than it is today.`,

      `Looking ahead, ${t} faces both exciting opportunities and serious open questions. On the opportunity side, advances in supporting technologies are unlocking new problem domains and enabling solutions of previously impossible scale or sophistication. On the question side, the field must grapple with issues of interpretability, fairness, and sustainability — concerns that become more pressing as ${t} is applied in higher-stakes contexts. The practitioners who will shape the future of ${t} are those who combine deep technical understanding with a thoughtful awareness of the broader implications of their work. Now is an especially interesting time to be building expertise in this area.`,
    ]),
  },
  {
    question: (t) => `What foundational knowledge is required to understand ${t}?`,
    answer: (t) => pick([
      `Building a solid understanding of ${t} requires a foundation in several prerequisite areas. Logical reasoning and structured thinking are essential, as ${t} depends on the ability to follow chains of cause and effect and to spot inconsistencies. Familiarity with the domain in which ${t} operates provides the context needed to interpret its outputs meaningfully. Mathematical or formal reasoning, depending on the subfield, may also be necessary for engaging with more advanced aspects of ${t}. Beyond these technical prerequisites, intellectual habits like patience, careful observation, and willingness to revise one's understanding are arguably even more important for long-term progress.`,

      `The prerequisites for ${t} vary depending on how deeply you intend to engage with it. For a working understanding sufficient for most practical purposes, a grounding in the core concepts of its parent domain is typically enough. For deeper theoretical engagement, additional background in formal methods, quantitative reasoning, or systems thinking may be needed. One useful approach is to identify a concrete problem you want to solve using ${t} and work backward to identify exactly what you need to learn. This targeted learning is often faster and more durable than trying to acquire all foundational knowledge before attempting any application.`,
    ]),
  },
  {
    question: (t) => `How is ${t} used in professional settings today?`,
    answer: (t) => pick([
      `In professional settings, ${t} is applied across a wide spectrum of roles and responsibilities. In some organizations, there are specialists whose entire job is to develop and maintain systems or workflows built on ${t}. In others, ${t} is one tool among many that generalist practitioners bring to bear on problems as they arise. The way ${t} is used professionally also varies by industry: in fast-moving technology companies, ${t} may be iterated on rapidly and informally, while in regulated industries like healthcare or finance, its application is governed by strict standards and documentation requirements. Understanding these contextual differences is valuable for anyone looking to apply ${t} in a career setting.`,

      `Professionally, ${t} has moved from being a niche specialty to a broadly expected competency in many fields. Teams that once relied on intuition or ad hoc methods increasingly build systematic approaches to their work that draw directly on ${t}. This shift has created both demand for practitioners with deep expertise and an expectation that even non-specialists have a working familiarity with its core ideas. In practice, this means that ${t} fluency is increasingly a career differentiator — those who can apply it well, communicate about it clearly, and adapt it to new contexts tend to have a significant advantage over those who cannot.`,
    ]),
  },
];

// ── Generate Q&A pairs ────────────────────────────────────────────────────────

function generateQA(topic, count = 7) {
  const selected = shuffle(QA_TEMPLATES).slice(0, count);
  return selected.map((template, idx) => ({
    id: idx + 1,
    question: template.question(topic),
    answer: template.answer(topic),
  }));
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/generate", (req, res) => {
  const { topic } = req.body;

  if (!topic || typeof topic !== "string" || topic.trim().length < 2) {
    return res.status(400).json({
      error: "Please provide a valid topic (at least 2 characters).",
    });
  }

  const trimmed = topic.trim();

  setTimeout(() => {
    const questions = generateQA(trimmed, 7);
    res.json({
      topic: trimmed,
      count: questions.length,
      generatedAt: new Date().toISOString(),
      questions,
    });
  }, 500 + Math.random() * 400);
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀  AI Study Question Generator API`);
  console.log(`    Listening on http://localhost:${PORT}\n`);
});