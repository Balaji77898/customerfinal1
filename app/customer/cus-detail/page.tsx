"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

const API_URL = "https://pos-backend-s380.onrender.com";

const SLIDES = [
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1200&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=1200&q=90&auto=format&fit=crop",
];
const SLIDE_LABELS = ["Signature Butter Chicken", "Seekh Kebab Platter", "Dum Biryani", "Paneer Tikka"];

/* ── Icon helpers ── */
const IconUser = ({ size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);
const IconPhone = ({ size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);
const IconFlame = ({ size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.11-3.66 5.65-2.7 8.87.06.22.12.44.12.67 0 .44-.36.82-.8.82-.42 0-.72-.27-.83-.65-.03-.1-.06-.2-.08-.31-1.14 1.6-1.33 3.75-.55 5.56.53 1.22 1.39 2.28 2.45 3.04.98.71 2.09 1.21 3.26 1.41.33.06.66.1.99.1 1.23.04 2.44-.26 3.47-.86 2.01-1.14 3.36-3.28 3.36-5.68 0-1.32-.43-2.57-1.14-3.6z" />
  </svg>
);
const IconArrowRight = ({ size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconCheck = ({ size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconStar = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);
const IconShield = ({ size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
  </svg>
);
const IconSparkle = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 1L9 9l-8 3 8 3 3 8 3-8 8-3-8-3z" />
  </svg>
);
const IconClock = ({ size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
);
const IconMapPin = ({ size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

/* ── Canvas particle effect ── */
function useParticles(canvasRef) {
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let W, H, raf;
    const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
    resize();
    window.addEventListener("resize", resize, { passive: true });
    const pts = Array.from({ length: 28 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.5 + Math.random() * 1.4,
      vy: 0.00012 + Math.random() * 0.00022,
      vx: (Math.random() - 0.5) * 0.0001,
      a: 0.06 + Math.random() * 0.16,
      w: Math.random() * Math.PI * 2,
      ws: 0.004 + Math.random() * 0.014,
      c: ["rgba(200,0,26,A)", "rgba(255,154,0,A)", "rgba(255,213,0,A)"][Math.floor(Math.random() * 3)],
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.w += p.ws; p.y = (p.y + p.vy) % 1;
        p.x = ((p.x + p.vx + Math.sin(p.w) * 0.0001) % 1 + 1) % 1;
        const px = p.x * W, py = p.y * H;
        const g = ctx.createRadialGradient(px, py, 0, px, py, p.r * 7);
        g.addColorStop(0, p.c.replace("A", (p.a * 0.9).toFixed(2)));
        g.addColorStop(0.5, p.c.replace("A", (p.a * 0.3).toFixed(2)));
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(px, py, p.r * 7, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
}

export default function CustomerDetails() {
  const router = useRouter();
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [qrToken, setQrToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [focused, setFocused] = useState(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [entered, setEntered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -300, y: -300 });
  const [cursorBig, setCursorBig] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) setQrToken(token);
    else showToast("QR token required. Please scan again.");

    setTimeout(() => setEntered(true), 80);

    const iv = setInterval(() => setSlideIdx(p => (p + 1) % SLIDES.length), 5000);
    const onMove = e => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => { clearInterval(iv); window.removeEventListener("mousemove", onMove); };
  }, []);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Updated Submit: new base URL + response structure res.data ── */
  const handleSubmit = async () => {
    const trimName = name.trim();
    const trimMobile = mobile.trim();
    if (!trimName || !trimMobile) { showToast("Please enter your name and mobile number"); return; }
    if (!/^\d{10}$/.test(trimMobile)) { showToast("Mobile must be exactly 10 digits"); return; }
    if (!qrToken) { showToast("QR token missing. Please scan again."); return; }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/customer/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimName, phone: trimMobile, qrToken }),
      });
      const res = await response.json();

      // Handle both new {success, data} and legacy flat structure
      if (!response.ok) throw new Error(res?.message || "Login failed");
      if (!res.success) throw new Error(res?.message || "Login failed");

      const data = res.data ?? res; // use res.data if present, else fall back

      if (data?.token)       localStorage.setItem("customerJWT",    data.token);
      if (data?.customerId)  localStorage.setItem("customerId",     data.customerId.toString());
      if (data?.tableNumber) localStorage.setItem("tableNumber",    data.tableNumber.toString());
      localStorage.setItem("customerName",   trimName);
      localStorage.setItem("customerMobile", trimMobile);

      showToast("Welcome! Entering your royal experience…", "success");
      setTimeout(() => router.push("/customer/menu"), 1500);
    } catch (err) {
      showToast(err?.message || "Server error. Try again.");
      setLoading(false);
    }
  };

  const ih = () => setCursorBig(true);
  const il = () => setCursorBig(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Nunito:wght@300;400;600;700;800;900&family=Dancing+Script:wght@700&display=swap');

        :root {
          --white:#FFFFFF; --cream:#FFFBF2; --cream2:#FFF5DC; --cream3:#FFEDBA;
          --saffron:#FF9A00; --gold:#FFB700; --yellow:#FFD500;
          --crimson:#C8001A; --dark:#1C0505; --dark2:#3D0A0A;
          --body:#5A1A00; --muted:#A0522D; --border:rgba(200,0,26,0.13);
        }
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { height:100%; overflow-x:hidden; }
        body { font-family:'Nunito',sans-serif; background:var(--cream); }
        @media (pointer:fine) { body { cursor:none; } }

        .cur-dot { position:fixed; z-index:99999; pointer-events:none; width:10px; height:10px; background:var(--crimson); border-radius:50%; transform:translate(-50%,-50%); transition:width .2s,height .2s; }
        .cur-ring { position:fixed; z-index:99998; pointer-events:none; width:34px; height:34px; border:1.5px solid rgba(200,0,26,.3); border-radius:50%; transform:translate(-50%,-50%); transition:width .3s,height .3s,opacity .3s; }
        .cur-big .cur-dot { width:16px; height:16px; }
        .cur-big .cur-ring { width:52px; height:52px; opacity:.18; }
        @media (pointer:coarse) { .cur-dot,.cur-ring { display:none; } }

        .od-root { min-height:100vh; display:flex; flex-direction:column; opacity:0; transform:scale(.99); transition:opacity .7s ease,transform .7s ease; }
        .od-root.in { opacity:1; transform:scale(1); }
        @media (min-width:900px) { .od-root { flex-direction:row; } }

        .od-left { position:relative; overflow:hidden; background:var(--dark2); height:200px; flex-shrink:0; }
        @media (min-width:900px) { .od-left { width:46%; height:auto; flex-shrink:0; position:sticky; top:0; height:100vh; } }

        .od-slide { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0; transform:scale(1.06); transition:opacity 1.4s ease,transform 8s ease; }
        .od-slide.on { opacity:1; transform:scale(1); }
        .od-ov1 { position:absolute; inset:0; background:linear-gradient(135deg,rgba(28,5,5,.82) 0%,rgba(200,0,26,.12) 55%,transparent 100%); z-index:1; }
        .od-ov2 { position:absolute; inset:0; background:linear-gradient(to top,rgba(28,5,5,.95) 0%,transparent 60%); z-index:1; }
        .od-grid { position:absolute; inset:0; z-index:2; background-image:linear-gradient(rgba(255,183,0,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,183,0,.03) 1px,transparent 1px); background-size:52px 52px; }
        .od-canvas { position:absolute; inset:0; z-index:3; opacity:.45; }

        .od-live { position:absolute; top:14px; right:14px; z-index:10; display:flex; align-items:center; gap:7px; background:rgba(28,5,5,.85); border:1px solid rgba(200,0,26,.28); padding:6px 12px; border-radius:50px; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,180,80,.7); font-weight:800; backdrop-filter:blur(12px); }
        .od-live-dot { width:6px; height:6px; background:#22c55e; border-radius:50%; animation:gp 1.2s infinite; flex-shrink:0; }
        @keyframes gp { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.5)}50%{box-shadow:0 0 0 5px rgba(34,197,94,0)} }

        .od-mob-brand { position:absolute; bottom:0; left:0; right:0; z-index:4; display:flex; align-items:center; gap:10px; padding:14px 18px; background:linear-gradient(to top,rgba(28,5,5,.9) 0%,transparent 100%); }
        @media (min-width:900px) { .od-mob-brand { display:none; } }
        .od-mob-icon { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,var(--crimson),var(--saffron)); display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
        .od-mob-brand strong { display:block; font-family:'Abril Fatface',serif; font-size:17px; color:#fff; line-height:1; }
        .od-mob-brand span { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,235,180,.45); font-weight:700; }
        .od-mob-slide { position:absolute; bottom:14px; right:14px; z-index:4; font-family:'Dancing Script',cursive; font-size:13px; color:rgba(255,255,255,.4); font-weight:700; }

        .od-left-content { display:none; }
        @media (min-width:900px) {
          .od-left-content { display:flex; flex-direction:column; justify-content:space-between; position:relative; z-index:4; height:100%; padding:clamp(32px,5vw,60px); }
        }
        .od-brand-icon-lg { width:44px; height:44px; border-radius:13px; background:linear-gradient(135deg,var(--crimson),var(--saffron)); display:flex; align-items:center; justify-content:center; color:#fff; box-shadow:0 8px 24px rgba(200,0,26,.4); }
        .od-brand-name { font-family:'Abril Fatface',serif; font-size:clamp(32px,4vw,54px); color:#fff; line-height:.95; margin:18px 0 10px; }
        .od-brand-name em { display:block; background:linear-gradient(90deg,var(--gold),var(--yellow)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-style:italic; font-family:'Dancing Script',cursive; font-size:.85em; }
        .od-brand-sub { font-size:11px; color:rgba(255,235,180,.4); letter-spacing:3px; text-transform:uppercase; font-weight:700; margin-bottom:24px; }
        .od-slide-lbl-d { font-family:'Dancing Script',cursive; font-size:16px; color:rgba(255,255,255,.45); font-weight:700; margin-bottom:26px; }
        .od-step-label { font-size:10px; letter-spacing:3px; text-transform:uppercase; color:rgba(255,183,0,.5); font-weight:800; margin-bottom:10px; }
        .od-prog-bar { height:3px; background:rgba(255,183,0,.12); border-radius:3px; overflow:hidden; }
        .od-prog-fill { height:100%; width:50%; background:linear-gradient(90deg,var(--crimson),var(--saffron),var(--gold)); border-radius:3px; animation:pfill .8s .3s cubic-bezier(.16,1,.3,1) both; }
        @keyframes pfill { from{width:0} to{width:50%} }
        .od-prog-dots { display:flex; gap:7px; margin-top:10px; }
        .od-pdot { width:24px; height:3px; background:rgba(255,183,0,.2); border-radius:3px; }
        .od-pdot-on { background:var(--gold); width:38px; }
        .od-trust { display:flex; gap:10px; flex-wrap:wrap; margin-top:28px; }
        .od-tc { display:flex; align-items:center; gap:6px; background:rgba(255,255,255,.05); border:1px solid rgba(255,183,0,.13); padding:6px 12px; border-radius:50px; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,235,180,.42); font-weight:700; }
        .od-tc svg { color:var(--gold); }

        .od-right { flex:1; display:flex; align-items:flex-start; justify-content:center; padding:28px 20px 52px; position:relative; background:linear-gradient(148deg,#FFFBF2 0%,#FFF5DC 60%,#FFEDBA 100%); overflow:hidden; }
        @media (min-width:900px) { .od-right { padding:clamp(40px,6vw,72px) clamp(28px,5vw,56px); align-items:center; } }
        .od-right-bg { position:absolute; inset:0; background:radial-gradient(ellipse at 20% 15%,rgba(200,0,26,.06),transparent 50%),radial-gradient(ellipse at 80% 85%,rgba(255,183,0,.09),transparent 50%),repeating-linear-gradient(45deg,transparent,transparent 28px,rgba(200,0,26,.015) 28px,rgba(200,0,26,.015) 56px); pointer-events:none; }

        .od-card { position:relative; width:100%; max-width:440px; animation:cardIn .8s cubic-bezier(.16,1,.3,1) .1s both; }
        @keyframes cardIn { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

        .od-welcome { width:100%; background:linear-gradient(135deg,var(--crimson),var(--saffron)); border-radius:14px; padding:15px 18px; display:flex; align-items:center; gap:12px; margin-bottom:22px; box-shadow:0 10px 30px rgba(200,0,26,.22); animation:wSlide .7s cubic-bezier(.16,1,.3,1) .2s both; position:relative; overflow:hidden; }
        @keyframes wSlide { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        .od-welcome::before { content:''; position:absolute; inset:0; background:repeating-linear-gradient(45deg,transparent,transparent 18px,rgba(255,255,255,.04) 18px,rgba(255,255,255,.04) 36px); pointer-events:none; }
        .od-w-icon { width:38px; height:38px; border-radius:10px; background:rgba(255,255,255,.18); display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
        .od-w-text strong { display:block; font-family:'Abril Fatface',serif; font-size:15px; color:#fff; line-height:1.15; }
        .od-w-text span { font-size:11px; color:rgba(255,255,255,.7); margin-top:2px; display:block; }
        .od-w-stars { margin-left:auto; display:flex; gap:2px; color:rgba(255,255,255,.5); flex-shrink:0; }

        .od-form-title { font-family:'Abril Fatface',serif; font-size:clamp(22px,5vw,32px); color:var(--dark); margin-bottom:4px; line-height:1.05; }
        .od-form-title em { font-style:italic; color:var(--crimson); font-family:'Dancing Script',cursive; font-size:1.1em; }
        .od-form-sub { font-size:13px; color:var(--muted); margin-bottom:20px; font-weight:600; }

        .od-divider { display:flex; align-items:center; gap:10px; margin-bottom:18px; }
        .od-div-line { flex:1; height:1px; background:linear-gradient(90deg,transparent,var(--border),transparent); }

        .od-fields { display:flex; flex-direction:column; gap:13px; margin-bottom:20px; }
        .od-field { position:relative; }
        .od-input-wrap { display:flex; align-items:center; background:var(--white); border:2px solid var(--border); border-radius:13px; overflow:hidden; transition:border-color .25s,box-shadow .25s; box-shadow:0 2px 10px rgba(200,0,26,.04); }
        .od-input-wrap.focused { border-color:var(--crimson); box-shadow:0 0 0 4px rgba(200,0,26,.07),0 4px 14px rgba(200,0,26,.07); }
        .od-input-wrap.filled { border-color:rgba(200,0,26,.28); }
        .od-input-icon { width:46px; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:var(--muted); transition:color .25s; }
        .od-input-wrap.focused .od-input-icon { color:var(--crimson); }
        .od-input { flex:1; padding:15px 12px 15px 0; background:transparent; border:none; outline:none; font-family:'Nunito',sans-serif; font-size:15px; color:var(--dark); font-weight:600; min-width:0; width:100%; }
        .od-input::placeholder { color:rgba(160,82,45,.38); font-weight:400; }
        .od-input-glow { position:absolute; bottom:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--crimson),transparent); transform:scaleX(0); transition:transform .3s; }
        .od-input-wrap.focused .od-input-glow { transform:scaleX(1); }
        .od-input-check { position:absolute; right:12px; top:50%; transform:translateY(-50%) scale(.5); width:21px; height:21px; background:linear-gradient(135deg,var(--crimson),var(--saffron)); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; opacity:0; transition:opacity .25s,transform .25s; }
        .od-input-wrap.filled .od-input-check { opacity:1; transform:translateY(-50%) scale(1); }

        .od-submit { width:100%; padding:16px 24px; background:linear-gradient(135deg,var(--crimson) 0%,var(--saffron) 50%,var(--gold) 100%); background-size:200% auto; color:#fff; border:none; border-radius:13px; font-family:'Nunito',sans-serif; font-size:12px; font-weight:900; letter-spacing:2px; text-transform:uppercase; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; box-shadow:0 8px 26px rgba(200,0,26,.3); transition:all .4s ease; position:relative; overflow:hidden; margin-bottom:18px; }
        .od-submit:hover { background-position:right center; transform:translateY(-2px); box-shadow:0 16px 42px rgba(200,0,26,.42); }
        .od-submit:disabled { opacity:.7; cursor:not-allowed; transform:none; }
        .od-submit-shine { position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent); transform:translateX(-100%); }
        .od-submit:not(:disabled):hover .od-submit-shine { animation:shine .8s ease forwards; }
        @keyframes shine { to{transform:translateX(200%)} }

        .od-loading-row { width:100%; display:flex; align-items:center; justify-content:center; gap:12px; padding:16px 24px; background:linear-gradient(135deg,var(--crimson),var(--saffron)); border-radius:13px; margin-bottom:18px; }
        .od-spinner { width:22px; height:22px; border:2.5px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin 1s linear infinite; flex-shrink:0; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .od-loading-txt { font-family:'Dancing Script',cursive; font-size:15px; color:rgba(255,255,255,.85); font-weight:700; }

        .od-token-badge { position:absolute; bottom:18px; right:18px; display:flex; align-items:center; gap:6px; background:rgba(5,28,15,.92); border:1px solid rgba(74,222,128,.3); padding:7px 13px; border-radius:50px; font-family:'Nunito',sans-serif; font-size:11px; color:#4ADE80; font-weight:700; backdrop-filter:blur(12px); animation:badgeIn .5s 1s both; }
        @keyframes badgeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        .od-footnote { display:flex; align-items:center; justify-content:center; gap:14px; flex-wrap:wrap; }
        .od-fn { display:flex; align-items:center; gap:5px; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); font-weight:700; }
        .od-fn svg { color:var(--saffron); }

        .od-footer-dots { display:flex; justify-content:center; gap:8px; margin-top:16px; }
        .od-fdot { display:block; width:5px; height:5px; background:rgba(200,0,26,.25); border-radius:50%; animation:dPulse 2.2s ease-in-out infinite; }
        @keyframes dPulse { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }

        .od-watermark { position:absolute; bottom:14px; right:14px; font-family:'Dancing Script',cursive; font-size:12px; color:rgba(160,82,45,.15); pointer-events:none; user-select:none; }

        .od-toast { position:fixed; top:24px; left:50%; transform:translateX(-50%); padding:14px 22px; border-radius:13px; font-family:'Nunito',sans-serif; font-size:13px; font-weight:700; z-index:10000; display:flex; align-items:center; gap:10px; animation:toastIn .4s cubic-bezier(.16,1,.3,1); backdrop-filter:blur(20px); border:1px solid; white-space:nowrap; }
        .od-toast-err { background:rgba(45,8,15,.95); color:#FF6B6B; border-color:rgba(255,107,107,.3); }
        .od-toast-ok { background:rgba(5,28,15,.95); color:#4ADE80; border-color:rgba(74,222,128,.3); }
        @keyframes toastIn { from{opacity:0;transform:translate(-50%,-16px)} to{opacity:1;transform:translate(-50%,0)} }
      `}</style>

      {/* Custom cursor */}
      <div className={cursorBig ? "cur-big" : ""}>
        <div className="cur-dot" style={{ left: cursorPos.x, top: cursorPos.y }} />
        <div className="cur-ring" style={{ left: cursorPos.x, top: cursorPos.y }} />
      </div>

      <div className={`od-root${entered ? " in" : ""}`}>

        {/* ── LEFT panel ── */}
        <div className="od-left">
          {SLIDES.map((src, i) => (
            <img key={src} src={src} alt="" className={`od-slide${i === slideIdx ? " on" : ""}`} />
          ))}
          <div className="od-ov1" /><div className="od-ov2" /><div className="od-grid" />
          <canvas ref={canvasRef} className="od-canvas" />

          <div className="od-live"><div className="od-live-dot" />Open · 200+ Orders</div>

          <div className="od-mob-brand">
            <div className="od-mob-icon"><IconFlame size={18} /></div>
            <div>
              <strong>Royal Feast</strong>
              <span>Premium Dining Experience</span>
            </div>
          </div>
          <div className="od-mob-slide">{SLIDE_LABELS[slideIdx]}</div>

          <div className="od-left-content">
            <div />
            <div>
              <div className="od-brand-icon-lg"><IconFlame size={22} /></div>
              <div className="od-brand-name">Royal<br /><em>Feast</em></div>
              <div className="od-brand-sub">Premium Dining · Step 1 of 2</div>
              <div className="od-slide-lbl-d">{SLIDE_LABELS[slideIdx]}</div>
              <div className="od-step-label">Step 1 of 2 — Guest Details</div>
              <div className="od-prog-bar"><div className="od-prog-fill" /></div>
              <div className="od-prog-dots">
                <div className="od-pdot od-pdot-on" /><div className="od-pdot" />
              </div>
            </div>
            <div className="od-trust">
              <div className="od-tc"><IconShield size={12} />Secure</div>
              <div className="od-tc"><IconClock size={12} />Fast Service</div>
              <div className="od-tc"><IconStar size={12} />4.8 Rating</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT panel ── */}
        <div className="od-right">
          <div className="od-right-bg" />

          <div className="od-card">
            <div className="od-welcome">
              <div className="od-w-icon"><IconFlame size={19} /></div>
              <div className="od-w-text">
                <strong>Welcome, Honoured Guest!</strong>
                <span>Scan verified — enter your details to begin</span>
              </div>
              <div className="od-w-stars">
                {[0, 1, 2].map(i => <IconStar key={i} size={12} />)}
              </div>
            </div>

            <div className="od-form-title">Guest <em>Details</em></div>
            <div className="od-form-sub">Just two fields to access your royal menu</div>

            <div className="od-divider">
              <div className="od-div-line" />
              <IconSparkle size={9} style={{ color: "var(--saffron)" }} />
              <div className="od-div-line" />
            </div>

            <div className="od-fields">
              <div className="od-field">
                <div className={`od-input-wrap${focused === "name" ? " focused" : ""}${name ? " filled" : ""}`}>
                  <div className="od-input-icon"><IconUser size={18} /></div>
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    className="od-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                    onMouseEnter={ih} onMouseLeave={il}
                  />
                  <div className="od-input-glow" />
                  <div className="od-input-check"><IconCheck size={11} /></div>
                </div>
              </div>

              <div className="od-field">
                <div className={`od-input-wrap${focused === "mobile" ? " focused" : ""}${mobile ? " filled" : ""}`}>
                  <div className="od-input-icon"><IconPhone size={18} /></div>
                  <input
                    type="tel"
                    placeholder="Mobile Number (10 digits)"
                    className="od-input"
                    value={mobile}
                    maxLength={10}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, ""))}
                    onFocus={() => setFocused("mobile")}
                    onBlur={() => setFocused(null)}
                    onMouseEnter={ih} onMouseLeave={il}
                  />
                  <div className="od-input-glow" />
                  <div className="od-input-check"><IconCheck size={11} /></div>
                </div>
              </div>
            </div>

            {!loading ? (
              <button
                className="od-submit"
                onClick={handleSubmit}
                onMouseEnter={ih} onMouseLeave={il}
              >
                <div className="od-submit-shine" />
                <IconArrowRight size={16} />
                Enter the Royal Feast
              </button>
            ) : (
              <div className="od-loading-row">
                <div className="od-spinner" />
                <span className="od-loading-txt">Entering your experience…</span>
              </div>
            )}

            <div className="od-footnote">
              <div className="od-fn"><IconShield size={11} />Secure</div>
              <div className="od-fn"><IconMapPin size={11} />Table Verified</div>
              <div className="od-fn"><IconClock size={11} />Open Until 11 PM</div>
            </div>

            <div className="od-footer-dots">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="od-fdot" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>

          {qrToken && (
            <div className="od-token-badge">
              <IconCheck size={12} />
              Table Verified
            </div>
          )}

          <div className="od-watermark">Royal Feast · Est. 2009</div>
        </div>
      </div>

      {toast && (
        <div className={`od-toast${toast.type === "success" ? " od-toast-ok" : " od-toast-err"}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            {toast.type === "success"
              ? <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              : <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
            }
          </svg>
          {toast.msg}
        </div>
      )}
    </>
  );
}