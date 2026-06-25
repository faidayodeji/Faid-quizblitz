import { useState, useEffect, useCallback } from "react";

const QUESTIONS = [
  { question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Brisbane"], answer: 2, category: "Geography" },
  { question: "How many bones are in the adult human body?", options: ["196", "206", "216", "226"], answer: 1, category: "Science" },
  { question: "Who painted the Mona Lisa?", options: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Donatello"], answer: 2, category: "Art" },
  { question: "What is the largest planet in our solar system?", options: ["Saturn", "Neptune", "Uranus", "Jupiter"], answer: 3, category: "Science" },
  { question: "In what year did World War II end?", options: ["1943", "1944", "1945", "1946"], answer: 2, category: "History" },
  { question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2, category: "Science" },
  { question: "Which country invented the printing press?", options: ["China", "Germany", "England", "France"], answer: 1, category: "History" },
  { question: "How many strings does a standard guitar have?", options: ["4", "5", "6", "7"], answer: 2, category: "Music" },
  { question: "What is the smallest country in the world?", options: ["Monaco", "San Marino", "Liechtenstein", "Vatican City"], answer: 3, category: "Geography" },
  { question: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], answer: 1, category: "Literature" },
  { question: "What is the speed of light (approx)?", options: ["200,000 km/s", "300,000 km/s", "400,000 km/s", "150,000 km/s"], answer: 1, category: "Science" },
  { question: "Which element has the atomic number 1?", options: ["Helium", "Oxygen", "Carbon", "Hydrogen"], answer: 3, category: "Science" },
  { question: "What year did the Berlin Wall fall?", options: ["1987", "1988", "1989", "1990"], answer: 2, category: "History" },
  { question: "Which ocean is the largest?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3, category: "Geography" },
  { question: "Who composed 'Fur Elise'?", options: ["Mozart", "Beethoven", "Bach", "Chopin"], answer: 1, category: "Music" },
];

const TIMER_SECONDS = 15;
const QUESTIONS_PER_GAME = 10;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const CATEGORY_COLORS = {
  Geography: "#38bdf8",
  Science: "#a78bfa",
  Art: "#f472b6",
  History: "#fb923c",
  Music: "#34d399",
  Literature: "#fbbf24",
};

export default function TriviaApp() {
  const [screen, setScreen] = useState("home");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [answered, setAnswered] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [leaderboard, setLeaderboard] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trivia_leaderboard") || "[]");
    } catch { return []; }
  });
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [results, setResults] = useState([]);

  const startGame = () => {
    if (!nameInput.trim()) return;
    setPlayerName(nameInput.trim());
    const picked = shuffle(QUESTIONS).slice(0, QUESTIONS_PER_GAME);
    setQuestions(picked);
    setCurrent(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setResults([]);
    setSelected(null);
    setAnswered(false);
    setTimeLeft(TIMER_SECONDS);
    setScreen("quiz");
  };

  const handleAnswer = useCallback((idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const q = questions[current];
    const correct = idx === q.answer;
    const timeBonus = Math.floor(timeLeft * 2);
    const basePoints = correct ? 100 : 0;
    const newStreak = correct ? streak + 1 : 0;
    const streakBonus = correct && newStreak > 1 ? (newStreak - 1) * 20 : 0;
    const earned = basePoints + (correct ? timeBonus : 0) + streakBonus;

    setStreak(newStreak);
    setMaxStreak(s => Math.max(s, newStreak));
    setScore(s => s + earned);
    setResults(r => [...r, { question: q.question, correct, earned, category: q.category, userAnswer: q.options[idx], correctAnswer: q.options[q.answer] }]);
  }, [answered, questions, current, streak, timeLeft]);

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      endGame();
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
      setTimeLeft(TIMER_SECONDS);
    }
  };

  const endGame = () => {
    const entry = { name: playerName, score, maxStreak, date: new Date().toLocaleDateString() };
    const updated = [...leaderboard, entry].sort((a, b) => b.score - a.score).slice(0, 10);
    setLeaderboard(updated);
    try { localStorage.setItem("trivia_leaderboard", JSON.stringify(updated)); } catch {}
    setScreen("result");
  };

  useEffect(() => {
    if (screen !== "quiz" || answered) return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [screen, timeLeft, answered, handleAnswer]);

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 8 ? "#34d399" : timeLeft > 4 ? "#fbbf24" : "#f87171";

  const styles = {
    app: {
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 20% 50%, #0f0c29 0%, #1a0a2e 40%, #0d1117 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#e2e8f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
    },
    card: {
      width: "100%",
      maxWidth: "480px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "20px",
      padding: "32px 24px",
      backdropFilter: "blur(12px)",
    },
    logo: { textAlign: "center", marginBottom: "32px" },
    logoText: {
      fontSize: "36px",
      fontWeight: "800",
      background: "linear-gradient(135deg, #a78bfa, #38bdf8)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: "-1px",
    },
    logoSub: { fontSize: "13px", color: "#64748b", marginTop: "4px", letterSpacing: "3px", textTransform: "uppercase" },
    input: {
      width: "100%",
      padding: "14px 16px",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "12px",
      color: "#e2e8f0",
      fontSize: "15px",
      outline: "none",
      boxSizing: "border-box",
      marginBottom: "16px",
    },
    btn: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #7c3aed, #2563eb)",
      border: "none",
      borderRadius: "12px",
      color: "#fff",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
      letterSpacing: "0.5px",
    },
    btnSecondary: {
      width: "100%",
      padding: "12px",
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: "12px",
      color: "#94a3b8",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      marginTop: "10px",
    },
    timerBar: {
      height: "4px",
      background: "rgba(255,255,255,0.08)",
      borderRadius: "4px",
      marginBottom: "20px",
      overflow: "hidden",
    },
    timerFill: {
      height: "100%",
      borderRadius: "4px",
      transition: "width 0.9s linear, background 0.3s",
      background: timerColor,
      width: `${timerPct}%`,
    },
    categoryBadge: (cat) => ({
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "1px",
      textTransform: "uppercase",
      background: `${CATEGORY_COLORS[cat] || "#94a3b8"}22`,
      color: CATEGORY_COLORS[cat] || "#94a3b8",
      border: `1px solid ${CATEGORY_COLORS[cat] || "#94a3b8"}44`,
      marginBottom: "14px",
    }),
    questionText: {
      fontSize: "20px",
      fontWeight: "700",
      lineHeight: "1.4",
      marginBottom: "24px",
      color: "#f1f5f9",
    },
    optionBtn: (idx, q) => {
      let bg = "rgba(255,255,255,0.04)";
      let border = "1px solid rgba(255,255,255,0.1)";
      let color = "#cbd5e1";
      if (answered) {
        if (idx === q.answer) { bg = "rgba(52,211,153,0.15)"; border = "1px solid #34d399"; color = "#34d399"; }
        else if (idx === selected) { bg = "rgba(248,113,113,0.15)"; border = "1px solid #f87171"; color = "#f87171"; }
      }
      return {
        width: "100%",
        padding: "14px 16px",
        background: bg,
        border,
        borderRadius: "12px",
        color,
        fontSize: "15px",
        textAlign: "left",
        cursor: answered ? "default" : "pointer",
        marginBottom: "10px",
        transition: "all 0.2s",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      };
    },
    optionLabel: {
      width: "26px",
      height: "26px",
      borderRadius: "50%",
      background: "rgba(255,255,255,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: "700",
      flexShrink: 0,
    },
    scoreBar: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "20px",
      fontSize: "13px",
      color: "#64748b",
    },
    scoreHighlight: { color: "#a78bfa", fontWeight: "700" },
    streakBadge: {
      background: "rgba(251,191,36,0.15)",
      color: "#fbbf24",
      border: "1px solid rgba(251,191,36,0.3)",
      borderRadius: "20px",
      padding: "2px 10px",
      fontSize: "12px",
      fontWeight: "700",
    },
    resultStat: {
      textAlign: "center",
      padding: "20px",
      background: "rgba(255,255,255,0.03)",
      borderRadius: "14px",
      marginBottom: "12px",
    },
    resultBig: {
      fontSize: "52px",
      fontWeight: "800",
      background: "linear-gradient(135deg, #a78bfa, #38bdf8)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    resultSub: { fontSize: "13px", color: "#64748b", marginTop: "4px" },
    statsRow: { display: "flex", gap: "10px", marginBottom: "20px" },
    statBox: {
      flex: 1,
      background: "rgba(255,255,255,0.03)",
      borderRadius: "12px",
      padding: "14px",
      textAlign: "center",
    },
    statVal: { fontSize: "22px", fontWeight: "800", color: "#e2e8f0" },
    statLabel: { fontSize: "11px", color: "#64748b", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.5px" },
    lbRow: (i) => ({
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 14px",
      background: i === 0 ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.03)",
      border: i === 0 ? "1px solid rgba(167,139,250,0.3)" : "1px solid transparent",
      borderRadius: "12px",
      marginBottom: "8px",
    }),
    lbRank: (i) => ({
      width: "28px",
      height: "28px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "13px",
      fontWeight: "800",
      background: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : "rgba(255,255,255,0.08)",
      color: i < 3 ? "#0f172a" : "#64748b",
      flexShrink: 0,
    }),
    sectionTitle: {
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "2px",
      color: "#475569",
      marginBottom: "16px",
      fontWeight: "700",
    },
  };

  if (screen === "home") return (
    <div style={styles.app}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoText}>QuizBlitz</div>
          <div style={styles.logoSub}>General Knowledge</div>
        </div>
        <div style={{ marginBottom: "8px", fontSize: "13px", color: "#64748b" }}>Your name</div>
        <input
          style={styles.input}
          placeholder="Enter your name..."
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && startGame()}
        />
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", fontSize: "13px", color: "#475569" }}>
          <span>📋 {QUESTIONS_PER_GAME} questions</span>
          <span>⏱ {TIMER_SECONDS}s per question</span>
          <span>⚡ Streak bonuses</span>
        </div>
        <button style={styles.btn} onClick={startGame}>Start Game</button>
        {leaderboard.length > 0 && (
          <button style={styles.btnSecondary} onClick={() => setScreen("leaderboard")}>View Leaderboard</button>
        )}
      </div>
    </div>
  );

  if (screen === "quiz") {
    const q = questions[current];
    return (
      <div style={styles.app}>
        <div style={styles.card}>
          <div style={styles.scoreBar}>
            <span>Q {current + 1} / {questions.length}</span>
            <span style={styles.scoreHighlight}>{score} pts</span>
            {streak > 1 && <span style={styles.streakBadge}>🔥 {streak}x streak</span>}
            <span style={{ color: timerColor, fontWeight: "700" }}>{timeLeft}s</span>
          </div>
          <div style={styles.timerBar}><div style={styles.timerFill} /></div>
          <div style={styles.categoryBadge(q.category)}>{q.category}</div>
          <div style={styles.questionText}>{q.question}</div>
          {q.options.map((opt, i) => (
            <button key={i} style={styles.optionBtn(i, q)} onClick={() => handleAnswer(i)}>
              <span style={styles.optionLabel}>{["A","B","C","D"][i]}</span>
              {opt}
            </button>
          ))}
          {answered && (
            <button style={{ ...styles.btn, marginTop: "8px" }} onClick={nextQuestion}>
              {current + 1 >= questions.length ? "See Results" : "Next Question →"}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (screen === "result") {
    const correct = results.filter(r => r.correct).length;
    const pct = Math.round((correct / questions.length) * 100);
    const grade = pct >= 90 ? "🏆 Outstanding!" : pct >= 70 ? "⭐ Great job!" : pct >= 50 ? "👍 Not bad!" : "📚 Keep practicing!";
    return (
      <div style={styles.app}>
        <div style={styles.card}>
          <div style={styles.resultStat}>
            <div style={styles.resultBig}>{score}</div>
            <div style={styles.resultSub}>Total Points · {grade}</div>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <div style={styles.statVal}>{correct}/{questions.length}</div>
              <div style={styles.statLabel}>Correct</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statVal}>{pct}%</div>
              <div style={styles.statLabel}>Accuracy</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statVal}>🔥{maxStreak}</div>
              <div style={styles.statLabel}>Best Streak</div>
            </div>
          </div>
          <div style={styles.sectionTitle}>Question Breakdown</div>
          <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "20px" }}>
            {results.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px", fontSize: "13px" }}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>{r.correct ? "✅" : "❌"}</span>
                <div>
                  <div style={{ color: "#cbd5e1", lineHeight: "1.3" }}>{r.question}</div>
                  {!r.correct && <div style={{ color: "#f87171", marginTop: "2px" }}>Your: {r.userAnswer} · Correct: {r.correctAnswer}</div>}
                  {r.correct && <div style={{ color: "#34d399", marginTop: "2px" }}>+{r.earned} pts</div>}
                </div>
              </div>
            ))}
          </div>
          <button style={styles.btn} onClick={() => { setNameInput(playerName); setScreen("home"); }}>Play Again</button>
          <button style={styles.btnSecondary} onClick={() => setScreen("leaderboard")}>Leaderboard</button>
        </div>
      </div>
    );
  }

  if (screen === "leaderboard") return (
    <div style={styles.app}>
      <div style={styles.card}>
        <div style={{ ...styles.logo, marginBottom: "24px" }}>
          <div style={styles.logoText}>Leaderboard</div>
          <div style={styles.logoSub}>Top 10 All Time</div>
        </div>
        {leaderboard.length === 0 ? (
          <div style={{ textAlign: "center", color: "#475569", padding: "32px 0" }}>No scores yet. Be the first!</div>
        ) : leaderboard.map((entry, i) => (
          <div key={i} style={styles.lbRow(i)}>
            <div style={styles.lbRank(i)}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "700", fontSize: "15px", color: "#e2e8f0" }}>{entry.name}</div>
              <div style={{ fontSize: "12px", color: "#475569" }}>{entry.date} · 🔥{entry.maxStreak} streak</div>
            </div>
            <div style={{ fontWeight: "800", fontSize: "18px", color: "#a78bfa" }}>{entry.score}</div>
          </div>
        ))}
        <button style={{ ...styles.btnSecondary, marginTop: "16px" }} onClick={() => setScreen("home")}>← Back to Home</button>
      </div>
    </div>
  );
}
