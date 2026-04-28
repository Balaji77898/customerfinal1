"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

/* ─── SVG Icon System — refined, geometric, no emojis ─── */
const Icon = {
  Flame:   (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.11-3.66 5.65-2.7 8.87.06.22.12.44.12.67 0 .44-.36.82-.8.82-.42 0-.72-.27-.83-.65-.03-.1-.06-.2-.08-.31-1.14 1.6-1.33 3.75-.55 5.56.53 1.22 1.39 2.28 2.45 3.04.98.71 2.09 1.21 3.26 1.41.33.06.66.1.99.1 1.23.04 2.44-.26 3.47-.86 2.01-1.14 3.36-3.28 3.36-5.68 0-1.32-.43-2.57-1.14-3.6z"/></svg>,
  Leaf:    (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c7 0 13-5 13-12-3 0-7 1-11 4l3.17 3.17A4.98 4.98 0 0119 16c0 3.31-1.58 6.25-4 8.1A11.97 11.97 0 0017 8z"/></svg>,
  Star:    (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>,
  Pin:     (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  Phone:   (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
  Mail:    (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
  Bag:     (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/></svg>,
  Arrow:   (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Plus:    (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Clock:   (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>,
  Chef:    (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z"/></svg>,
  Check:   (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>,
  Menu:    (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Globe:   (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.9 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.66-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>,
  Diamond: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5L2 9l10 12L22 9l-3-6zm-8.5 0h5L17 7H7l1.5-4zm-5.06 6h3.56l2 8-5.56-8zM12 18l-2.5-9h5L12 18zm3.5-1l2-8h3.56l-5.56 8z"/></svg>,
  Sparkle: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L9 9l-8 3 8 3 3 8 3-8 8-3-8-3z"/></svg>,
  Award:   (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>,
};

/* ─── Data ─── */
const BG_SLIDES = [
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1600&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1600&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1600&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=1600&q=90&auto=format&fit=crop",
];

const MENU_ITEMS = [
  { id:1, name:"Butter Chicken",     desc:"72-hr slow-cooked tomato-cream gravy",          price:320, badge:"Bestseller",  veg:false, img:"https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=85&auto=format&fit=crop", rating:"4.9" },
  { id:2, name:"Paneer Tikka",       desc:"Tandoor-charred cottage cheese, mint chutney",  price:280, badge:"Chef's Pick", veg:true,  img:"https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=85&auto=format&fit=crop", rating:"4.8" },
  { id:3, name:"Dal Makhani",        desc:"Black lentils simmered 12 hrs, butter & cream", price:220, badge:"Slow Cooked", veg:true,  img:"https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&q=85&auto=format&fit=crop", rating:"4.9" },
  { id:4, name:"Hyderabadi Biryani", desc:"Aged basmati dum-cooked, saffron & fried onion",price:380, badge:"Dum Cooked",  veg:false, img:"https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=85&auto=format&fit=crop", rating:"4.7" },
  { id:5, name:"Seekh Kebab",        desc:"Minced lamb skewers with ginger & coriander",   price:340, badge:"Tandoor",     veg:false, img:"https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=85&auto=format&fit=crop", rating:"4.8" },
  { id:6, name:"Gulab Jamun",        desc:"Rose-cardamom syrup dumplings, served warm",    price:160, badge:"Sweet",       veg:true,  img:"https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=600&q=85&auto=format&fit=crop", rating:"4.9" },
];

const REVIEWS = [
  { name:"Priya Venkat",  loc:"Koramangala · Google", stars:5, q:"The butter chicken here is unlike anything in Bangalore. Rich, smoky, deeply flavourful. We come every weekend." },
  { name:"Rohan Shetty",  loc:"Indiranagar · Zomato",  stars:5, q:"Dal Makhani that tastes like grandmother's. The garlic naan is dangerously addictive. Absolute must visit!" },
  { name:"Aarti Joshi",   loc:"Whitefield · Swiggy",   stars:4, q:"Brought 12 family members for dad's birthday — every dish was outstanding. A complete experience." },
];

const STRIP_IMGS = [
  { src:"https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80&auto=format&fit=crop", label:"Butter Chicken" },
  { src:"https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80&auto=format&fit=crop", label:"Seekh Kebab" },
  { src:"https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80&auto=format&fit=crop", label:"Dum Biryani" },
  { src:"https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&q=80&auto=format&fit=crop", label:"Dal Makhani" },
  { src:"https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80&auto=format&fit=crop", label:"Paneer Tikka" },
  { src:"https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=500&q=80&auto=format&fit=crop", label:"Gulab Jamun" },
];

/* ─── Scroll reveal hook ─── */
function useReveal(threshold = 0.08) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || vis) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  });
  return [ref, vis];
}

/* ─── Reveal wrapper ─── */
function Reveal({ children, vis, delay = 0, style = {} }) {
  return (
    <div style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(32px)",
      transition: `opacity .85s cubic-bezier(.16,1,.3,1) ${delay}s, transform .85s cubic-bezier(.16,1,.3,1) ${delay}s`,
      ...style
    }}>
      {children}
    </div>
  );
}

/* ─── Luxury Loader — fast, refined ─── */
function Loader() {
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setProg(p => {
      if (p >= 100) { clearInterval(iv); return 100; }
      return p + 4;
    }), 28);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"#FFFBF0", fontFamily:"'Cormorant Garamond', serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600;700&display=swap');
        @keyframes ldbar { from{transform:scaleX(0)} to{transform:scaleX(1)} }
      `}</style>
      <div style={{ textAlign:"center", width:240 }}>
        <div style={{
          fontFamily:"'Cormorant Garamond',serif", fontSize:36, letterSpacing:6,
          textTransform:"uppercase", color:"#C8001A", marginBottom:6, fontWeight:300,
        }}>Spice Delight</div>
        <div style={{
          fontSize:9, letterSpacing:8, textTransform:"uppercase",
          color:"rgba(200,0,26,.35)", marginBottom:32, fontWeight:500,
        }}>North Indian · Bangalore</div>
        <div style={{ height:1, background:"rgba(200,0,26,.12)", borderRadius:1, overflow:"hidden", position:"relative" }}>
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(90deg,var(--crimson,#C8001A),#FF9A00)",
            transformOrigin:"left",
            transform:`scaleX(${prog/100})`,
            transition:"transform .06s linear",
            borderRadius:1,
          }}/>
        </div>
        <div style={{
          marginTop:14, fontSize:9, letterSpacing:5, textTransform:"uppercase",
          color:"rgba(200,0,26,.25)", fontFamily:"'Jost',sans-serif", fontWeight:400,
        }}>{prog < 100 ? "Preparing your experience" : "Welcome"}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════ */
export default function SpiceDelightLuxury() {
  const router = useRouter();

  const navigate = useCallback((path = "/customer/cus-detail") => {
    const p = new URLSearchParams(window.location.search);
    const token = p.get("token"), table = p.get("table") || p.get("tableNo") || p.get("tableNumber");
    let dest = path; const ex = [];
    if (token) ex.push(`token=${token}`);
    if (table) ex.push(`table=${table}`);
    if (ex.length) dest += `?${ex.join("&")}`;
    router.push(dest);
  }, [router]);

  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(BG_SLIDES.length - 1);
  const [titlePhase, setTitlePhase] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [curPos, setCurPos] = useState({ x:-300, y:-300 });
  const [curBig, setCurBig] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const [tableInfo, setTableInfo] = useState(null);

  const pxWrapRef = useRef(null);
  const pxImgRef = useRef(null);

  const [aboutRef, aboutVis] = useReveal(0.06);
  const [menuRef, menuVis] = useReveal(0.05);
  const [revRef, revVis] = useReveal(0.05);
  const [ctaRef, ctaVis] = useReveal(0.04);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const token = p.get("token"), table = p.get("table") || p.get("tableNo");
    if (token || table) setTableInfo({ token, table });
  }, []);

  /* Faster load — 1.4s vs 3s */
  useEffect(() => {
    const t = setTimeout(() => { setLoading(false); setTimeout(() => setRevealed(true), 40); }, 1400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) return;
    const t1 = setTimeout(() => setTitlePhase(1), 150);
    const t2 = setTimeout(() => setTitlePhase(2), 420);
    const t3 = setTimeout(() => setTitlePhase(3), 690);
    const onS = () => setScrollY(window.scrollY);
    const onM = (e) => setCurPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("scroll", onS, { passive: true });
    window.addEventListener("mousemove", onM);
    const iv = setInterval(() => {
      setSlideIdx(p => { setPrevIdx(p); return (p + 1) % BG_SLIDES.length; });
    }, 5500);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearInterval(iv);
      window.removeEventListener("scroll", onS);
      window.removeEventListener("mousemove", onM);
    };
  }, [loading]);

  useEffect(() => {
    const fn = () => {
      const img = pxImgRef.current, wrap = pxWrapRef.current;
      if (!img || !wrap) return;
      const r = wrap.getBoundingClientRect();
      const pr = (window.innerHeight - r.top) / (window.innerHeight + r.height);
      img.style.transform = `translateY(calc(-15% + ${(pr - .5) * 90}px))`;
    };
    window.addEventListener("scroll", fn, { passive: true }); fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const ih = () => setCurBig(true), il = () => setCurBig(false);

  if (loading) return <Loader />;

  const sz = (s) => ({ width: s, height: s, flexShrink: 0 });

  return (
    <>
      <style>{CSS}</style>

      {/* Custom cursor */}
      <div className={`cdot${curBig ? " cb" : ""}`} style={{ left: curPos.x, top: curPos.y }} />
      <div className={`cring${curBig ? " cb" : ""}`} style={{ left: curPos.x, top: curPos.y }} />

      {/* Table banner */}
      {tableInfo && (
        <div className="tbanner">
          {tableInfo.table && (
            <span><Icon.Pin style={{ ...sz(12), marginRight:5 }} /> Table {tableInfo.table}</span>
          )}
          {tableInfo.token && (
            <span className="tbadge"><Icon.Check style={{ ...sz(11), marginRight:4 }} /> Scan & Order Active</span>
          )}
        </div>
      )}

      {/* NAV */}
      <nav className={scrollY > 60 ? "sc" : ""} style={{ top: tableInfo ? "36px" : "0" }}>
        <div className="nbrand">
          <div className="nemblem">
            <Icon.Flame style={{ ...sz(18), color:"#C8001A" }} />
          </div>
          <div>
            <strong className="nname">Spice Delight</strong>
            <span className="ntag">North Indian · Bangalore</span>
          </div>
        </div>
        <ul className="nlinks">
          {["about","menu","reviews","contact"].map(s => (
            <li key={s}><a onClick={() => scrollTo(s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</a></li>
          ))}
        </ul>
        <button className="ncta" onClick={() => navigate()} onMouseEnter={ih} onMouseLeave={il}>
          <span className="nshine" />
          <Icon.Bag style={{ ...sz(14), marginRight:6 }} />
          Order Now
        </button>
        <button className="mhbg" onClick={() => setMobOpen(p => !p)}>
          <Icon.Menu style={{ ...sz(22) }} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`mmenu${mobOpen ? " on" : ""}`} style={{ top: tableInfo ? "104px" : "68px" }}>
        {["about","menu","reviews","contact"].map(s => (
          <a key={s} onClick={() => { scrollTo(s); setMobOpen(false); }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </a>
        ))}
        <button className="mmcta" onClick={() => navigate()}>
          <Icon.Bag style={{ ...sz(14), marginRight:7 }} /> Start Order
        </button>
      </div>

      <div className={`pwrap${revealed ? " in" : ""}`}>

        {/* ═══════════════════════════════════════
            HERO — editorial split
        ════════════════════════════════════════ */}
        <section id="hero" className="hero">

          {/* LEFT: Photo panel */}
          <div className="hphoto">
            {BG_SLIDES.map((src, i) => (
              <div key={i} className={`hslide${i === slideIdx ? " on" : i === prevIdx ? " out" : ""}`}>
                <img src={src} alt={`Dish ${i + 1}`} />
              </div>
            ))}

            {/* Elegant counter */}
            <div className="hcounter">
              <span className="hc-cur">{String(slideIdx + 1).padStart(2, "0")}</span>
              <span className="hc-sep" />
              <span className="hc-tot">{String(BG_SLIDES.length).padStart(2, "0")}</span>
            </div>

            {/* Dot indicators */}
            <div className="hsdots">
              {BG_SLIDES.map((_, i) => (
                <button key={i} className={`hsdot${i === slideIdx ? " on" : ""}`}
                  onClick={() => { setPrevIdx(slideIdx); setSlideIdx(i); }} />
              ))}
            </div>

            {/* Scroll cue */}
            <div className="hscroll-cue">
              <div className="hsc-line" /><span>Scroll</span>
            </div>
          </div>

          {/* RIGHT: Content panel */}
          <div className="hcont">

            <div className={`hbadge${titlePhase >= 1 ? " show" : ""}`}>
              <div className="hpulse" />
              <span>Open Now · MG Road, Bangalore</span>
            </div>

            <h1 className="htitle">
              <span className={`hl${titlePhase >= 1 ? " show" : ""}`}>Where Every</span>
              <span className={`hl accent${titlePhase >= 2 ? " show" : ""}`} style={{ transitionDelay:".1s" }}>Spice Tells</span>
              <span className={`hl${titlePhase >= 3 ? " show" : ""}`} style={{ transitionDelay:".2s" }}>a Story.</span>
            </h1>

            <p className={`hsub${titlePhase >= 3 ? " show" : ""}`} style={{ transitionDelay:".5s" }}>
              Authentic North Indian flavours crafted with care in the heart of Bangalore.
              From slow-cooked dals to smoky tandoor — every plate is a journey north.
            </p>

            <div className={`hbtns${titlePhase >= 3 ? " show" : ""}`} style={{ transitionDelay:".68s" }}>
              <button className="bprim" onClick={() => navigate()} onMouseEnter={ih} onMouseLeave={il}>
                <span className="bshine" />
                <Icon.Bag style={{ ...sz(15), marginRight:7 }} />
                Start Your Order
              </button>
              <button className="bout2" onClick={() => scrollTo("contact")}>
                <Icon.Pin style={{ ...sz(14), marginRight:6 }} />
                Find Us
              </button>
            </div>

            <div className={`htags${titlePhase >= 3 ? " show" : ""}`} style={{ transitionDelay:".86s" }}>
              <span>
                <Icon.Leaf style={{ ...sz(12), color:"#FF9A00", marginRight:5 }} />
                Pure Veg Available
              </span>
              <span>
                <Icon.Flame style={{ ...sz(12), color:"#FF9A00", marginRight:5 }} />
                Live Tandoor
              </span>
              <span>
                <Icon.Globe style={{ ...sz(12), color:"#FF9A00", marginRight:5 }} />
                Dine-In & Takeaway
              </span>
            </div>

            <div className={`hstats${titlePhase >= 3 ? " show" : ""}`} style={{ transitionDelay:"1.05s" }}>
              {[["200+","Daily Diners"],["4.8","Google Rating"],["60+","Menu Items"]].map(([n, l]) => (
                <div key={l} className="hstat">
                  <span className="hstat-n">{n}</span>
                  <span className="hstat-l">{l}</span>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* STATS BAR */}
        <div className="statsbar">
          {[
            [<Icon.Award style={{ ...sz(20) }} />,"200+","Daily Diners"],
            [<Icon.Star style={{ ...sz(20) }} />,"4.8","Google Rating"],
            [<Icon.Chef style={{ ...sz(20) }} />,"60+","Menu Items"],
            [<Icon.Clock style={{ ...sz(20) }} />,"15+","Years of Craft"],
          ].map(([ic, n, l]) => (
            <div key={l} className="sitem">
              <div className="sicon">{ic}</div>
              <span className="snum">{n}</span>
              <span className="slbl2">{l}</span>
            </div>
          ))}
        </div>

        {/* MARQUEE RED */}
        <div className="mqred">
          <div className="mqt">
            {[...Array(2)].flatMap((_, li) =>
              ["Butter Chicken","Garlic Naan","Dal Makhani","Seekh Kebab","Dum Biryani","Paneer Tikka","Masala Chai","Gulab Jamun"].map((t, i) => (
                <span key={`${li}-${i}`} className="mqi">
                  <Icon.Diamond style={{ ...sz(9), marginRight:8, opacity:.7 }} />{t}
                </span>
              ))
            )}
          </div>
        </div>

        {/* ═══ ABOUT ═══ */}
        <section id="about" className="about-sec" ref={aboutRef}>
          <div className={`agrid${aboutVis ? " vis" : ""}`}>
            <div className="aimg-wrap">
              <div className="aimg">
                <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=85&auto=format&fit=crop" alt="Interior" />
                <div className="aglow" />
              </div>
              <div className="abadge">Est. 2009 · Bangalore</div>
            </div>
            <div className="atext">
              <div className="slbl">Our Story</div>
              <h2>Crafted with <em>Tradition,</em><br />Served with Love.</h2>
              <p className="bp">Born on the vibrant MG Road, Spice Delight began as a humble café with one mission — to bring the bold, comforting flavours of North India to every table in Bangalore.</p>
              <p className="bp">Each recipe is a family heirloom — slow-cooked gravies, hand-rolled breads fresh from the tandoor, and spice blends ground daily in our kitchen.</p>
              <div className="afacts">
                {[
                  [<Icon.Flame style={{ ...sz(18) }} />, "Fresh Daily", "Spices ground every morning. No shortcuts."],
                  [<Icon.Leaf style={{ ...sz(18) }} />, "Veg Friendly", "20+ pure veg options always available."],
                  [<Icon.Award style={{ ...sz(18) }} />, "Live Tandoor", "Clay oven fires all day for smoky char."],
                  [<Icon.Pin style={{ ...sz(18) }} />, "MG Road", "Heart of Bangalore's dining district."],
                ].map(([ic, t, d]) => (
                  <div key={t} className="af" onMouseEnter={ih} onMouseLeave={il}>
                    <div className="aficon">{ic}</div>
                    <div><div className="aft">{t}</div><div className="afd">{d}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PHOTO STRIP */}
        <div className="strip">
          <div className="sttrack">
            {[...STRIP_IMGS, ...STRIP_IMGS].map((it, i) => (
              <div key={i} className="sti">
                <img src={it.src} alt={it.label} />
                <div className="stov" />
                <span className="stlbl">{it.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MARQUEE CREAM */}
        <div className="mqcream">
          <div className="mqt rev">
            {[...Array(2)].flatMap((_, li) =>
              ["Live Tandoor","Fresh Spices Daily","MG Road Bangalore","4.8 Google Rating","Dine-In & Takeaway","Open Till 11 PM","Master Chef Kitchen"].map((t, i) => (
                <span key={`${li}-${i}`} className="mqci">
                  <Icon.Check style={{ ...sz(11), color:"#C8001A", marginRight:8 }} />{t}
                </span>
              ))
            )}
          </div>
        </div>

        {/* ═══ MENU ═══ */}
        <section id="menu" className="menu-sec" ref={menuRef}>
          <Reveal vis={menuVis} delay={0}><div className="slbl">Our Menu</div></Reveal>
          <Reveal vis={menuVis} delay={.1}><h2>A Feast for <em>Every Craving.</em></h2></Reveal>
          <Reveal vis={menuVis} delay={.2}><p className="bp">Sixty dishes — starters, mains, breads, rice, desserts — all cooked to order.</p></Reveal>
          <div className={`mgrid${menuVis ? " vis" : ""}`}>
            {MENU_ITEMS.map((item, i) => (
              <div key={item.id} className="mc" style={{ transitionDelay:`${i * .075}s` }} onMouseEnter={ih} onMouseLeave={il}>
                <div className="mcimg">
                  <img src={item.img} alt={item.name} />
                  <div className="mcbadge">{item.badge}</div>
                  {item.veg && <div className="vegdot" />}
                  <div className="mcov" />
                </div>
                <div className="mcbody">
                  <div className="mcname">{item.name}</div>
                  <div className="mcdesc">{item.desc}</div>
                  <div className="mcfoot">
                    <div>
                      <div className="mcprice">&#8377;{item.price}</div>
                      <div className="mcrating">
                        <Icon.Star style={{ ...sz(11), color:"#FFB700", marginRight:3 }} />
                        {item.rating}
                      </div>
                    </div>
                    <button className="mcadd" onClick={() => navigate()}>
                      <Icon.Plus style={{ ...sz(16) }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Reveal vis={menuVis} delay={.55} style={{ textAlign:"center", marginTop:44 }}>
            <button className="bprim" onClick={() => navigate()} onMouseEnter={ih} onMouseLeave={il}>
              <span className="bshine" />
              <Icon.Bag style={{ ...sz(14), marginRight:7 }} />
              View Full Menu & Order
            </button>
          </Reveal>
        </section>

        {/* PARALLAX QUOTE */}
        <div className="pxwrap" ref={pxWrapRef}>
          <img ref={pxImgRef} src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80&auto=format&fit=crop" alt="" />
          <div className="pxov" />
          <div className="pxcont">
            <Icon.Diamond style={{ ...sz(22), color:"#FFB700", marginBottom:16, filter:"drop-shadow(0 0 14px rgba(255,183,0,.65))" }} />
            <blockquote>"Food is not just eating energy. It's an experience."</blockquote>
            <cite>— The Spice Delight Philosophy · MG Road, Bangalore</cite>
          </div>
        </div>

        {/* ═══ REVIEWS ═══ */}
        <section id="reviews" className="rev-sec" ref={revRef}>
          <Reveal vis={revVis} delay={0}><div className="slbl">Reviews</div></Reveal>
          <Reveal vis={revVis} delay={.1}><h2>Our Guests <em>Say It Best.</em></h2></Reveal>
          <div className={`rgrid${revVis ? " vis" : ""}`}>
            {REVIEWS.map((r, i) => (
              <div key={i} className="rcard" style={{ transitionDelay:`${i * .1}s` }} onMouseEnter={ih} onMouseLeave={il}>
                <div className="rstars">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <Icon.Star key={j} style={{ ...sz(13), color:"#FFB700" }} />
                  ))}
                </div>
                <p className="rquote">"{r.q}"</p>
                <div className="rauthor">
                  <div className="rav">{r.name[0]}</div>
                  <div>
                    <div className="rname">{r.name}</div>
                    <div className="rloc">{r.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ CONTACT ═══ */}
        <section id="contact" className="contact-sec">
          <div className="slbl">Find Us</div>
          <h2>Visit <em>Spice Delight</em> on MG Road.</h2>
          <div className="cgrid">
            <div>
              <div className="ccard">
                <div className="ccardtitle">Opening Hours</div>
                {[["Monday – Friday","11:00 AM – 11:00 PM"],["Saturday","10:00 AM – 11:30 PM"],["Sunday","10:00 AM – 10:30 PM"]].map(([d, t]) => (
                  <div key={d} className="hrow">
                    <span className="hday">{d}</span>
                    <span className="htime">{t}</span>
                    <span className="hstatus">Open</span>
                  </div>
                ))}
              </div>
              <div className="mapf">
                <img src="https://images.unsplash.com/photo-1569336415962-a4bd9f69c07a?w=800&q=70&auto=format&fit=crop" alt="Map" />
                <div className="mapo">
                  <Icon.Pin style={{ ...sz(26), color:"#C8001A" }} />
                  <strong>MG Road, Bangalore</strong>
                  <a href="https://maps.google.com" target="_blank" rel="noreferrer">
                    Open in Maps <Icon.Arrow style={{ ...sz(11), marginLeft:4 }} />
                  </a>
                </div>
              </div>
            </div>
            <div className="ccard">
              <div className="ccardtitle">Contact & Info</div>
              {[
                [<Icon.Pin style={{ ...sz(17) }} />, "Address", "MG Road, Bangalore, KA 560001"],
                [<Icon.Phone style={{ ...sz(17) }} />, "Phone", <a key="ph" href="tel:8888888888">+91 88888 88888</a>],
                [<Icon.Mail style={{ ...sz(17) }} />, "Email", <a key="em" href="mailto:contact@spicedelight.com">contact@spicedelight.com</a>],
                [<Icon.Chef style={{ ...sz(17) }} />, "Type", "North Indian · Café · Dine-In & Takeaway"],
                [<Icon.Clock style={{ ...sz(17) }} />, "Hours", "Open 7 days · 10 AM – 11 PM"],
              ].map(([ic, l, v]) => (
                <div key={String(l)} className="crow">
                  <div className="cicon">{ic}</div>
                  <div><div className="clbl">{l}</div><div className="cval">{v}</div></div>
                </div>
              ))}
              <button className="bprim" style={{ width:"100%", justifyContent:"center", marginTop:22 }}
                onClick={() => navigate()} onMouseEnter={ih} onMouseLeave={il}>
                <span className="bshine" />
                <Icon.Bag style={{ ...sz(14), marginRight:7 }} />
                Start Your Order
              </button>
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="cta-sec" ref={ctaRef}>
          <div className={`ctain${ctaVis ? " vis" : ""}`}>
            <div className="ctaico">
              <Icon.Flame style={{ ...sz(48), color:"#C8001A" }} />
            </div>
            <h2>Hungry? <em>Come In.</em><br />We're Ready for You.</h2>
            <p className="bp" style={{ maxWidth:460, margin:"14px auto 0", textAlign:"center" }}>
              Walk in anytime or call ahead. Hot food, warm service, MG Road vibes — every day.
            </p>
            <div className="ctabtns">
              <button className="bprim" onClick={() => navigate()} onMouseEnter={ih} onMouseLeave={il}>
                <span className="bshine" />
                <Icon.Bag style={{ ...sz(14), marginRight:7 }} />
                Start Your Order
              </button>
              <a href="mailto:contact@spicedelight.com" className="bout2">
                <Icon.Mail style={{ ...sz(14), marginRight:7 }} />
                Send a Message
              </a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="fgrid">
            <div>
              <div className="fbrand">
                <Icon.Flame style={{ ...sz(20), color:"#FFD500" }} />
                Spice Delight
              </div>
              <p className="fdesc">North Indian cuisine crafted with tradition, served with love. MG Road's favourite café since 2009.</p>
            </div>
            <div>
              <div className="fh">Quick Links</div>
              <ul className="flinks">
                {[["menu","Our Menu"],["about","About Us"],["reviews","Reviews"],["contact","Find Us"]].map(([id, label]) => (
                  <li key={id}><a onClick={() => scrollTo(id)}>{label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="fh">Contact</div>
              <ul className="flinks">
                <li><a href="tel:8888888888">+91 88888 88888</a></li>
                <li><a href="mailto:contact@spicedelight.com">contact@spicedelight.com</a></li>
                <li><a>MG Road, Bangalore</a></li>
                <li><a>Open 10AM – 11PM</a></li>
              </ul>
            </div>
          </div>
          <div className="fbot">
            <span>© 2026 Spice Delight. All rights reserved.</span>
            <span style={{ color:"#FFD500", display:"flex", alignItems:"center", gap:6 }}>
              <Icon.Flame style={{ ...sz(12) }} /> Made with love in Bangalore
            </span>
          </div>
        </footer>

      </div>
    </>
  );
}

/* ══════════════════════════════════
   LUXURY CSS
══════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600;700&display=swap');

:root {
  --white: #FFFFFF;
  --cream: #FFFBF2;
  --cream2: #FFF5DC;
  --cream3: #FFEDBA;
  --saffron: #FF9A00;
  --gold: #FFB700;
  --yellow: #FFD500;
  --crimson: #C8001A;
  --dark: #1C0505;
  --dark2: #3D0A0A;
  --body: #5A1A00;
  --muted: #A0522D;
  --border: rgba(200,0,26,.1);
  --glow: rgba(200,0,26,.28);
  --border-soft: rgba(200,0,26,.07);
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'Jost', sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; overflow-x: hidden; }
body {
  background: var(--cream);
  color: var(--dark);
  font-family: var(--font-body);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
img { display: block; max-width: 100%; }
a { text-decoration: none; color: inherit; }
button { font-family: inherit; border: none; cursor: pointer; background: none; }

/* ── Cursor ── */
@media(pointer:fine){body{cursor:none}}
.cdot {
  position: fixed; z-index: 99999; pointer-events: none;
  width: 6px; height: 6px;
  background: var(--crimson); border-radius: 50%;
  transform: translate(-50%,-50%);
  transition: width .15s, height .15s, background .2s;
}
.cring {
  position: fixed; z-index: 99998; pointer-events: none;
  width: 28px; height: 28px;
  border: 1px solid rgba(200,0,26,.3); border-radius: 50%;
  transform: translate(-50%,-50%);
  transition: width .25s cubic-bezier(.16,1,.3,1), height .25s cubic-bezier(.16,1,.3,1), border-color .2s;
}
.cdot.cb { width: 10px; height: 10px; background: var(--saffron); }
.cring.cb { width: 46px; height: 46px; border-color: rgba(200,0,26,.16); }
@media(pointer:coarse){.cdot,.cring{display:none}}

/* ── Table Banner ── */
.tbanner {
  position: fixed; top: 0; left: 0; right: 0; z-index: 2000;
  height: 36px;
  background: linear-gradient(90deg, var(--crimson), var(--saffron));
  display: flex; align-items: center; justify-content: center; gap: 20px;
  font-size: 9px; font-weight: 600; letter-spacing: 3px;
  text-transform: uppercase; color: rgba(255,255,255,.92); font-family: var(--font-body);
}
.tbanner span { display: flex; align-items: center; gap: 6px; }
.tbadge {
  background: rgba(255,255,255,.15); padding: 3px 12px;
  border-radius: 50px; border: 1px solid rgba(255,255,255,.25);
}

/* ── Page wrapper ── */
.pwrap { opacity: 0; transform: translateY(10px); transition: opacity 1s cubic-bezier(.16,1,.3,1), transform 1s cubic-bezier(.16,1,.3,1); }
.pwrap.in { opacity: 1; transform: translateY(0); }

/* ══════════ NAV ══════════ */
nav {
  position: fixed; left: 0; right: 0; z-index: 1000;
  height: 68px; padding: 0 5vw;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255,251,242,.82);
  backdrop-filter: blur(28px) saturate(180%);
  border-bottom: 1px solid var(--border-soft);
  transition: background .5s, box-shadow .5s;
}
nav.sc {
  background: rgba(255,251,242,.97);
  box-shadow: 0 1px 0 var(--border), 0 8px 40px rgba(200,0,26,.05);
}
.nbrand { display: flex; align-items: center; gap: 12px; }
.nemblem {
  width: 36px; height: 36px;
  border: 1px solid rgba(200,0,26,.2); border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(200,0,26,.04);
  transition: border-color .3s, background .3s;
}
.nbrand:hover .nemblem { border-color: rgba(200,0,26,.4); background: rgba(200,0,26,.07); }
.nname {
  font-family: var(--font-display); font-size: 20px; font-weight: 600;
  color: var(--crimson); display: block; line-height: 1.1; letter-spacing: .5px;
}
.ntag {
  font-size: 8px; letter-spacing: 3.5px; text-transform: uppercase;
  color: var(--muted); font-weight: 500; display: block; margin-top: 1px;
}
.nlinks { display: flex; gap: 30px; list-style: none; }
.nlinks a {
  font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--body); font-weight: 600;
  transition: color .25s; position: relative; cursor: pointer;
  padding-bottom: 4px;
}
.nlinks a::after {
  content: ''; position: absolute; bottom: 0; left: 0;
  width: 0; height: 1px; background: var(--crimson);
  transition: width .35s cubic-bezier(.16,1,.3,1);
}
.nlinks a:hover { color: var(--crimson); }
.nlinks a:hover::after { width: 100%; }

.ncta {
  position: relative; overflow: hidden;
  background: var(--crimson); color: rgba(255,255,255,.95);
  padding: 10px 24px; border-radius: 2px;
  font-size: 9px; font-weight: 600; letter-spacing: 2.5px;
  text-transform: uppercase;
  display: flex; align-items: center;
  transition: transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s;
  box-shadow: 0 4px 20px rgba(200,0,26,.25);
}
.ncta:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(200,0,26,.38); }
.nshine {
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent);
  transform: translateX(-100%); transition: transform .6s;
}
.ncta:hover .nshine { transform: translateX(100%); }

.mhbg { display: none; color: var(--crimson); padding: 4px; align-items: center; }
.mmenu {
  position: fixed; left: 0; right: 0; z-index: 900;
  background: rgba(255,251,242,.98); backdrop-filter: blur(28px);
  border-bottom: 1px solid var(--border);
  padding: 22px 5vw 30px;
  transform: translateY(-8px); opacity: 0; pointer-events: none;
  transition: transform .4s cubic-bezier(.16,1,.3,1), opacity .4s;
}
.mmenu.on { transform: translateY(0); opacity: 1; pointer-events: all; }
.mmenu a {
  display: block; padding: 14px 0;
  font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
  color: var(--body); border-bottom: 1px solid var(--border);
  font-weight: 600; cursor: pointer; transition: color .2s;
}
.mmenu a:hover { color: var(--crimson); }
.mmcta {
  width: 100%; margin-top: 18px; padding: 14px;
  background: var(--crimson); color: #fff; border-radius: 2px;
  font-size: 10px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase;
  display: flex; align-items: center; justify-content: center;
}

/* ════════════════════════════════
   HERO — editorial split
════════════════════════════════ */
.hero {
  position: relative; min-height: 100svh; overflow: hidden;
  display: grid; grid-template-columns: 1fr 1fr;
  background: var(--cream);
}

/* LEFT: Photo */
.hphoto { position: relative; overflow: hidden; background: #100202; min-height: 100svh; }

.hslide { position: absolute; inset: 0; opacity: 0; transition: opacity 1.6s cubic-bezier(.4,0,.2,1); z-index: 1; }
.hslide.on { opacity: 1; z-index: 2; }
.hslide.out { opacity: 0; z-index: 1; }
.hslide img {
  width: 100%; height: 100%; object-fit: cover;
  transform: scale(1.04); transition: transform 8s ease;
}
.hslide.on img { transform: scale(1); }

/* Refined gradient — less heavy */
.hphoto::after {
  content: ''; position: absolute; inset: 0; z-index: 3; pointer-events: none;
  background:
    linear-gradient(to bottom, rgba(16,2,2,.15) 0%, transparent 30%, transparent 55%, rgba(10,2,2,.55) 100%),
    linear-gradient(to right, transparent 80%, rgba(255,251,242,.1) 100%);
}

/* Counter */
.hcounter {
  position: absolute; top: 100px; left: 36px; z-index: 10;
  display: flex; align-items: baseline; gap: 12px;
}
.hc-cur {
  font-family: var(--font-display); font-size: 52px; font-weight: 300;
  color: rgba(255,255,255,.88); line-height: 1; letter-spacing: -2px;
}
.hc-sep { width: 32px; height: 1px; background: rgba(255,255,255,.25); margin-bottom: 10px; }
.hc-tot {
  font-size: 12px; color: rgba(255,255,255,.28); font-weight: 500;
  letter-spacing: 1.5px; text-transform: uppercase;
}

/* Dots */
.hsdots { position: absolute; bottom: 36px; left: 36px; z-index: 10; display: flex; gap: 6px; }
.hsdot {
  width: 6px; height: 6px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,.3); background: transparent;
  cursor: pointer; transition: all .4s; padding: 0;
}
.hsdot.on { background: #fff; width: 22px; border-radius: 3px; border-color: transparent; }

/* Scroll cue */
.hscroll-cue {
  position: absolute; bottom: 36px; right: 28px; z-index: 10;
  display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: .35;
}
.hsc-line {
  width: 1px; height: 52px;
  background: linear-gradient(to bottom, rgba(255,255,255,.8), transparent);
  animation: scAnim 2.2s ease-in-out infinite;
}
@keyframes scAnim {
  0%{transform:scaleY(0);transform-origin:top}
  50%{transform:scaleY(1);transform-origin:top}
  50.01%{transform-origin:bottom}
  100%{transform:scaleY(0);transform-origin:bottom}
}
.hscroll-cue span {
  font-size: 7px; letter-spacing: 4px; text-transform: uppercase;
  color: rgba(255,255,255,.45); font-weight: 500; writing-mode: horizontal-tb;
}

/* RIGHT: Content */
.hcont {
  display: flex; flex-direction: column; justify-content: center;
  padding: clamp(96px,10vw,130px) clamp(36px,5.5vw,72px) 68px;
  position: relative; z-index: 5; background: var(--cream);
}
.hcont::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 65% 45% at 92% 12%, rgba(255,210,0,.055), transparent 55%),
    radial-gradient(ellipse 45% 35% at 4% 88%, rgba(200,0,26,.03), transparent 50%);
}

/* Fine horizontal rule */
.hcont::after {
  content: ''; position: absolute; top: 0; bottom: 0; left: 0;
  width: 1px; background: linear-gradient(to bottom, transparent, rgba(200,0,26,.08) 25%, rgba(200,0,26,.08) 75%, transparent);
}

/* Badge */
.hbadge {
  display: inline-flex; align-items: center; gap: 8px;
  border: 1px solid rgba(200,0,26,.2); padding: 6px 16px; border-radius: 2px;
  font-size: 8px; letter-spacing: 3px; text-transform: uppercase;
  color: var(--crimson); font-weight: 600; margin-bottom: 28px; width: fit-content;
  opacity: 0; transform: translateY(12px); transition: opacity .7s, transform .7s;
  background: rgba(200,0,26,.03);
}
.hbadge.show { opacity: 1; transform: translateY(0); }
.hpulse {
  width: 6px; height: 6px; background: #22c55e; border-radius: 50%;
  animation: gp 1.4s ease-in-out infinite; flex-shrink: 0;
}
@keyframes gp {
  0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.45)}
  50%{box-shadow:0 0 0 5px rgba(34,197,94,0)}
}

/* Title */
.htitle {
  font-family: var(--font-display); font-size: clamp(44px,5.8vw,84px);
  font-weight: 300; line-height: .95; letter-spacing: -1px; margin-bottom: 24px;
}
.hl {
  display: block; color: var(--dark);
  transform: translateY(52px); opacity: 0;
  transition: transform 1s cubic-bezier(.16,1,.3,1), opacity 1s;
}
.hl.accent {
  font-style: italic; font-weight: 400;
  background: linear-gradient(95deg, var(--crimson), var(--saffron) 70%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hl.show { transform: translateY(0); opacity: 1; }

.hsub {
  font-size: 14px; color: var(--body); line-height: 1.95; margin-bottom: 34px;
  max-width: 440px; font-weight: 300; letter-spacing: .2px;
  opacity: 0; transform: translateY(14px); transition: opacity .85s, transform .85s;
}
.hsub.show { opacity: 1; transform: translateY(0); }

.hbtns {
  display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px;
  opacity: 0; transform: translateY(14px); transition: opacity .85s, transform .85s;
}
.hbtns.show { opacity: 1; transform: translateY(0); }

.htags {
  display: flex; flex-wrap: wrap; gap: 16px;
  opacity: 0; transform: translateY(12px); transition: opacity .85s, transform .85s;
}
.htags.show { opacity: 1; transform: translateY(0); }
.htags span {
  font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--muted); font-weight: 500; display: flex; align-items: center;
}

/* Stats row */
.hstats {
  display: flex; gap: 0; margin-top: 32px; padding-top: 24px;
  border-top: 1px solid rgba(200,0,26,.09);
  opacity: 0; transform: translateY(12px); transition: opacity .85s, transform .85s;
}
.hstats.show { opacity: 1; transform: translateY(0); }
.hstat {
  padding: 0 28px 0 0; margin: 0 28px 0 0;
  border-right: 1px solid rgba(200,0,26,.09);
}
.hstat:last-child { border: none; padding: 0; margin: 0; }
.hstat-n {
  font-family: var(--font-display); font-size: clamp(24px,3vw,36px);
  font-weight: 600; color: var(--crimson); display: block; line-height: 1; letter-spacing: -.5px;
}
.hstat-l {
  font-size: 8px; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--muted); font-weight: 500; display: block; margin-top: 4px;
}

/* ── STATS BAR ── */
.statsbar {
  display: grid; grid-template-columns: repeat(4,1fr);
  background: var(--white); border-bottom: 1px solid var(--border);
}
.sitem {
  padding: 24px 16px; text-align: center;
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  transition: background .3s;
}
.sitem:last-child { border: none; }
.sitem:hover { background: rgba(200,0,26,.02); }
.sicon { color: var(--crimson); opacity: .55; margin-bottom: 4px; }
.snum {
  font-family: var(--font-display); font-size: clamp(24px,3.8vw,40px);
  font-weight: 600; color: var(--crimson); display: block; line-height: 1; letter-spacing: -.5px;
}
.slbl2 {
  font-size: 8px; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--muted); font-weight: 500; display: block;
}

/* ── MARQUEES ── */
.mqred { overflow: hidden; padding: 15px 0; background: var(--crimson); }
.mqcream {
  overflow: hidden; padding: 14px 0; background: var(--cream3);
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
}
.mqt {
  display: flex; width: max-content;
  animation: mqs 32s linear infinite; user-select: none;
}
.mqt.rev { animation-direction: reverse; }
.mqt:hover { animation-play-state: paused; }
@keyframes mqs { from{transform:translateX(0)} to{transform:translateX(-50%)} }
.mqi {
  display: inline-flex; align-items: center; padding: 0 22px;
  font-size: 9px; letter-spacing: 3.5px; text-transform: uppercase; font-weight: 600;
  white-space: nowrap; color: rgba(255,255,255,.8); font-family: var(--font-body);
}
.mqci {
  display: inline-flex; align-items: center; padding: 0 22px;
  font-size: 9px; letter-spacing: 3.5px; text-transform: uppercase; font-weight: 600;
  white-space: nowrap; color: var(--body); font-family: var(--font-body);
}

/* ── SECTIONS ── */
section { padding: 96px 5vw; position: relative; }
.slbl {
  font-size: 8px; letter-spacing: 5px; text-transform: uppercase; color: var(--crimson);
  margin-bottom: 16px; font-weight: 600; display: flex; align-items: center; gap: 14px;
}
.slbl::before { content:''; width: 24px; height: 1px; background: var(--crimson); }
h2 {
  font-family: var(--font-display); font-size: clamp(30px,4.5vw,58px);
  font-weight: 300; line-height: 1.1; margin-bottom: 18px; color: var(--dark); letter-spacing: -.5px;
}
h2 em { font-style: italic; color: var(--crimson); font-weight: 400; }
.bp { font-size: 14px; color: var(--body); line-height: 1.9; max-width: 520px; margin-bottom: 12px; font-weight: 300; }

/* ── ABOUT ── */
.about-sec { background: var(--cream2); }
.agrid { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
.aimg-wrap {
  position: relative;
  opacity: 0; transform: translateX(-28px); transition: opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1);
}
.atext {
  opacity: 0; transform: translateX(28px);
  transition: opacity .9s cubic-bezier(.16,1,.3,1) .16s, transform .9s cubic-bezier(.16,1,.3,1) .16s;
}
.agrid.vis .aimg-wrap, .agrid.vis .atext { opacity: 1; transform: translateX(0); }
.aimg {
  position: relative; border-radius: 4px; overflow: hidden;
  aspect-ratio: 4/5; box-shadow: 0 32px 80px rgba(200,0,26,.12), 0 2px 0 rgba(200,0,26,.08);
}
.aimg img { width: 100%; height: 100%; object-fit: cover; transition: transform 8s ease; }
.aimg:hover img { transform: scale(1.03); }

/* Elegant border glow */
.aglow {
  position: absolute; inset: 0; border-radius: 4px;
  background: linear-gradient(135deg, var(--crimson), var(--saffron), var(--yellow), var(--crimson));
  background-size: 300% 300%;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out; mask-composite: exclude;
  padding: 1.5px; animation: grot 5s linear infinite;
}
@keyframes grot { 0%{background-position:0%} 100%{background-position:300%} }

.abadge {
  position: absolute; bottom: -14px; right: 18px;
  background: var(--crimson); color: #fff;
  font-size: 9px; font-weight: 600; letter-spacing: 2.5px;
  padding: 9px 18px; border-radius: 2px; text-transform: uppercase;
  box-shadow: 0 8px 28px rgba(200,0,26,.3);
}

.afacts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 24px; }
.af {
  display: flex; align-items: flex-start; gap: 12px; padding: 16px;
  background: var(--white); border: 1px solid var(--border);
  border-radius: 4px; cursor: default;
  transition: border-color .3s, transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s;
  box-shadow: 0 2px 8px rgba(200,0,26,.03);
}
.af:hover {
  border-color: rgba(200,0,26,.22); transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(200,0,26,.08);
}
.aficon { color: var(--crimson); flex-shrink: 0; margin-top: 1px; opacity: .8; }
.aft { font-size: 11px; font-weight: 600; margin-bottom: 3px; color: var(--dark); letter-spacing: .3px; }
.afd { font-size: 10px; color: var(--body); line-height: 1.55; font-weight: 300; }

/* ── PHOTO STRIP ── */
.strip {
  overflow: hidden; padding: 24px 0;
  background: var(--white); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
}
.sttrack {
  display: flex; gap: 14px; padding: 4px 10px;
  width: max-content; animation: mqs 38s linear infinite;
}
.sttrack:hover { animation-play-state: paused; }
.sti {
  flex-shrink: 0; border-radius: 4px; overflow: hidden; position: relative;
  width: clamp(180px,25vw,290px); height: clamp(180px,20vw,244px);
  box-shadow: 0 8px 28px rgba(200,0,26,.06);
  transition: transform .5s cubic-bezier(.16,1,.3,1), box-shadow .5s;
}
.sti:hover { transform: scale(1.04); box-shadow: 0 20px 50px rgba(200,0,26,.14); }
.sti img { width: 100%; height: 100%; object-fit: cover; transition: transform 6s ease; }
.sti:hover img { transform: scale(1.06); }
.stov { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 48%, rgba(28,5,5,.58)); }
.stlbl {
  position: absolute; bottom: 12px; left: 14px;
  font-family: var(--font-display); font-size: 17px; font-weight: 400;
  color: rgba(255,255,255,.92); font-style: italic;
}

/* ── MENU ── */
.menu-sec { background: var(--cream); }
.mgrid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; margin-top: 30px; }
.mc {
  border-radius: 4px; overflow: hidden; background: var(--white);
  border: 1px solid var(--border);
  transition: transform .5s cubic-bezier(.16,1,.3,1), box-shadow .5s, opacity .7s;
  box-shadow: 0 4px 16px rgba(200,0,26,.04); opacity: 0; transform: translateY(28px);
}
.mgrid.vis .mc { opacity: 1; transform: translateY(0); }
.mc:hover {
  transform: translateY(-8px) !important;
  box-shadow: 0 28px 60px rgba(200,0,26,.12); border-color: rgba(200,0,26,.18);
}
.mcimg { height: clamp(148px,19vw,205px); overflow: hidden; position: relative; }
.mcimg img { width: 100%; height: 100%; object-fit: cover; transition: transform 6s ease; }
.mc:hover .mcimg img { transform: scale(1.07); }
.mcov { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(28,5,5,.38)); }
.mcbadge {
  position: absolute; top: 12px; left: 12px;
  background: var(--crimson); padding: 4px 10px; border-radius: 2px;
  font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: #fff; font-weight: 600; z-index: 1;
}
.vegdot {
  position: absolute; top: 12px; right: 12px;
  width: 20px; height: 20px; border: 2px solid #22c55e;
  background: rgba(255,255,255,.9); border-radius: 4px;
  display: flex; align-items: center; justify-content: center; z-index: 1;
}
.vegdot::before { content:''; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; display: block; }
.mcbody { padding: 16px 18px 18px; }
.mcname {
  font-family: var(--font-display); font-size: 19px; font-weight: 600;
  margin-bottom: 5px; color: var(--dark); letter-spacing: .2px; line-height: 1.2;
}
.mcdesc { font-size: 11px; color: var(--body); line-height: 1.65; margin-bottom: 14px; font-weight: 300; }
.mcfoot { display: flex; align-items: center; justify-content: space-between; }
.mcprice {
  font-family: var(--font-display); font-size: 22px; font-weight: 600;
  color: var(--crimson); letter-spacing: -.3px;
}
.mcrating {
  font-size: 10px; color: var(--muted); font-weight: 500;
  display: flex; align-items: center; margin-top: 3px; letter-spacing: .5px;
}
.mcadd {
  width: 34px; height: 34px; background: var(--crimson); border-radius: 2px;
  display: flex; align-items: center; justify-content: center; color: #fff;
  transition: transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s;
  cursor: pointer; box-shadow: 0 4px 14px rgba(200,0,26,.28);
}
.mcadd:hover { transform: scale(1.18); box-shadow: 0 8px 24px rgba(200,0,26,.42); }

/* ── PARALLAX ── */
.pxwrap { height: clamp(300px,44vw,460px); overflow: hidden; position: relative; }
.pxwrap img { width: 100%; height: 135%; object-fit: cover; will-change: transform; transform: translateY(-15%); }
.pxov {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(135deg, rgba(14,3,3,.62), rgba(28,8,0,.55));
}
.pxcont {
  position: absolute; inset: 0; z-index: 2;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 0 5vw;
}
.pxcont blockquote {
  font-family: var(--font-display); font-size: clamp(22px,4vw,52px);
  font-weight: 300; font-style: italic; color: rgba(255,255,255,.92);
  line-height: 1.35; max-width: 780px; letter-spacing: -.3px;
}
.pxcont cite {
  display: block; margin-top: 16px; font-size: 8px; letter-spacing: 5px;
  text-transform: uppercase; color: var(--gold); font-style: normal; font-weight: 500;
}

/* ── REVIEWS ── */
.rev-sec { background: var(--cream2); }
.rgrid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; margin-top: 40px; }
.rcard {
  padding: 28px; border-radius: 4px; background: var(--white);
  border: 1px solid var(--border); position: relative; overflow: hidden;
  opacity: 0; transform: translateY(24px);
  transition: transform .5s cubic-bezier(.16,1,.3,1), box-shadow .5s, opacity .7s, border-color .3s;
  box-shadow: 0 4px 16px rgba(200,0,26,.04);
}
.rgrid.vis .rcard { opacity: 1; transform: translateY(0); }
.rcard::before {
  content: '"'; position: absolute; top: -22px; left: 14px;
  font-family: var(--font-display); font-size: 130px; color: rgba(200,0,26,.04);
  line-height: 1; pointer-events: none;
}
.rcard:hover {
  transform: translateY(-6px) !important;
  box-shadow: 0 22px 54px rgba(200,0,26,.1); border-color: rgba(200,0,26,.18);
}
.rstars { display: flex; gap: 2px; margin-bottom: 14px; }
.rquote {
  font-size: 13px; color: var(--body); line-height: 1.85;
  font-style: italic; margin-bottom: 18px; font-weight: 300;
  font-family: var(--font-display); font-size: 15px; letter-spacing: .1px;
}
.rauthor { display: flex; align-items: center; gap: 10px; }
.rav {
  width: 36px; height: 36px; border-radius: 2px;
  background: linear-gradient(135deg, var(--crimson), var(--saffron));
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 17px; font-weight: 600; color: #fff; flex-shrink: 0;
}
.rname { font-size: 12px; font-weight: 600; color: var(--dark); letter-spacing: .3px; }
.rloc { font-size: 9px; color: var(--muted); letter-spacing: 1px; font-weight: 400; margin-top: 2px; }

/* ── CONTACT ── */
.contact-sec { background: var(--cream); }
.cgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; margin-top: 30px; }
.ccard {
  background: var(--white); border: 1px solid var(--border);
  border-radius: 4px; padding: 28px;
  box-shadow: 0 4px 16px rgba(200,0,26,.04);
}
.ccardtitle {
  font-size: 8px; letter-spacing: 4px; text-transform: uppercase;
  color: var(--crimson); font-weight: 600; margin-bottom: 20px; padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.hrow {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 0; border-bottom: 1px solid var(--border-soft);
}
.hrow:last-child { border: none; }
.hday { font-size: 12px; font-weight: 500; color: var(--dark); }
.htime { font-size: 11px; color: var(--body); font-weight: 300; }
.hstatus {
  font-size: 8px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600;
  color: #16a34a; background: rgba(22,163,74,.08); padding: 3px 9px; border-radius: 2px;
}
.mapf {
  margin-top: 14px; border-radius: 4px; overflow: hidden; height: 195px;
  position: relative; border: 1px solid var(--border);
}
.mapf img { width: 100%; height: 100%; object-fit: cover; opacity: .45; }
.mapo {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 7px;
}
.mapo strong { font-size: 13px; font-weight: 500; color: var(--dark); }
.mapo a {
  font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--crimson);
  background: rgba(255,255,255,.92); padding: 7px 16px; border-radius: 2px;
  border: 1px solid var(--crimson); font-weight: 600;
  transition: all .25s; display: flex; align-items: center;
}
.mapo a:hover { background: var(--crimson); color: #fff; }
.crow {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 13px 0; border-bottom: 1px solid var(--border-soft);
}
.crow:last-of-type { border: none; }
.cicon { color: var(--crimson); flex-shrink: 0; margin-top: 2px; opacity: .75; }
.clbl { font-size: 8px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; font-weight: 500; }
.cval { font-size: 13px; color: var(--dark); font-weight: 400; }
.cval a { color: var(--crimson); transition: color .2s; }
.cval a:hover { color: var(--saffron); }

/* ── CTA ── */
.cta-sec {
  text-align: center; padding: 100px 5vw;
  background: linear-gradient(160deg, var(--cream3), #FFE0A0, var(--cream3));
  position: relative; overflow: hidden;
}
.cta-sec::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse 60% 52% at 50% 62%, rgba(200,0,26,.05), transparent 58%);
}
/* Decorative corner lines */
.cta-sec::after {
  content: ''; position: absolute; inset: 24px;
  border: 1px solid rgba(200,0,26,.07); border-radius: 2px; pointer-events: none;
}
.ctain {
  position: relative; z-index: 1;
  opacity: 0; transform: translateY(32px); transition: opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1);
}
.ctain.vis { opacity: 1; transform: translateY(0); }
.ctaico {
  display: flex; justify-content: center; margin-bottom: 20px;
  animation: flpls 3s ease-in-out infinite;
}
@keyframes flpls {
  0%,100%{filter:drop-shadow(0 0 6px rgba(200,0,26,.2))}
  50%{filter:drop-shadow(0 0 22px rgba(200,0,26,.6))}
}
.ctabtns { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; margin-top: 36px; }

/* ── BUTTONS ── */
.bprim {
  position: relative; overflow: hidden;
  background: var(--crimson); color: rgba(255,255,255,.95);
  padding: 14px 30px; border-radius: 2px;
  font-size: 9px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase;
  transition: transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s;
  display: inline-flex; align-items: center;
  box-shadow: 0 6px 24px rgba(200,0,26,.28); cursor: pointer; border: none;
  font-family: var(--font-body);
}
.bprim:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(200,0,26,.42); }
.bshine {
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.14), transparent);
  transform: translateX(-100%); transition: transform .6s;
}
.bprim:hover .bshine { transform: translateX(100%); }

.bout2 {
  display: inline-flex; align-items: center;
  font-size: 9px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--crimson); border: 1px solid var(--crimson);
  padding: 13px 28px; border-radius: 2px;
  transition: background .25s, color .25s; cursor: pointer; background: none;
  font-family: var(--font-body);
}
.bout2:hover { background: var(--crimson); color: #fff; }

/* ── FOOTER ── */
footer { padding: 54px 5vw 24px; background: var(--dark2); }
.fgrid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 38px; }
.fbrand {
  font-family: var(--font-display); font-size: 24px; font-weight: 600;
  color: var(--yellow); display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
  letter-spacing: .5px;
}
.fdesc { font-size: 12px; color: rgba(255,210,150,.45); line-height: 1.85; max-width: 260px; font-weight: 300; }
.fh {
  font-size: 8px; letter-spacing: 4px; text-transform: uppercase;
  color: var(--gold); margin-bottom: 16px; font-weight: 600;
}
.flinks { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.flinks li a { font-size: 12px; color: rgba(255,210,150,.38); transition: color .25s; cursor: pointer; font-weight: 300; }
.flinks li a:hover { color: var(--yellow); }
.fbot {
  padding-top: 24px; border-top: 1px solid rgba(255,210,150,.1);
  display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center;
  gap: 12px; font-size: 10px; color: rgba(255,210,150,.25); letter-spacing: .5px;
}

/* ── RESPONSIVE ── */
@media(max-width:1060px){
  .hero{grid-template-columns:1fr; min-height:auto}
  .hphoto{min-height:60vw; max-height:500px}
  .hcounter{top:22px; left:20px}
  .hcont{padding:44px 5vw 56px; border-top:1px solid var(--border)}
  .hcont::after{display:none}
  .htitle{font-size:clamp(38px,8vw,60px)}
  .hstats{display:none}
  .agrid{grid-template-columns:1fr}
  .cgrid{grid-template-columns:1fr}
  .rgrid{grid-template-columns:1fr 1fr}
  .fgrid{grid-template-columns:1fr 1fr}
  .nlinks,.ncta{display:none}
  .mhbg{display:flex!important}
  .statsbar{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:700px){
  section{padding:60px 5vw}
  .mgrid{grid-template-columns:1fr 1fr}
  .rgrid{grid-template-columns:1fr}
  .fgrid{grid-template-columns:1fr}
}
@media(max-width:480px){
  .mgrid{grid-template-columns:1fr}
  .afacts{grid-template-columns:1fr 1fr}
}
`;
