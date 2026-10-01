import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Slide {
  id: number;
  type: "title" | "content" | "two-col" | "code" | "qa";
  badge?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  points?: { icon: string; text: string; sub?: string }[];
  left?: { heading: string; items: { icon: string; text: string }[] };
  right?: { heading: string; items: { icon: string; text: string }[] };
  code?: string;
  codeLang?: string;
  codeLabel?: string;
  visual?: "table" | "arch" | "db" | "ws" | "modes";
  note: string;
}

// ─── Slide Data ───────────────────────────────────────────────────────────────
const SLIDES: Slide[] = [
  // 1 ── Гарчиг
  {
    id: 1,
    type: "title",
    title: "8 Ball Pool Online",
    subtitle: "JavaScript дээр хөгжүүлсэн биллиардын тоглоом",
    meta: "F.CSM360 Програмчлалын дадлага  ·  2024–2025  ·  Хугацаа: 06.04 – 09.12",
    note: "Сайн байна уу багш аа. Манай баг F.CSM360 хичээлийн хүрээнд 8 Ball Pool онлайн тоглоомыг JavaScript болон Spring Boot ашиглан хөгжүүлсэн. Өнөөдөр уг тоглоомын дизайн, физик хөдөлгүүр, серверийн архитектур, цаашдын ажлуудыг танилцуулна.",
  },

  // 2 ── Зорилго
  {
    id: 2,
    type: "content",
    badge: "ЗОРИЛГО",
    title: "Зорилго ба зорилтууд",
    points: [
      {
        icon: "🎯",
        text: "OOP зарчмаар биллиардын физик симуляц хийх",
        sub: "Класс иерархи, encapsulation, polymorphism",
      },
      {
        icon: "🌐",
        text: "WebSocket ашиглан бодит цагийн multiplayer хэрэгжүүлэх",
        sub: "STOMP протокол, Spring Boot сервер",
      },
      {
        icon: "🤖",
        text: "Компьютерийн эсрэг AI бот боловсруулах",
        sub: "Ghost-ball алгоритм, оновчлолын стратеги",
      },
      {
        icon: "📊",
        text: "Level, XP, Coin, Achievement систем нэгтгэх",
        sub: "MySQL-д хадгалах, тоглогчийн явцыг хянах",
      },
      {
        icon: "📐",
        text: "Алгоритм, өгөгдлийн бүтцийн мэдлэгийг практикт хэрэглэх",
        sub: "O(n²) мөргөлдөөн илрүүлэлт, linked list, queue",
      },
    ],
    note: "Энэ хичээлийн үндсэн зорилго нь OOP болон алгоритмын мэдлэгийг бодит нарийн хэрэглэгчтэй программ дээр хэрэгжүүлэх явдал байсан. Spring Boot-тай ажилласнаар backend-ийн мэдлэгийг бэхжүүлж, WebSocket нэмснээр бодит цагийн харилцааны туршлага авсан.",
  },

  // 3 ── Тоглоомын дүрэм
  {
    id: 3,
    type: "two-col",
    badge: "ДҮРЭМ",
    title: "Тоглоомын дүрэм",
    left: {
      heading: "Үндсэн дүрэм",
      items: [
        { icon: "🎱", text: "15 өнгөт бөмбөг + 1 цагаан" },
        { icon: "◍", text: "Solid 1–7 · Stripe 9–15 бүлэг" },
        { icon: "8️⃣", text: "8-р бөмбөг — эцсийн зорилт" },
        { icon: "🔄", text: "Бөмбөг оруулбал дахин ээлж" },
        { icon: "🏆", text: "Бүгдийг оруулаад 8-г оруулна" },
      ],
    },
    right: {
      heading: "Фол & Ball in Hand",
      items: [
        { icon: "⚪", text: "Цагаан халаасанд орсон" },
        { icon: "❌", text: "Буруу бүлгийн бөмбөгт эхэлж хүрсэн" },
        { icon: "🧱", text: "Хана мөргүүлсэнгүй" },
        { icon: "🚫", text: "8-г эрт оруулсан → ялагдал" },
        { icon: "✋", text: "Ball in Hand эрх шилжинэ" },
      ],
    },
    note: "Дүрмийг баримтжуулахдаа WPA (World Pool-Billiard Association)-ийн стандартыг үндэслэв. Фолын нөхцлийг кодод boolean flag-аар хянаж, turn-evaluation функц дотор шалгадаг. Ball in Hand үед тоглогч цагаан бөмбөгийг хүссэн газраа тавих боломжтой.",
  },

  // 4 ── Тоглоомын горим
  {
    id: 4,
    type: "content",
    badge: "ГОРИМ",
    title: "Тоглоомын 4 горим",
    visual: "modes",
    points: [
      {
        icon: "🤖",
        text: "Training — AI боттой дадлага",
        sub: "Ghost-ball AI, тооцоолсон стратеги, хугацааны хязгааргүй",
      },
      {
        icon: "🌐",
        text: "Classic — онлайн тоглогчтой",
        sub: "Ижил түвшний тоглогчтой matchmaking, рейтинг систем",
      },
      {
        icon: "📨",
        text: "Invite — найздаа урилга",
        sub: "Өрөөний код үүсгэж, найзаа урина, хувийн тоглолт",
      },
      {
        icon: "🚪",
        text: "Exit — аюулгүй гарах",
        sub: "Явцыг хадгалаад цэс рүү буцна",
      },
    ],
    note: "Тоглоомын горим нь хэрэглэгчийн туршлагыг ялгаатай болгоно. Training горим дотор AI нь оновчтой цохилтыг тооцоолдог бол Classic горимд WebSocket ашиглан 2 тоглогч бодит цагт харилцдаг. Invite горимд өрөөний код үүсгэж, QR код эсвэл URL-аар урилга явуулж болно.",
  },

  // 5 ── UI дизайн
  {
    id: 5,
    type: "content",
    badge: "UI ДИЗАЙН",
    title: "Хэрэглэгчийн интерфейс",
    visual: "table",
    points: [
      {
        icon: "🎨",
        text: "HTML5 Canvas — бүх дүрслэл нэг canvas элемент дээр",
        sub: "requestAnimationFrame, 60 FPS шинэчлэлт",
      },
      {
        icon: "🎱",
        text: "Бөмбөгний 3D дүр — radialGradient, shine overlay",
        sub: "Solid: 1 өнгө · Stripe: цагаан + өнгөт тууз",
      },
      {
        icon: "🎯",
        text: "Чиглэлийн шугам — ghost-ball preview, мөргөлдөөний зам",
        sub: "Цохилтын урьдчилсан харагдац",
      },
      {
        icon: "🎮",
        text: "Cue stick — тараагуур, татаж чадал тохируулна",
        sub: "Power meter, pull-back механизм",
      },
      {
        icon: "📊",
        text: "HUD — тоглогчийн карт, XP мөр, бөмбөгний тавиур",
        sub: "Level, Coin, бүлэг харуулах",
      },
    ],
    note: "Figma-д прототипийг зуран дараа Canvas API ашиглан хэрэгжүүлсэн. Бөмбөгний дүрслэлд radialGradient ашиглаж 3D эффект бий болгосон. Cue stick нь mousedown–mousemove–mouseup гурван event дарааллаар ажиллана.",
  },

  // 6 ── Canvas & Физик
  {
    id: 6,
    type: "code",
    badge: "ФИЗИК",
    title: "HTML5 Canvas & Физик хөдөлгүүр",
    points: [
      { icon: "📐", text: "Тоглоомын орчин: 1000 × 560 px Canvas" },
      { icon: "🔢", text: "Бөмбөгний радиус: 13 px, хүрэлцэх зай: 26 px" },
      { icon: "🌀", text: "Үрэлт: v × 0.9875 фрэйм бүр" },
      { icon: "🧱", text: "Хананы мөргөлдөөн: v_x = −v_x × 0.82" },
    ],
    code: `// Физик алхам — фрэйм бүр
function stepPhysics(balls) {
  for (const ball of balls) {
    ball.x += ball.vx;          // байрлал шинэчлэх
    ball.y += ball.vy;
    ball.vx *= 0.9875;          // үрэлт (хөрш)
    ball.vy *= 0.9875;

    // Хананы мөргөлдөөн
    if (ball.x < LEFT)  ball.vx =  Math.abs(ball.vx) * 0.82;
    if (ball.x > RIGHT) ball.vx = -Math.abs(ball.vx) * 0.82;
    if (ball.y < TOP)   ball.vy =  Math.abs(ball.vy) * 0.82;
    if (ball.y > BOTTOM)ball.vy = -Math.abs(ball.vy) * 0.82;
  }
}`,
    codeLang: "js",
    codeLabel: "physics.ts",
    note: "Физик хөдөлгүүрийн гол зарчим нь Newtonian mechanics. Үрэлтийн коэффициент 0.9875 нь туршилтаар тогтоосон — биллиардын тоглоомд бөмбөг удаан зогсдог шиг харагдана. Хананы мөргөлдөөнд restitution коэффициент 0.82 хэрэглэсэн нь elastic бус мөргөлдөөнийг дуурайна.",
  },

  // 7 ── Мөргөлдөөний алгоритм
  {
    id: 7,
    type: "code",
    badge: "АЛГОРИТМ",
    title: "Бөмбөг хоорондын мөргөлдөөн",
    points: [
      { icon: "⚙️", text: "O(n²) — бүх хос бөмбөгийг шалгана" },
      { icon: "➡️", text: "Elastic collision — импульс хадгалагдана" },
      { icon: "📏", text: "Overlap correction — давхцлыг арилгана" },
      { icon: "🎯", text: "n = 16 → 120 хос шалгалт / фрэйм" },
    ],
    code: `// Elastic collision — тэнцүү масс
function resolveCollision(b1, b2) {
  const dx = b2.x - b1.x, dy = b2.y - b1.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if (dist >= 26 || dist === 0) return;   // хүрэхгүй бол гар

  const nx = dx/dist, ny = dy/dist;       // нормаль вектор
  const dot = (b1.vx - b2.vx)*nx
            + (b1.vy - b2.vy)*ny;
  if (dot <= 0) return;                   // тусдаж байна

  b1.vx -= dot*nx;  b1.vy -= dot*ny;     // хурдыг солилцох
  b2.vx += dot*nx;  b2.vy += dot*ny;

  const ov = (26 - dist) / 2;            // давхцал засах
  b1.x -= nx*ov;  b1.y -= ny*ov;
  b2.x += nx*ov;  b2.y += ny*ov;
}`,
    codeLang: "js",
    codeLabel: "physics.ts — resolveBallCollision()",
    note: "Elastic collision-ийн математик нь хөдөлгөөний хэмжигдэхүүн (momentum) болон кинетик энергийн хадгалалтын теоремд үндэслэнэ. Тэнцүү масстай үед хурдны тусгал-компонент солилцоно. O(n²) нь n≤16 тул практикт асуудалгүй — фрэймд 120 л шалгалт.",
  },

  // 8 ── AI бот
  {
    id: 8,
    type: "code",
    badge: "AI БОТ",
    title: "Компьютерийн AI алгоритм",
    points: [
      { icon: "👻", text: "Ghost-ball арга — халаасны чиглэлийн урвуу тооцоолол" },
      { icon: "🔭", text: "Замын шалгалт — саад бөмбөг байгаа эсэхийг шалгана" },
      { icon: "⭐", text: "Оноолох систем — хамгийн богино замыг сонгоно" },
      { icon: "🎲", text: "Алдаа нэмэх — нарийвчлал ±0.10 rad хэлбэлздэг" },
    ],
    code: `// Ghost-ball: цохих оновчтой өнцгийг тооцно
function calcAIShot(balls, targetBall, pocket) {
  // Бөмбөг → халаасны чиглэл
  const toPocketNx = (pocket.x - target.x) / dist(target, pocket);
  // Ghost байрлал: цагааны цохих цэг
  const ghostX = target.x - toPocketNx * 26;
  const ghostY = target.y - toPocketNy * 26;

  // Цагаан → ghost өнцөг
  const angle = Math.atan2(ghostY - cue.y, ghostX - cue.x);

  // Алдаа нэмж реализм бий болгох
  return angle + (Math.random() - 0.5) * 0.10;
}`,
    codeLang: "js",
    codeLabel: "ai.ts — calculateAIShot()",
    note: "Ghost-ball арга нь биллиардын бодит стратегийг дуурайна. AI нь бүх зорилтот бөмбөгийг болон 6 халаасыг давтан шалгаж, хамгийн оновчтой хослолыг сонгоно. Замын шалгалтад перпендикуляр зайг тооцоолж саад бөмбөгийг илрүүлнэ.",
  },

  // 9 ── Сервер архитектур
  {
    id: 9,
    type: "content",
    badge: "BACKEND",
    title: "Серверийн архитектур",
    visual: "arch",
    points: [
      {
        icon: "☕",
        text: "Spring Boot — RESTful API, Authentication, Game сервис",
        sub: "AuthController · GameController · StatController",
      },
      {
        icon: "🔌",
        text: "WebSocket (STOMP) — бодит цагийн тоглоомын мэдэгдэл",
        sub: "/topic/game.{roomId} channel, JSON payload",
      },
      {
        icon: "🔐",
        text: "JWT Token — тоглогчийн нэвтрэлт, сессийн удирдлага",
        sub: "BCrypt нууц үг, Spring Security",
      },
      {
        icon: "📦",
        text: "Layered Architecture — Controller → Service → Repository",
        sub: "Separation of Concerns, тест хийх боломжтой",
      },
      {
        icon: "🗄️",
        text: "MySQL + JPA/Hibernate — өгөгдөл хадгалах",
        sub: "users, games, stats, achievements хүснэгт",
      },
    ],
    note: "Spring Boot-ыг maven ашиглан тохируулсан. RESTful API нь тоглогч бүртгэл, нэвтрэлт, game history-г зохицуулна. WebSocket STOMP протоколоор хоёр тоглогч хоорондын мессеж солилцоо бодит цагт явагдана. JWT ашигласнаар stateless authentication хэрэгжинэ.",
  },

  // 10 ── Өгөгдлийн сан
  {
    id: 10,
    type: "code",
    badge: "DATABASE",
    title: "MySQL өгөгдлийн бүтэц",
    points: [
      { icon: "👤", text: "users — id, username, password_hash, coins, xp, level" },
      { icon: "🎮", text: "games — id, player1_id, player2_id, winner_id, mode, created_at" },
      { icon: "📈", text: "stats — user_id, wins, losses, total_shots, accuracy" },
      { icon: "🏅", text: "achievements — user_id, achievement_key, unlocked_at" },
    ],
    code: `CREATE TABLE users (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  username   VARCHAR(50) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,    -- BCrypt
  coins      INT DEFAULT 500,
  xp         INT DEFAULT 0,
  level      INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE games (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  player1_id BIGINT REFERENCES users(id),
  player2_id BIGINT REFERENCES users(id),
  winner_id  BIGINT REFERENCES users(id),
  mode       ENUM('training','classic','invite'),
  played_at  TIMESTAMP DEFAULT NOW()
);`,
    codeLang: "sql",
    codeLabel: "schema.sql",
    note: "Өгөгдлийн загварыг normalized хийсэн (3NF). Нууц үгийг BCrypt ашиглан hash хийдэг тул plaintext хадгалагдахгүй. Stats хүснэгт нь тоглогч бүрийн гүйцэтгэлийг хянах, leaderboard гаргах зориулалттай. JPA Entity аннотациар Java класстай холбогдоно.",
  },

  // 11 ── WebSocket Multiplayer
  {
    id: 11,
    type: "content",
    badge: "WEBSOCKET",
    title: "Multiplayer: WebSocket & STOMP",
    visual: "ws",
    points: [
      {
        icon: "🔗",
        text: "Холболт: ws://server/pool-websocket endpoint",
        sub: "Тоглогч 2 нь room code оруулж холбогдоно",
      },
      {
        icon: "📡",
        text: "Мессеж: JSON payload — move, result, chat",
        sub: '{ type:"SHOT", angle:1.57, power:0.8, roomId:"abc123" }',
      },
      {
        icon: "⚡",
        text: "Хурд: <50 ms latency орон нутгийн сүлжээнд",
        sub: "Client-side prediction, lag compensation",
      },
      {
        icon: "🔄",
        text: "Тоглоомын синхрончлол — сервер master state",
        sub: "Хоёр клиент сервераас state авна, зөрүү арилна",
      },
      {
        icon: "💬",
        text: "Chatbox — тоглоомын дотор мессеж солилцоно",
        sub: "/app/chat.send → /topic/chat.{roomId}",
      },
    ],
    note: "STOMP (Simple Text Oriented Messaging Protocol) нь WebSocket дээр ажиллах messaging framework. Тоглогч цохилт хийхэд клиент нь серверт SHOT мессеж илгээнэ, сервер шалгаад хоёр клиентэд state update буцаана. Ингэснээр хоёр тоглогчийн тоглоомын байдал синхрон байдаг.",
  },

  // 12 ── Дүгнэлт
  {
    id: 12,
    type: "content",
    badge: "ДҮГНЭЛТ",
    title: "Дүгнэлт ба цаашдын ажил",
    points: [
      {
        icon: "✅",
        text: "Хүрсэн үр дүн",
        sub: "Физик хөдөлгүүр · AI бот · Multiplayer · Level систем · MySQL · Figma прототип",
      },
      {
        icon: "📚",
        text: "Суусан мэдлэг",
        sub: "OOP · Алгоритм O(n²) · REST API · WebSocket · SQL · Canvas API",
      },
      {
        icon: "🚀",
        text: "Цаашдын боловсруулалт #1",
        sub: "3D рендэр (Three.js) — бөмбөгний эргэлт, реалистик физик",
      },
      {
        icon: "🏆",
        text: "Цаашдын боловсруулалт #2",
        sub: "Turnir систем — Bracket, Prize pool, Season",
      },
      {
        icon: "📱",
        text: "Цаашдын боловсруулалт #3",
        sub: "Mobile нийцтэй болгох — Touch event, PWA",
      },
    ],
    note: "Энэ төсөл нь програмчлалын дадлага хичээлийн шаардлагаас давж, бодит хэрэглэгчид зориулсан тоглоом болгон хөгжүүлсэн. Цаашид 3D рендэр нэмж, turnir систем хэрэгжүүлбэл коммерсийн төвшинд хүрнэ. Гол сурсан зүйл нь back-end, front-end, database-ийг нэгтгэн бодит продукт бий болгох чадвар.",
  },
];

// ─── Q&A Data ────────────────────────────────────────────────────────────────
const QA = [
  {
    q: "Яагаад O(n²) алгоритм ашиглав? Оновчлох боломж бий юу?",
    a: "n=16 (бөмбөгийн тоо тогтмол) учраас 16×15/2=120 харьцуулалт л хийнэ — практикт хэтрэхгүй. Spatial hashing эсвэл Sweep-and-Prune аргаар O(n) рүү бууруулах боломжтой ч тоглоомын энэ хэмжээнд хэрэгцээгүй.",
  },
  {
    q: "Multiplayer горимд тоглоомын байдал хэрхэн синхрончлогдох вэ?",
    a: "Сервер нь master state-ийг хадгалдаг. Тоглогч цохилт хийхэд зөвхөн input (angle, power) илгээнэ, физикийг сервер тооцоолж хоёр клиентэд шинэчлэгдсэн state буцаана. Ингэснээр cheating-аас сэргийлж, зөрүүг арилгана.",
  },
  {
    q: "AI бот ямар хэцүү тул тоглогч ялж чадах уу?",
    a: "AI нь ghost-ball алгоритм ашиглан ±0.10 radian алдаа нэмдэг. Энэ нь бодит дундаж тоглогчийн нарийвчлалыг дуурайна. Diffculty тохиргоо нэмж, алдааны хэмжээг өөрчлөх боломжтой — зөрүүг ихэсгэх = хялбар, багасгах = хэцүү.",
  },
  {
    q: "XP ба Level системийг яаж тооцоолдог вэ?",
    a: "Ялалт бүр +100 XP, Coin +50 олгоно. Тухайн level ахихад шаардагдах XP = level × 100 (level 1→2: 100, level 9→10: 900). MySQL-д xp, level хадгалагдаж, нэвтрэх бүр татагдана. Spring Boot Service давхаргад level-up логик шалгагдана.",
  },
  {
    q: "Тоглоомоо deploy хийж, бусад хүн тоглох боломжтой юу?",
    a: "Тийм. Front-end нь Vercel/Netlify-д статик байдлаар deploy хийнэ. Spring Boot backend нь Docker container болгоод AWS EC2 эсвэл Railway.app дээр ажиллуулна. MySQL нь RDS эсвэл PlanetScale-д байршуулна. CI/CD pipeline (GitHub Actions) бэлэн байна.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const TOTAL = SLIDES.length;

export default function App() {
  const [current, setCurrent] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [showQA, setShowQA] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [animDir, setAnimDir] = useState<"right" | "left">("right");

  const go = useCallback(
    (dir: "next" | "prev") => {
      setAnimDir(dir === "next" ? "right" : "left");
      setCurrent((c) =>
        dir === "next" ? Math.min(c + 1, TOTAL - 1) : Math.max(c - 1, 0)
      );
      setExpanded(null);
    },
    []
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go("next");
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") go("prev");
      if (e.key === "n" || e.key === "N") setShowNotes((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go]);

  const slide = SLIDES[current];

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{ background: "#111", fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
    >
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-6 py-2 border-b"
        style={{ borderColor: "#2a2a2a", background: "#0d0d0d" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold"
            style={{ background: "#0B6E4F", color: "#fff" }}
          >
            8
          </div>
          <span className="text-xs text-neutral-400 font-medium tracking-wide">
            8 Ball Pool Online — F.CSM360 Хамгаалалт
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes((v) => !v)}
            className="text-xs px-3 py-1 rounded transition-all"
            style={{
              background: showNotes ? "#0B6E4F22" : "transparent",
              color: showNotes ? "#0B6E4F" : "#666",
              border: `1px solid ${showNotes ? "#0B6E4F66" : "#2a2a2a"}`,
            }}
          >
            📝 Тэмдэглэл
          </button>
          <button
            onClick={() => setShowQA((v) => !v)}
            className="text-xs px-3 py-1 rounded transition-all"
            style={{
              background: showQA ? "#F4B40022" : "transparent",
              color: showQA ? "#F4B400" : "#666",
              border: `1px solid ${showQA ? "#F4B40066" : "#2a2a2a"}`,
            }}
          >
            ❓ Q&A
          </button>
          <span className="text-xs text-neutral-600 ml-2">
            {current + 1} / {TOTAL}
          </span>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Slide */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <SlideView slide={slide} />

          {/* Notes */}
          {showNotes && (
            <div
              className="border-t px-8 py-4 text-sm leading-relaxed"
              style={{
                borderColor: "#2a2a2a",
                background: "#0d0d0d",
                color: "#aaa",
                maxHeight: "160px",
                overflowY: "auto",
              }}
            >
              <span
                className="text-xs font-semibold mr-2 uppercase tracking-widest"
                style={{ color: "#F4B400" }}
              >
                Speaker Notes:
              </span>
              {slide.note}
            </div>
          )}
        </div>

        {/* Q&A panel */}
        {showQA && (
          <div
            className="border-l flex flex-col overflow-y-auto"
            style={{
              width: "340px",
              borderColor: "#2a2a2a",
              background: "#0d0d0d",
            }}
          >
            <div
              className="px-5 py-3 border-b text-sm font-semibold tracking-wide"
              style={{ borderColor: "#2a2a2a", color: "#F4B400" }}
            >
              ❓ Асуулт &amp; Хариулт
            </div>
            <div className="flex flex-col gap-2 p-3">
              {QA.map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg overflow-hidden cursor-pointer"
                  style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <div
                    className="px-4 py-3 text-xs font-medium flex items-start gap-2"
                    style={{ color: expanded === i ? "#F4B400" : "#ccc" }}
                  >
                    <span
                      className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                      style={{
                        background: expanded === i ? "#F4B400" : "#2a2a2a",
                        color: expanded === i ? "#000" : "#888",
                      }}
                    >
                      {i + 1}
                    </span>
                    {item.q}
                  </div>
                  {expanded === i && (
                    <div
                      className="px-4 pb-3 text-xs leading-relaxed border-t"
                      style={{ borderColor: "#2a2a2a", color: "#aaa" }}
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom navigation ── */}
      <div
        className="flex items-center justify-between px-6 py-3 border-t"
        style={{ borderColor: "#1e1e1e", background: "#0d0d0d" }}
      >
        {/* Dot nav */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setAnimDir(i > current ? "right" : "left");
                setCurrent(i);
                setExpanded(null);
              }}
              className="rounded-full transition-all duration-200"
              style={{
                width: i === current ? "22px" : "7px",
                height: "7px",
                background:
                  i === current
                    ? "#F4B400"
                    : i < current
                    ? "#0B6E4F"
                    : "#333",
              }}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => go("prev")}
            disabled={current === 0}
            className="px-5 py-2 rounded text-sm font-medium transition-all"
            style={{
              background: current === 0 ? "#1a1a1a" : "#1e1e1e",
              color: current === 0 ? "#444" : "#ccc",
              border: "1px solid #2a2a2a",
            }}
          >
            ← Өмнөх
          </button>
          <button
            onClick={() => go("next")}
            disabled={current === TOTAL - 1}
            className="px-5 py-2 rounded text-sm font-medium transition-all"
            style={{
              background: current === TOTAL - 1 ? "#1a1a1a" : "#F4B400",
              color: current === TOTAL - 1 ? "#444" : "#000",
              border: "none",
            }}
          >Дараах →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Slide view ───────────────────────────────────────────────────────────────
function SlideView({ slide }: { slide: Slide }) {
  if (slide.type === "title") return <TitleSlide slide={slide} />;
  if (slide.type === "two-col") return <TwoColSlide slide={slide} />;
  if (slide.type === "code") return <CodeSlide slide={slide} />;
  return <ContentSlide slide={slide} />;
}

// ── Title slide ──
function TitleSlide({ slide }: { slide: Slide }) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "#1A1A1A", minHeight: 0 }}
    >
      {/* Background felt texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg, #0B6E4F 0px, #0B6E4F 1px, transparent 1px, transparent 18px
          ), repeating-linear-gradient(
            180deg, #0B6E4F 0px, #0B6E4F 1px, transparent 1px, transparent 18px
          )`,
        }}
      />
      {/* Decorative pool table oval */}
      <div
        className="absolute rounded-full opacity-5"
        style={{
          width: "700px",
          height: "350px",
          border: "80px solid #0B6E4F",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-5 px-8 text-center">
        {/* Pool balls row */}
        <div className="flex items-center gap-2 mb-2">
          {[
            "#F0C020","#1A3EAD","#C62828","#6A1FAC",
            "#1A1A1A","#E65100","#1B7A30","#8B2500",
          ].map((color, i) => (
            <div
              key={i}
              className="rounded-full flex items-center justify-center text-white font-bold"
              style={{
                width: "36px",
                height: "36px",
                background: `radial-gradient(circle at 35% 35%, ${lighten(color, 60)}, ${color} 60%, ${darken(color, 40)})`,
                fontSize: "11px",
                boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {i === 4 ? "8" : ""}
            </div>
          ))}
        </div>

        <h1
          className="font-bold tracking-tight"
          style={{
            fontSize: "clamp(2.4rem, 5vw, 4rem)",
            color: "#F4B400",
            textShadow: "0 0 40px rgba(244,180,0,0.3)",
            fontFamily: "'Oswald', 'Impact', sans-serif",
            letterSpacing: "0.04em",
          }}
        >
          {slide.title}
        </h1>

        <div
          className="text-lg font-medium"
          style={{ color: "#aaa", maxWidth: "600px", lineHeight: 1.5 }}
        >
          {slide.subtitle}
        </div>

        <div
          className="flex flex-wrap justify-center gap-2 mt-2"
        >
          {["HTML5 Canvas", "JavaScript", "Spring Boot", "WebSocket", "MySQL"].map((t) => (
            <span
              key={t}
              className="text-xs px-3 py-1 rounded-full"
              style={{
                background: "#0B6E4F22",
                color: "#0B6E4F",
                border: "1px solid #0B6E4F44",
              }}
            >
              {t}
            </span>
          ))}
        </div>

        
      </div>
    </div>
  );
}

// ── Content slide ──
function ContentSlide({ slide }: { slide: Slide }) {
  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ background: "#1A1A1A", minHeight: 0 }}
    >
      <SlideHeader badge={slide.badge} title={slide.title} />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col justify-center px-10 py-4 gap-3 overflow-y-auto">
          {slide.points?.map((pt, i) => (
            <PointRow key={i} icon={pt.icon} text={pt.text} sub={pt.sub} />
          ))}
        </div>
        {slide.visual && (
          <div className="flex items-center justify-center p-6" style={{ width: "280px" }}>
            <Visual type={slide.visual} />
          </div>
        )}
      </div>
      <SlideNumber id={slide.id} />
    </div>
  );
}

// ── Two-column slide ──
function TwoColSlide({ slide }: { slide: Slide }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#1A1A1A", minHeight: 0 }}>
      <SlideHeader badge={slide.badge} title={slide.title} />
      <div className="flex-1 flex gap-6 px-8 py-5 overflow-hidden">
        {[slide.left, slide.right].map((col, ci) =>
          col ? (
            <div
              key={ci}
              className="flex-1 rounded-xl p-5 flex flex-col gap-3"
              style={{
                background: ci === 0 ? "#0B6E4F18" : "#F4B40010",
                border: `1px solid ${ci === 0 ? "#0B6E4F44" : "#F4B40030"}`,
              }}
            >
              <h3
                className="text-sm font-bold uppercase tracking-widest mb-1"
                style={{ color: ci === 0 ? "#0B6E4F" : "#F4B400" }}
              >
                {col.heading}
              </h3>
              {col.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                  <span className="text-sm leading-snug" style={{ color: "#ddd" }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          ) : null
        )}
      </div>
      <SlideNumber id={slide.id} />
    </div>
  );
}

// ── Code slide ──
function CodeSlide({ slide }: { slide: Slide }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#1A1A1A", minHeight: 0 }}>
      <SlideHeader badge={slide.badge} title={slide.title} />
      <div className="flex-1 flex gap-5 px-8 py-4 overflow-hidden">
        {/* Left: bullet points */}
        <div className="flex flex-col justify-center gap-3" style={{ width: "280px", flexShrink: 0 }}>
          {slide.points?.map((pt, i) => (
            <PointRow key={i} icon={pt.icon} text={pt.text} sub={pt.sub} />
          ))}
        </div>
        {/* Right: code block */}
        <div className="flex-1 flex flex-col overflow-hidden rounded-xl" style={{ border: "1px solid #2a2a2a" }}>
          {/* Code header bar */}
          <div
            className="flex items-center gap-2 px-4 py-2 text-xs"
            style={{ background: "#0d0d0d", borderBottom: "1px solid #222", color: "#666" }}
          >
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-600/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-600/60" />
            </div>
            <span className="ml-2">{slide.codeLabel}</span>
          </div>
          {/* Code content */}
          <div className="flex-1 overflow-auto p-4">
            <pre
              className="text-xs leading-relaxed m-0"
              style={{ color: "#e8e8e8", fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
            >
              {colorizeCode(slide.code || "", slide.codeLang || "js")}
            </pre>
          </div>
        </div>
      </div>
      <SlideNumber id={slide.id} />
    </div>
  );
}

// ─── Shared sub-components ───────────────────────────────────────────────────
function SlideHeader({ badge, title }: { badge?: string; title: string }) {
  return (
    <div
      className="flex items-center gap-4 px-8 py-4 border-b"
      style={{ borderColor: "#2a2a2a" }}
    >
      {badge && (
        <span
          className="text-xs font-bold tracking-[0.15em] px-3 py-1 rounded"
          style={{ background: "#0B6E4F", color: "#fff" }}
        >
          {badge}
        </span>
      )}
      <h2
        className="font-bold"
        style={{
          color: "#F4B400",
          fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)",
          fontFamily: "'Oswald', 'Impact', sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function PointRow({ icon, text, sub }: { icon: string; text: string; sub?: string }) {
  return (
    <div className="flex items-start gap-4">
      <span
        className="text-xl shrink-0 w-8 h-8 flex items-center justify-center rounded-lg mt-0.5"
        style={{ background: "#0B6E4F1a" }}
      >
        {icon}
      </span>
      <div>
        <div className="text-sm font-medium leading-snug" style={{ color: "#eee" }}>
          {text}
        </div>
        {sub && (
          <div className="text-xs mt-0.5 leading-snug" style={{ color: "#666" }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function SlideNumber({ id }: { id: number }) {
  return (
    <div
      className="flex justify-end px-6 py-2 text-xs"
      style={{ color: "#333" }}
    >
      {id} / {TOTAL}
    </div>
  );
}

// ─── Visuals ─────────────────────────────────────────────────────────────────
function Visual({ type }: { type: string }) {
  if (type === "table") {
    return (
      <div
        className="w-full rounded-xl overflow-hidden flex flex-col"
        style={{
          background: "#0B6E4F",
          border: "6px solid #5C3318",
          aspectRatio: "2/1.1",
          position: "relative",
        }}
      >
        {/* Pockets */}
        {[
          { top: "4px", left: "4px" }, { top: "4px", left: "50%", transform: "translateX(-50%)" }, { top: "4px", right: "4px" },
          { bottom: "4px", left: "4px" }, { bottom: "4px", left: "50%", transform: "translateX(-50%)" }, { bottom: "4px", right: "4px" },
        ].map((s, i) => (
          <div key={i} className="absolute w-4 h-4 rounded-full" style={{ ...s, background: "#111" }} />
        ))}
        {/* Balls */}
        {[
          { left: "30%", top: "40%", color: "#F0C020" },
          { left: "55%", top: "30%", color: "#C62828" },
          { left: "60%", top: "50%", color: "#1A1A1A" },
          { left: "65%", top: "65%", color: "#1B7A30" },
          { left: "22%", top: "50%", color: "#fff" },
        ].map((b, i) => (
          <div key={i} className="absolute rounded-full" style={{ width: "10px", height: "10px", background: b.color, left: b.left, top: b.top, transform: "translate(-50%, -50%)", boxShadow: "0 2px 4px rgba(0,0,0,0.5)" }} />
        ))}
      </div>
    );
  }

  if (type === "arch") {
    const layers = [
      { label: "Client (Browser)", color: "#1A3EAD", sub: "HTML5 Canvas · React" },
      { label: "WebSocket (STOMP)", color: "#0B6E4F", sub: "ws://server/pool-ws" },
      { label: "Spring Boot API", color: "#6A1FAC", sub: "REST · Game · Auth" },
      { label: "MySQL Database", color: "#C62828", sub: "users · games · stats" },
    ];
    return (
      <div className="flex flex-col gap-2 w-full">
        {layers.map((l, i) => (
          <div key={i} className="flex flex-col rounded px-3 py-2" style={{ background: l.color + "22", border: `1px solid ${l.color}55` }}>
            <span className="text-xs font-bold" style={{ color: l.color }}>{l.label}</span>
            <span className="text-[10px]" style={{ color: "#888" }}>{l.sub}</span>
          </div>
        ))}
      </div>
    );
  }

  if (type === "ws") {
    return (
      <div className="flex flex-col gap-3 w-full items-center">
        {[{ label: "Тоглогч 1", color: "#1A3EAD" }, { label: "Тоглогч 2", color: "#C62828" }].map((p, i) => (
          <div key={i} className="flex items-center gap-2 w-full">
            <div className="flex-1 rounded px-3 py-2 text-center text-xs font-bold" style={{ background: p.color + "22", color: p.color, border: `1px solid ${p.color}44` }}>{p.label}</div>
            <div className="text-xs" style={{ color: "#555" }}>⇄</div>
            <div className="flex-1 rounded px-3 py-2 text-center text-xs font-bold" style={{ background: "#0B6E4F22", color: "#0B6E4F", border: "1px solid #0B6E4F44" }}>Server</div>
          </div>
        ))}
        <div className="text-[10px] text-center" style={{ color: "#555" }}>STOMP · JSON · &lt;50ms</div>
      </div>
    );
  }

  if (type === "modes") {
    return (
      <div className="flex flex-col gap-2 w-full">
        {[
          { icon: "🤖", label: "Training", color: "#0B6E4F" },
          { icon: "🌐", label: "Classic", color: "#1A3EAD" },
          { icon: "📨", label: "Invite", color: "#6A1FAC" },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-3 px-3 py-2 rounded" style={{ background: m.color + "18", border: `1px solid ${m.color}33` }}>
            <span className="text-lg">{m.icon}</span>
            <span className="text-sm font-bold" style={{ color: m.color }}>{m.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

// ─── Syntax highlighting (minimal) ───────────────────────────────────────────
function colorizeCode(code: string, lang: string): React.ReactNode {
  const keywords = lang === "sql"
    ? ["CREATE", "TABLE", "BIGINT", "PRIMARY", "KEY", "AUTO_INCREMENT", "VARCHAR", "NOT", "NULL", "INT", "DEFAULT", "TIMESTAMP", "UNIQUE", "REFERENCES", "ENUM"]
    : ["function", "const", "let", "var", "return", "if", "Math", "for", "of"];

  const lines = code.split("\n");
  return lines.map((line, li) => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;

    // Comment
    if (remaining.trim().startsWith("//") || remaining.trim().startsWith("--")) {
      parts.push(<span key={key++} style={{ color: "#666" }}>{remaining}</span>);
      return <div key={li}>{parts}</div>;
    }

    // Simple tokenizer
    const tokens = remaining.split(/(\b\w+\b|[^\w\s]+|\s+)/g).filter(Boolean);
    for (const token of tokens) {
      if (keywords.includes(token)) {
        parts.push(<span key={key++} style={{ color: "#C792EA" }}>{token}</span>);
      } else if (/^".*"$|^'.*'$/.test(token)) {
        parts.push(<span key={key++} style={{ color: "#C3E88D" }}>{token}</span>);
      } else if (/^\d+(\.\d+)?$/.test(token)) {
        parts.push(<span key={key++} style={{ color: "#F78C6C" }}>{token}</span>);
      } else if (/^[A-Z][a-z]+[A-Z]/.test(token) || /^[a-z]+[A-Z]/.test(token)) {
        parts.push(<span key={key++} style={{ color: "#82AAFF" }}>{token}</span>);
      } else {
        parts.push(<span key={key++}>{token}</span>);
      }
    }
    return <div key={li}>{parts}</div>;
  });
}

// ─── Color helpers ────────────────────────────────────────────────────────────
function lighten(hex: string, amt: number): string {
  try {
    const n = parseInt(hex.replace("#", ""), 16);
    return `rgb(${Math.min(255,(n>>16)+amt)},${Math.min(255,((n>>8)&0xff)+amt)},${Math.min(255,(n&0xff)+amt)})`;
  } catch { return hex; }
}
function darken(hex: string, amt: number): string {
  try {
    const n = parseInt(hex.replace("#", ""), 16);
    return `rgb(${Math.max(0,(n>>16)-amt)},${Math.max(0,((n>>8)&0xff)-amt)},${Math.max(0,(n&0xff)-amt)})`;
  } catch { return hex; }
}
