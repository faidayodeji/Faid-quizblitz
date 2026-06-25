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
      color: "#e2
