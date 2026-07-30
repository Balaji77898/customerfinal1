"use client";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  JSX,
  RefObject
} from "react";
import { getSession, saveSession } from "@/app/utils/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pos-backend-s380.onrender.com";

/* ─── SVG Icon System ─── */
type IconProps = React.SVGProps<SVGSVGElement>;

const Icon: Record<string, (p: IconProps) => JSX.Element> = {
  Flame:   (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.11-3.66 5.65-2.7 8.87.06.22.12.44.12.67 0 .44-.36.82-.8.82-.42 0-.72-.27-.83-.65-.03-.1-.06-.2-.08-.31-1.14 1.6-1.33 3.75-.55 5.56.53 1.22 1.39 2.28 2.45 3.04.98.71 2.09 1.21 3.26 1.41.33.06.66.1.99.1 1.23.04 2.44-.26 3.47-.86 2.01-1.14 3.36-3.28 3.36-5.68 0-1.32-.43-2.57-1.14-3.6z"/></svg>,
  Star:    (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>,
  Pin:     (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  Phone:   (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
  Mail:    (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
  Bag:     (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/></svg>,
  Arrow:   (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Clock:   (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>,
  Chef:    (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z"/></svg>,
  Check:   (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>,
  Menu:    (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Globe:   (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.9 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.66-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>,
  Diamond: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5L2 9l10 12L22 9l-3-6zm-8.5 0h5L17 7H7l1.5-4zm-5.06 6h3.56l2 8-5.56-8zM12 18l-2.5-9h5L12 18zm3.5-1l2-8h3.56l-5.56 8z"/></svg>,
  Sparkle: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L9 9l-8 3 8 3 3 8 3-8 8-3-8-3z"/></svg>,
  Award:   (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>,
};

/* ─── Generic imagery (no cuisine / diet signalling) ─── */
const BG_SLIDES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1600&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&q=90&auto=format&fit=crop",
];

/* Generic value props — same for every restaurant, no menu/diet content */
const WHY_US = [
  { icon: "Flame",  title: "Fresh Ingredients", desc: "Sourced and prepared with care, every single day." },
  { icon: "Chef",   title: "Skilled Kitchen",   desc: "Dishes made by an experienced culinary team." },
  { icon: "Award",  title: "Trusted Quality",   desc: "Consistent standards guests can rely on." },
  { icon: "Clock",  title: "Quick Service",     desc: "Your order handled promptly, from kitchen to table." },
  { icon: "Sparkle",title: "Hygienic Kitchen",  desc: "Cleanliness and food safety always come first." },
  { icon: "Globe",  title: "Dine-In & Takeaway",desc: "Enjoy here or take your order on the go." },
] as const;

const STRIP_IMGS = [
  { src:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80&auto=format&fit=crop", label:"Warm Ambience" },
  { src:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80&auto=format&fit=crop", label:"Fresh Ingredients" },
  { src:"https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&q=80&auto=format&fit=crop", label:"Attentive Service" },
  { src:"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&q=80&auto=format&fit=crop", label:"Great Hospitality" },
  { src:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80&auto=format&fit=crop", label:"Quick Service" },
  { src:"https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&q=80&auto=format&fit=crop", label:"Cozy Setting" },
];

/* ─── API types (matches GET /api/customer/restaurant) ─── */
interface RestaurantInfo {
  id: string;
  name: string;
  description: string | null;
  restaurant_type: string;
  address: string;
  city: string;
  state: string | null;
}
interface TableApiInfo {
  id: string;
  table_number: string;
}
interface ContactsInfo {
  phone: string | null;
  email: string | null;
}
interface RestaurantApiData {
  restaurant: RestaurantInfo;
  table: TableApiInfo;
  contacts: ContactsInfo;
}

/* ─── Scroll reveal hook ─── */
function useReveal(threshold = 0.08): [RefObject<HTMLElement | null>, boolean]{
  const ref = useRef<HTMLElement | null>(null);
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
interface RevealProps {
  children: React.ReactNode;
  vis: boolean;
  delay?: number;
  style?: React.CSSProperties;
}
function Reveal({ children, vis, delay = 0, style = {} }: RevealProps) {
  return (
    <div style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(28px)",
      transition: `opacity .8s cubic-bezier(.16,1,.3,1) ${delay}s, transform .8s cubic-bezier(.16,1,.3,1) ${delay}s`,
      ...style
    }}>
      {children}
    </div>
  );
}

/* ─── Loader ─── */
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
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#FFFBF0", fontFamily:"'Fraunces', serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>
      <div style={{ textAlign:"center", width:260 }}>
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:30, letterSpacing:-0.5, color:"#1C0505", marginBottom:10, fontWeight:800 }}>Welcome</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:3, textTransform:"uppercase", color:"rgba(200,0,26,.7)", marginBottom:30, fontWeight:600 }}>Loading your table</div>
        <div style={{ height:2, background:"rgba(200,0,26,.1)", borderRadius:2, overflow:"hidden", position:"relative" }}>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,#C8001A,#FF9A00)", transformOrigin:"left", transform:`scaleX(${prog/100})`, transition:"transform .06s linear", borderRadius:2 }} />
        </div>
      </div>
    </div>
  );
}

/* ─── TableInfo type ─── */
interface TableInfo { token: string | null; table: string | null; }

/* ══════════════════════════════════════════════ */
export default function RestaurantLandingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(BG_SLIDES.length - 1);
  const [titlePhase, setTitlePhase] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [curPos, setCurPos] = useState({ x:-300, y:-300 });
  const [curBig, setCurBig] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);

  const [restaurantData, setRestaurantData] = useState<RestaurantApiData | null>(null);
  const [restaurantError, setRestaurantError] = useState<string>("");

  const pxWrapRef = useRef<HTMLDivElement | null>(null);
  const pxImgRef  = useRef<HTMLImageElement | null>(null);

  const [aboutRef, aboutVis] = useReveal(0.06);
  const [menuRef, menuVis]   = useReveal(0.05);
  const [ctaRef, ctaVis]     = useReveal(0.04);

  const navigate = useCallback(() => {
    if (!tableInfo?.token) return;
    let url = `/customer/cus-detail?token=${tableInfo.token}`;
    if (tableInfo.table) url += `&tableNumber=${tableInfo.table}`;
    router.push(url);
  }, [router, tableInfo]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const table =
      params.get("table") ||
      params.get("tableNo") ||
      params.get("tableNumber");

    if (!token) {
      console.error("Missing token");
      return;
    }

    const existingSession = getSession();
    const session = {
      token,
      tableNumber: table || null,
      user: existingSession?.user || null,
      cart: existingSession?.cart || [],
      orderId: existingSession?.orderId || null,
    };
    saveSession(session);

    setTableInfo({ token: session.token, table: session.tableNumber });
  }, []);

  useEffect(() => {
    const token = tableInfo?.token;
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/customer/restaurant?qrToken=${encodeURIComponent(token)}`
        );
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json?.message || "Failed to load restaurant details");
        setRestaurantData(json.data as RestaurantApiData);
        setRestaurantError("");
      } catch (err) {
        console.error("Restaurant fetch error:", err);
        setRestaurantError(err instanceof Error ? err.message : "Unable to load restaurant details.");
      }
    })();
  }, [tableInfo?.token]);

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
    const onM = (e: MouseEvent) => setCurPos({ x: e.clientX, y: e.clientY });
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
      const img  = pxImgRef.current;
      const wrap = pxWrapRef.current;
      if (!img || !wrap) return;
      const r  = wrap.getBoundingClientRect();
      const pr = (window.innerHeight - r.top) / (window.innerHeight + r.height);
      img.style.transform = `translateY(calc(-15% + ${(pr - .5) * 90}px))`;
    };
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const ih = () => setCurBig(true);
  const il = () => setCurBig(false);

  if (loading) return <Loader />;

  const sz = (s: number): React.CSSProperties => ({ width: s, height: s, flexShrink: 0 });

  const restaurant   = restaurantData?.restaurant;
  const contacts     = restaurantData?.contacts;
  const name         = restaurant?.name || "Our Restaurant";
  const restaurantType = restaurant?.restaurant_type || "Restaurant";
  const city         = restaurant?.city || "";
  const state        = restaurant?.state || "";
  const address      = restaurant?.address || "";
  const fullAddress  = [address, city, state].filter(Boolean).join(", ");
  const phone        = contacts?.phone || null;
  const email        = contacts?.email || null;
  const tableNumber  = restaurantData?.table?.table_number || tableInfo?.table;
  const mapsHref     = fullAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    : "https://maps.google.com";

  return (
    <>
      <style>{CSS}</style>

      <div className={`cdot${curBig ? " cb" : ""}`} style={{ left: curPos.x, top: curPos.y }} />
      <div className={`cring${curBig ? " cb" : ""}`} style={{ left: curPos.x, top: curPos.y }} />

      {tableInfo && (
        <div className="tbanner">
          {tableNumber && (
            <span className="tb-item"><Icon.Pin style={{ ...sz(12), marginRight:5 }} /> Table <b>{tableNumber}</b></span>
          )}
          {tableInfo.token && (
            <span className="tbadge"><Icon.Check style={{ ...sz(11), marginRight:4 }} /> Order active</span>
          )}
        </div>
      )}

      {restaurantError && (
        <div className="rbanner">Couldn&apos;t load restaurant details right now — you can still browse and order.</div>
      )}

      {/* NAV */}
      <nav className={scrollY > 60 ? "sc" : ""} style={{ top: tableInfo ? "38px" : "0" }}>
        <div className="nbrand">
          <div className="nemblem"><Icon.Flame style={{ ...sz(17), color:"#C8001A" }} /></div>
          <div>
            <strong className="nname">{name}</strong>
            <span className="ntag">{restaurantType}{city ? ` · ${city}` : ""}</span>
          </div>
        </div>
        <ul className="nlinks">
          {["about","menu","contact"].map(s => (
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

      <div className={`mmenu${mobOpen ? " on" : ""}`} style={{ top: tableInfo ? "106px" : "68px" }}>
        {["about","menu","contact"].map(s => (
          <a key={s} onClick={() => { scrollTo(s); setMobOpen(false); }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </a>
        ))}
        <button className="mmcta" onClick={() => navigate()}>
          <Icon.Bag style={{ ...sz(14), marginRight:7 }} /> Start Order
        </button>
      </div>

      <div className={`pwrap${revealed ? " in" : ""}`}>

        {/* ═══ HERO ═══ */}
        <section id="hero" className="hero">
          <div className="hphoto">
            {BG_SLIDES.map((src, i) => (
              <div key={i} className={`hslide${i === slideIdx ? " on" : i === prevIdx ? " out" : ""}`}>
                <img src={src} alt="" />
              </div>
            ))}
            <div className="hsdots">
              {BG_SLIDES.map((_, i) => (
                <button key={i} className={`hsdot${i === slideIdx ? " on" : ""}`}
                  onClick={() => { setPrevIdx(slideIdx); setSlideIdx(i); }} />
              ))}
            </div>

            {/* ── Signature: order-ticket card floating on the photo ── */}
            <div className={`tk${titlePhase >= 1 ? " show" : ""}`}>
              <div className="tk-top">
                <span className="tk-eyebrow">Guest Ticket</span>
                <span className="tk-stamp">Open</span>
              </div>
              <div className="tk-punch" />
              <div className="tk-row">
                <span className="tk-label">Table</span>
                <span className="tk-value">{tableNumber || "—"}</span>
              </div>
              <div className="tk-row">
                <span className="tk-label">Venue</span>
                <span className="tk-value tk-value-name">{name}</span>
              </div>
              <div className="tk-row">
                <span className="tk-label">Type</span>
                <span className="tk-value">{restaurantType}{city ? ` · ${city}` : ""}</span>
              </div>
              <div className="tk-punch" />
              <div className="tk-foot">Scan verified · ready to order</div>
            </div>
          </div>

          <div className="hcont">
            <div className={`heyebrow${titlePhase >= 1 ? " show" : ""}`}>
              <span className="heyebrow-dot" />
              {restaurantType}{city ? ` · ${city}` : " · Now Open"}
            </div>
            <h1 className="htitle">
              <span className={`hl${titlePhase >= 1 ? " show" : ""}`}>Welcome to</span>
              <span className={`hl accent${titlePhase >= 2 ? " show" : ""}`} style={{ transitionDelay:".1s" }}>{name}</span>
            </h1>
            <p className={`hsub${titlePhase >= 3 ? " show" : ""}`} style={{ transitionDelay:".45s" }}>
              Freshly prepared {restaurantType.toLowerCase()} dining, crafted with care and served with warmth —
              every visit here is made to feel special.
            </p>
            <div className={`hbtns${titlePhase >= 3 ? " show" : ""}`} style={{ transitionDelay:".6s" }}>
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
            <div className={`htags${titlePhase >= 3 ? " show" : ""}`} style={{ transitionDelay:".76s" }}>
              <span><Icon.Sparkle style={{ ...sz(12), color:"#FF9A00", marginRight:5 }} />Fresh Daily</span>
              <span><Icon.Award style={{ ...sz(12), color:"#FF9A00", marginRight:5 }} />Trusted Quality</span>
              <span><Icon.Globe style={{ ...sz(12), color:"#FF9A00", marginRight:5 }} />Dine-In &amp; Takeaway</span>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="mqred">
          <div className="mqt">
            {[...Array(2)].flatMap((_, li) =>
              ["Fresh Ingredients","Warm Hospitality","Quick Service","Hygienic Kitchen","Great Value","Dine-In & Takeaway"].map((t, i) => (
                <span key={`${li}-${i}`} className="mqi"><Icon.Diamond style={{ ...sz(8), marginRight:9, opacity:.6 }} />{t}</span>
              ))
            )}
          </div>
        </div>

        {/* ═══ ABOUT ═══ */}
        <section id="about" className="about-sec" ref={aboutRef as React.RefObject<HTMLElement>}>
          <div className={`agrid${aboutVis ? " vis" : ""}`}>
            <div className="aimg-wrap">
              <div className="aimg">
                <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=85&auto=format&fit=crop" alt="Interior" />
              </div>
              {city && <div className="abadge">{restaurantType} · {city}</div>}
            </div>
            <div className="atext">
              <div className="slbl">Our Story</div>
              <h2>Crafted with <em>Care,</em><br />Served with Warmth.</h2>
              <p className="bp">
                {restaurant?.description ||
                  `${name} is committed to bringing you a memorable dining experience — thoughtfully prepared food, friendly service, and a welcoming space.`}
              </p>
              <div className="afacts">
                {WHY_US.slice(0, 4).map((f) => {
                  const FIcon = Icon[f.icon];
                  return (
                    <div key={f.title} className="af" onMouseEnter={ih} onMouseLeave={il}>
                      <div className="aficon"><FIcon style={{ ...sz(17) }} /></div>
                      <div><div className="aft">{f.title}</div><div className="afd">{f.desc}</div></div>
                    </div>
                  );
                })}
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

        {/* ═══ WHY US ═══ */}
        <section id="menu" className="menu-sec" ref={menuRef as React.RefObject<HTMLElement>}>
          <Reveal vis={menuVis} delay={0}><div className="slbl">Why Guests Choose Us</div></Reveal>
          <Reveal vis={menuVis} delay={.1}><h2>Good Food, <em>Done Right.</em></h2></Reveal>
          <Reveal vis={menuVis} delay={.2}><p className="bp">Everything is cooked to order, with quality and hospitality front and centre.</p></Reveal>
          <div className={`mgrid${menuVis ? " vis" : ""}`}>
            {WHY_US.map((item, i) => {
              const FIcon = Icon[item.icon];
              return (
                <div key={item.title} className="mc" style={{ transitionDelay:`${i * .07}s` }} onMouseEnter={ih} onMouseLeave={il}>
                  <div className="mc-tear" />
                  <div className="mc-body">
                    <div className="mcicon-wrap"><FIcon style={{ ...sz(22), color:"#C8001A" }} /></div>
                    <div className="mcname">{item.title}</div>
                    <div className="mcdesc">{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <Reveal vis={menuVis} delay={.5} style={{ textAlign:"center", marginTop:48 }}>
            <button className="bprim" onClick={() => navigate()} onMouseEnter={ih} onMouseLeave={il}>
              <span className="bshine" />
              <Icon.Bag style={{ ...sz(14), marginRight:7 }} />
              View Full Menu &amp; Order
            </button>
          </Reveal>
        </section>

        {/* PARALLAX QUOTE */}
        <div className="pxwrap" ref={pxWrapRef}>
          <img ref={pxImgRef} src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80&auto=format&fit=crop" alt="" />
          <div className="pxov" />
          <div className="pxcont">
            <Icon.Diamond style={{ ...sz(20), color:"#FFB700", marginBottom:18, filter:"drop-shadow(0 0 14px rgba(255,183,0,.6))" }} />
            <blockquote>&ldquo;Food is not just eating energy. It&apos;s an experience.&rdquo;</blockquote>
            <cite>— The {name} Philosophy{city ? ` · ${city}` : ""}</cite>
          </div>
        </div>

        {/* ═══ CONTACT ═══ */}
        <section id="contact" className="contact-sec">
          <div className="slbl">Find Us</div>
          <h2>Visit <em>{name}</em>{city ? ` in ${city}.` : "."}</h2>
          <div className="cgrid">
            <div className="mapf">
              <img src="https://images.unsplash.com/photo-1569336415962-a4bd9f69c07a?w=800&q=70&auto=format&fit=crop" alt="Map" />
              <div className="mapo">
                <Icon.Pin style={{ ...sz(24), color:"#C8001A" }} />
                <strong>{fullAddress || "Address coming soon"}</strong>
                <a href={mapsHref} target="_blank" rel="noreferrer">
                  Open in Maps <Icon.Arrow style={{ ...sz(11), marginLeft:4 }} />
                </a>
              </div>
            </div>
            <div className="ccard">
              <div className="ccardtitle">Contact &amp; Info</div>
              <div className="crow">
                <div className="cicon"><Icon.Pin style={{ ...sz(17) }} /></div>
                <div><div className="clbl">Address</div><div className="cval">{fullAddress || "Not available"}</div></div>
              </div>
              {phone && (
                <div className="crow">
                  <div className="cicon"><Icon.Phone style={{ ...sz(17) }} /></div>
                  <div><div className="clbl">Phone</div><div className="cval"><a href={`tel:${phone}`}>{phone}</a></div></div>
                </div>
              )}
              {email && (
                <div className="crow">
                  <div className="cicon"><Icon.Mail style={{ ...sz(17) }} /></div>
                  <div><div className="clbl">Email</div><div className="cval"><a href={`mailto:${email}`}>{email}</a></div></div>
                </div>
              )}
              <div className="crow">
                <div className="cicon"><Icon.Chef style={{ ...sz(17) }} /></div>
                <div><div className="clbl">Type</div><div className="cval">{restaurantType} · Dine-In &amp; Takeaway</div></div>
              </div>
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
        <section className="cta-sec" ref={ctaRef as React.RefObject<HTMLElement>}>
          <div className={`ctain${ctaVis ? " vis" : ""}`}>
            <div className="ctaico"><Icon.Flame style={{ ...sz(44), color:"#C8001A" }} /></div>
            <h2>Hungry? <em>Come In.</em><br />We&apos;re Ready for You.</h2>
            <p className="bp" style={{ maxWidth:460, margin:"14px auto 0", textAlign:"center" }}>
              Walk in anytime, or start your order right from your table.
            </p>
            <div className="ctabtns">
              <button className="bprim" onClick={() => navigate()} onMouseEnter={ih} onMouseLeave={il}>
                <span className="bshine" />
                <Icon.Bag style={{ ...sz(14), marginRight:7 }} />
                Start Your Order
              </button>
              {email && (
                <a href={`mailto:${email}`} className="bout2">
                  <Icon.Mail style={{ ...sz(14), marginRight:7 }} />
                  Send a Message
                </a>
              )}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="fgrid">
            <div>
              <div className="fbrand"><Icon.Flame style={{ ...sz(19), color:"#FFD500" }} />{name}</div>
              <p className="fdesc">{restaurantType} dining, crafted with care and served with warmth{city ? ` in ${city}` : ""}.</p>
            </div>
            <div>
              <div className="fh">Quick Links</div>
              <ul className="flinks">
                {([["menu","Our Menu"],["about","About Us"],["contact","Find Us"]] as const).map(([id, label]) => (
                  <li key={id}><a onClick={() => scrollTo(id)}>{label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="fh">Contact</div>
              <ul className="flinks">
                {phone && <li><a href={`tel:${phone}`}>{phone}</a></li>}
                {email && <li><a href={`mailto:${email}`}>{email}</a></li>}
                {fullAddress && <li><a>{fullAddress}</a></li>}
                {!phone && !email && !fullAddress && <li><a>Details coming soon</a></li>}
              </ul>
            </div>
          </div>
          <div className="fbot"><span>© {new Date().getFullYear()} {name}. All rights reserved.</span></div>
        </footer>

      </div>
    </>
  );
}

/* ══════════════════════════════════
   THEME CSS — same palette, redesigned system
══════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --white: #FFFFFF; --cream: #FFFBF2; --cream2: #FFF5DC; --cream3: #FFEDBA;
  --saffron: #FF9A00; --gold: #FFB700; --yellow: #FFD500;
  --crimson: #C8001A; --dark: #1C0505; --dark2: #3D0A0A;
  --body: #5A1A00; --muted: #A0522D; --border: rgba(200,0,26,.12);
  --border-soft: rgba(200,0,26,.08);
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; overflow-x: hidden; }
body { background: var(--cream); color: var(--dark); font-family: var(--font-body); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
img { display: block; max-width: 100%; }
a { text-decoration: none; color: inherit; }
button { font-family: inherit; border: none; cursor: pointer; background: none; }

@media(pointer:fine){body{cursor:none}}
.cdot { position:fixed; z-index:99999; pointer-events:none; width:6px; height:6px; background:var(--crimson); border-radius:50%; transform:translate(-50%,-50%); transition:width .15s,height .15s,background .2s; }
.cring { position:fixed; z-index:99998; pointer-events:none; width:26px; height:26px; border:1px solid rgba(200,0,26,.3); border-radius:50%; transform:translate(-50%,-50%); transition:width .25s cubic-bezier(.16,1,.3,1),height .25s cubic-bezier(.16,1,.3,1),border-color .2s; }
.cdot.cb { width:9px; height:9px; background:var(--saffron); }
.cring.cb { width:44px; height:44px; border-color:rgba(200,0,26,.16); }
@media(pointer:coarse){.cdot,.cring{display:none}}

.tbanner { position:fixed; top:0; left:0; right:0; z-index:2000; height:38px; background:linear-gradient(90deg,var(--crimson),var(--saffron)); display:flex; align-items:center; justify-content:center; gap:20px; font-size:11px; font-weight:600; letter-spacing:.4px; color:rgba(255,255,255,.95); font-family:var(--font-body); }
.tb-item { display:flex; align-items:center; gap:6px; }
.tb-item b { font-family:var(--font-mono); font-weight:600; }
.tbadge { background:rgba(255,255,255,.16); padding:3px 12px; border-radius:50px; border:1px solid rgba(255,255,255,.25); display:flex; align-items:center; }

.rbanner { position:fixed; top:38px; left:0; right:0; z-index:1999; background:rgba(200,0,26,.06); color:var(--crimson); font-size:12px; text-align:center; padding:7px 12px; font-weight:600; }

.pwrap { opacity:0; transform:translateY(8px); transition:opacity 1s cubic-bezier(.16,1,.3,1),transform 1s cubic-bezier(.16,1,.3,1); }
.pwrap.in { opacity:1; transform:translateY(0); }

nav { position:fixed; left:0; right:0; z-index:1000; height:72px; padding:0 5vw; display:flex; align-items:center; justify-content:space-between; background:rgba(255,251,242,.78); backdrop-filter:blur(24px) saturate(160%); border-bottom:1px solid var(--border-soft); transition:background .5s,box-shadow .5s; }
nav.sc { background:rgba(255,251,242,.96); box-shadow:0 1px 0 var(--border),0 8px 40px rgba(200,0,26,.05); }
.nbrand { display:flex; align-items:center; gap:12px; }
.nemblem { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(200,0,26,.06); transition:background .3s; }
.nbrand:hover .nemblem { background:rgba(200,0,26,.1); }
.nname { font-family:var(--font-body); font-size:18px; font-weight:800; letter-spacing:-.3px; color:var(--dark); display:block; line-height:1.15; }
.ntag { font-family:var(--font-mono); font-size:9.5px; letter-spacing:1.2px; text-transform:uppercase; color:var(--muted); font-weight:500; display:block; margin-top:3px; }
.nlinks { display:flex; gap:32px; list-style:none; }
.nlinks a { font-size:13px; color:var(--body); font-weight:500; transition:color .25s; position:relative; cursor:pointer; padding-bottom:4px; }
.nlinks a::after { content:''; position:absolute; bottom:0; left:0; width:0; height:1.5px; background:var(--crimson); transition:width .35s cubic-bezier(.16,1,.3,1); }
.nlinks a:hover { color:var(--crimson); }
.nlinks a:hover::after { width:100%; }
.ncta { position:relative; overflow:hidden; background:var(--crimson); color:rgba(255,255,255,.97); padding:11px 24px; border-radius:8px; font-size:13px; font-weight:600; display:flex; align-items:center; transition:transform .3s cubic-bezier(.16,1,.3,1),box-shadow .3s; box-shadow:0 4px 20px rgba(200,0,26,.25); }
.ncta:hover { transform:translateY(-1px); box-shadow:0 8px 32px rgba(200,0,26,.38); }
.nshine { position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent); transform:translateX(-100%); transition:transform .6s; }
.ncta:hover .nshine { transform:translateX(100%); }
.mhbg { display:none; color:var(--crimson); padding:4px; align-items:center; }
.mmenu { position:fixed; left:0; right:0; z-index:900; background:rgba(255,251,242,.98); backdrop-filter:blur(28px); border-bottom:1px solid var(--border); padding:22px 5vw 30px; transform:translateY(-8px); opacity:0; pointer-events:none; transition:transform .4s cubic-bezier(.16,1,.3,1),opacity .4s; }
.mmenu.on { transform:translateY(0); opacity:1; pointer-events:all; }
.mmenu a { display:block; padding:14px 0; font-size:14px; color:var(--body); border-bottom:1px solid var(--border); font-weight:500; cursor:pointer; transition:color .2s; }
.mmenu a:hover { color:var(--crimson); }
.mmcta { width:100%; margin-top:18px; padding:14px; background:var(--crimson); color:#fff; border-radius:9px; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center; }

/* ── HERO ── */
.hero { position:relative; min-height:100svh; overflow:hidden; display:grid; grid-template-columns:1.05fr 1fr; background:var(--cream); }
.hphoto { position:relative; overflow:hidden; background:#100202; min-height:100svh; display:flex; align-items:flex-end; padding:44px; }
.hslide { position:absolute; inset:0; opacity:0; transition:opacity 1.6s cubic-bezier(.4,0,.2,1); z-index:1; }
.hslide.on { opacity:1; z-index:2; }
.hslide.out { opacity:0; z-index:1; }
.hslide img { width:100%; height:100%; object-fit:cover; transform:scale(1.04); transition:transform 8s ease; }
.hslide.on img { transform:scale(1); }
.hphoto::after { content:''; position:absolute; inset:0; z-index:3; pointer-events:none; background:linear-gradient(to bottom,rgba(10,4,4,.12) 0%,transparent 30%,rgba(10,4,4,.42) 100%); }
.hsdots { position:absolute; top:28px; left:28px; z-index:10; display:flex; gap:6px; }
.hsdot { width:6px; height:6px; border-radius:50%; border:1px solid rgba(255,255,255,.35); background:transparent; cursor:pointer; transition:all .4s; padding:0; }
.hsdot.on { background:#fff; width:20px; border-radius:3px; border-color:transparent; }

/* Signature ticket card */
.tk { position:relative; z-index:6; width:min(100%,340px); background:rgba(28,5,5,.72); backdrop-filter:blur(18px); border:1px solid rgba(255,255,255,.14); border-radius:16px; padding:20px 22px 18px; box-shadow:0 24px 60px rgba(0,0,0,.4); opacity:0; transform:translateY(18px); transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1); }
.tk.show { opacity:1; transform:translateY(0); }
.tk-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
.tk-eyebrow { font-family:var(--font-mono); font-size:9.5px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,235,180,.5); font-weight:500; }
.tk-stamp { font-family:var(--font-display); font-style:italic; font-size:13px; color:var(--yellow); border:1px solid rgba(255,213,0,.4); padding:2px 12px; border-radius:50px; transform:rotate(-4deg); display:inline-block; }
.tk-row { display:flex; align-items:baseline; justify-content:space-between; padding:7px 0; gap:12px; }
.tk-label { font-family:var(--font-mono); font-size:10px; letter-spacing:1px; text-transform:uppercase; color:rgba(255,235,180,.4); flex-shrink:0; }
.tk-value { font-family:var(--font-mono); font-size:13px; color:#fff; font-weight:500; text-align:right; }
.tk-value-name { font-family:var(--font-body); font-style:normal; font-size:15px; font-weight:800; letter-spacing:-.2px; }
.tk-punch { height:0; border-top:1.5px dashed rgba(255,235,180,.22); margin:8px 0; position:relative; }
.tk-punch::before, .tk-punch::after { content:''; position:absolute; top:-7px; width:14px; height:14px; border-radius:50%; background:var(--cream); }
.tk-punch::before { left:-34px; }
.tk-punch::after { right:-34px; }
.tk-foot { font-size:11px; color:rgba(255,235,180,.4); margin-top:10px; letter-spacing:.2px; }

.hcont { display:flex; flex-direction:column; justify-content:center; padding:clamp(96px,10vw,130px) clamp(40px,5.5vw,76px) 68px; position:relative; z-index:5; background:var(--cream); }
.hcont::before { content:''; position:absolute; inset:0; pointer-events:none; background:radial-gradient(ellipse 65% 45% at 92% 12%,rgba(255,210,0,.055),transparent 55%); }
.heyebrow { display:inline-flex; align-items:center; gap:9px; font-family:var(--font-mono); font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:var(--crimson); font-weight:500; margin-bottom:26px; width:fit-content; opacity:0; transform:translateY(10px); transition:opacity .7s,transform .7s; }
.heyebrow.show { opacity:1; transform:translateY(0); }
.heyebrow-dot { width:6px; height:6px; background:#22c55e; border-radius:50%; animation:gp 1.4s ease-in-out infinite; flex-shrink:0; }
@keyframes gp { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.45)}50%{box-shadow:0 0 0 5px rgba(34,197,94,0)} }
.htitle { font-family:var(--font-display); font-size:clamp(42px,5.4vw,76px); font-weight:400; line-height:.98; letter-spacing:-1.5px; margin-bottom:24px; }
.hl { display:block; color:var(--dark); font-weight:300; transform:translateY(44px); opacity:0; transition:transform 1s cubic-bezier(.16,1,.3,1),opacity 1s; }
.hl.accent { font-style:normal; font-weight:800; color:var(--dark); letter-spacing:-1.5px; position:relative; }
.hl.accent::after { content:''; position:absolute; left:2px; right:2px; bottom:.08em; height:.18em; background:linear-gradient(90deg,var(--crimson),var(--saffron)); z-index:-1; opacity:.28; border-radius:2px; }
.hl.show { transform:translateY(0); opacity:1; }
.hsub { font-size:16px; color:var(--body); line-height:1.75; margin-bottom:34px; max-width:440px; font-weight:400; opacity:0; transform:translateY(14px); transition:opacity .85s,transform .85s; }
.hsub.show { opacity:1; transform:translateY(0); }
.hbtns { display:flex; flex-wrap:wrap; gap:12px; margin-bottom:28px; opacity:0; transform:translateY(14px); transition:opacity .85s,transform .85s; }
.hbtns.show { opacity:1; transform:translateY(0); }
.htags { display:flex; flex-wrap:wrap; gap:18px; opacity:0; transform:translateY(12px); transition:opacity .85s,transform .85s; }
.htags.show { opacity:1; transform:translateY(0); }
.htags span { font-size:11.5px; color:var(--muted); font-weight:500; display:flex; align-items:center; }

.mqred { overflow:hidden; padding:14px 0; background:var(--dark2); border-top:1px solid rgba(200,0,26,.25); border-bottom:1px solid rgba(200,0,26,.25); }
.mqt { display:flex; width:max-content; animation:mqs 32s linear infinite; user-select:none; }
.mqt:hover { animation-play-state:paused; }
@keyframes mqs { from{transform:translateX(0)} to{transform:translateX(-50%)} }
.mqi { display:inline-flex; align-items:center; padding:0 22px; font-family:var(--font-mono); font-size:10.5px; letter-spacing:1.5px; text-transform:uppercase; font-weight:500; white-space:nowrap; color:rgba(255,235,180,.75); }

section { padding:100px 5vw; position:relative; }
.slbl { font-family:var(--font-mono); font-size:10.5px; letter-spacing:2px; text-transform:uppercase; color:var(--crimson); margin-bottom:18px; font-weight:600; display:flex; align-items:center; gap:14px; }
.slbl::before { content:''; width:24px; height:1.5px; background:var(--crimson); }
h2 { font-family:var(--font-display); font-size:clamp(30px,4.2vw,52px); font-weight:400; line-height:1.1; margin-bottom:20px; color:var(--dark); letter-spacing:-.5px; }
h2 em { font-style:italic; color:var(--crimson); font-weight:500; }
.bp { font-size:15.5px; color:var(--body); line-height:1.85; max-width:520px; margin-bottom:12px; font-weight:400; }

.about-sec { background:var(--cream2); }
.agrid { display:grid; grid-template-columns:1fr 1.1fr; gap:80px; align-items:center; }
.aimg-wrap { position:relative; opacity:0; transform:translateX(-24px); transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1); }
.atext { opacity:0; transform:translateX(24px); transition:opacity .9s cubic-bezier(.16,1,.3,1) .16s,transform .9s cubic-bezier(.16,1,.3,1) .16s; }
.agrid.vis .aimg-wrap,.agrid.vis .atext { opacity:1; transform:translateX(0); }
.aimg { position:relative; border-radius:6px; overflow:hidden; aspect-ratio:4/5; box-shadow:0 32px 80px rgba(200,0,26,.14); }
.aimg img { width:100%; height:100%; object-fit:cover; transition:transform 8s ease; }
.aimg:hover img { transform:scale(1.03); }
.abadge { position:absolute; bottom:-14px; right:18px; background:var(--dark2); color:var(--gold); font-family:var(--font-mono); font-size:10.5px; font-weight:500; letter-spacing:1px; padding:9px 18px; border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,.25); border:1px solid rgba(255,183,0,.25); }
.afacts { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:28px; }
.af { display:flex; align-items:flex-start; gap:12px; padding:16px; background:var(--white); border:1px solid var(--border); border-radius:10px; cursor:default; transition:border-color .3s,transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s; }
.af:hover { border-color:rgba(200,0,26,.24); transform:translateY(-4px); box-shadow:0 12px 32px rgba(200,0,26,.08); }
.aficon { color:var(--crimson); flex-shrink:0; margin-top:1px; opacity:.85; }
.aft { font-size:13px; font-weight:600; margin-bottom:3px; color:var(--dark); }
.afd { font-size:11.5px; color:var(--body); line-height:1.55; font-weight:400; }

.strip { overflow:hidden; padding:26px 0; background:var(--white); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
.sttrack { display:flex; gap:14px; padding:4px 10px; width:max-content; animation:mqs 38s linear infinite; }
.sttrack:hover { animation-play-state:paused; }
.sti { flex-shrink:0; border-radius:10px; overflow:hidden; position:relative; width:clamp(180px,25vw,290px); height:clamp(180px,20vw,244px); box-shadow:0 8px 28px rgba(200,0,26,.06); transition:transform .5s cubic-bezier(.16,1,.3,1),box-shadow .5s; }
.sti:hover { transform:scale(1.03); box-shadow:0 20px 50px rgba(200,0,26,.14); }
.sti img { width:100%; height:100%; object-fit:cover; transition:transform 6s ease; }
.sti:hover img { transform:scale(1.06); }
.stov { position:absolute; inset:0; background:linear-gradient(180deg,transparent 48%,rgba(28,5,5,.6)); }
.stlbl { position:absolute; bottom:13px; left:15px; font-family:var(--font-display); font-size:17px; font-weight:400; color:rgba(255,255,255,.94); font-style:italic; }

/* ── Why-us: ticket-stub cards ── */
.menu-sec { background:var(--cream); }
.mgrid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:34px; }
.mc { border-radius:12px; overflow:hidden; background:var(--white); border:1px solid var(--border); transition:transform .5s cubic-bezier(.16,1,.3,1),box-shadow .5s,opacity .7s; box-shadow:0 4px 16px rgba(200,0,26,.04); opacity:0; transform:translateY(24px); }
.mgrid.vis .mc { opacity:1; transform:translateY(0); }
.mc:hover { transform:translateY(-6px) !important; box-shadow:0 24px 54px rgba(200,0,26,.1); border-color:rgba(200,0,26,.2); }
.mc-tear { height:1.5px; border-top:1.5px dashed rgba(200,0,26,.18); margin:0 24px; position:relative; top:24px; }
.mc-body { padding:40px 24px 26px; }
.mcicon-wrap { width:48px; height:48px; border-radius:10px; background:rgba(200,0,26,.06); display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
.mcname { font-family:var(--font-display); font-size:19px; font-weight:500; margin-bottom:7px; color:var(--dark); }
.mcdesc { font-size:13px; color:var(--body); line-height:1.65; font-weight:400; }

.pxwrap { height:clamp(300px,44vw,460px); overflow:hidden; position:relative; }
.pxwrap img { width:100%; height:135%; object-fit:cover; will-change:transform; transform:translateY(-15%); }
.pxov { position:absolute; inset:0; z-index:1; background:linear-gradient(135deg,rgba(14,3,3,.64),rgba(28,8,0,.56)); }
.pxcont { position:absolute; inset:0; z-index:2; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:0 5vw; }
.pxcont blockquote { font-family:var(--font-display); font-size:clamp(22px,3.6vw,46px); font-weight:400; font-style:italic; color:rgba(255,255,255,.94); line-height:1.4; max-width:760px; }
.pxcont cite { display:block; margin-top:18px; font-family:var(--font-mono); font-size:10.5px; letter-spacing:2px; text-transform:uppercase; color:var(--gold); font-style:normal; font-weight:500; }

.contact-sec { background:var(--cream); }
.cgrid { display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:start; margin-top:34px; }
.ccard { background:var(--white); border:1px solid var(--border); border-radius:14px; padding:30px; box-shadow:0 4px 16px rgba(200,0,26,.04); }
.ccardtitle { font-family:var(--font-mono); font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--crimson); font-weight:600; margin-bottom:22px; padding-bottom:14px; border-bottom:1px solid var(--border); }
.mapf { border-radius:14px; overflow:hidden; height:340px; position:relative; border:1px solid var(--border); }
.mapf img { width:100%; height:100%; object-fit:cover; opacity:.4; }
.mapo { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:9px; padding:0 24px; text-align:center; }
.mapo strong { font-family:var(--font-display); font-size:16px; font-weight:500; color:var(--dark); }
.mapo a { font-size:11.5px; letter-spacing:.5px; color:var(--crimson); background:rgba(255,255,255,.94); padding:8px 18px; border-radius:8px; border:1px solid var(--crimson); font-weight:600; transition:all .25s; display:flex; align-items:center; }
.mapo a:hover { background:var(--crimson); color:#fff; }
.crow { display:flex; align-items:flex-start; gap:14px; padding:14px 0; border-bottom:1px solid var(--border-soft); }
.crow:last-of-type { border:none; }
.cicon { color:var(--crimson); flex-shrink:0; margin-top:2px; opacity:.8; }
.clbl { font-family:var(--font-mono); font-size:9.5px; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-bottom:5px; font-weight:500; }
.cval { font-size:14.5px; color:var(--dark); font-weight:500; }
.cval a { color:var(--crimson); transition:color .2s; }
.cval a:hover { color:var(--saffron); }

.cta-sec { text-align:center; padding:110px 5vw; background:linear-gradient(160deg,var(--cream3),#FFE0A0,var(--cream3)); position:relative; overflow:hidden; }
.cta-sec::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 60% 52% at 50% 62%,rgba(200,0,26,.05),transparent 58%); }
.ctain { position:relative; z-index:1; opacity:0; transform:translateY(28px); transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1); }
.ctain.vis { opacity:1; transform:translateY(0); }
.ctaico { display:flex; justify-content:center; margin-bottom:22px; animation:flpls 3s ease-in-out infinite; }
@keyframes flpls { 0%,100%{filter:drop-shadow(0 0 6px rgba(200,0,26,.2))}50%{filter:drop-shadow(0 0 22px rgba(200,0,26,.6))} }
.ctabtns { display:flex; flex-wrap:wrap; justify-content:center; gap:14px; margin-top:38px; }

.bprim { position:relative; overflow:hidden; background:var(--crimson); color:rgba(255,255,255,.97); padding:15px 30px; border-radius:10px; font-size:13.5px; font-weight:600; transition:transform .3s cubic-bezier(.16,1,.3,1),box-shadow .3s; display:inline-flex; align-items:center; box-shadow:0 6px 24px rgba(200,0,26,.28); cursor:pointer; border:none; font-family:var(--font-body); }
.bprim:hover { transform:translateY(-2px); box-shadow:0 14px 40px rgba(200,0,26,.42); }
.bshine { position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.14),transparent); transform:translateX(-100%); transition:transform .6s; }
.bprim:hover .bshine { transform:translateX(100%); }
.bout2 { display:inline-flex; align-items:center; font-size:13.5px; font-weight:600; color:var(--crimson); border:1.5px solid var(--crimson); padding:14px 28px; border-radius:10px; transition:background .25s,color .25s; cursor:pointer; background:none; font-family:var(--font-body); }
.bout2:hover { background:var(--crimson); color:#fff; }

footer { padding:56px 5vw 28px; background:var(--dark2); }
.fgrid { display:grid; grid-template-columns:2fr 1fr 1fr; gap:48px; margin-bottom:38px; }
.fbrand { font-family:var(--font-body); font-size:21px; font-weight:800; letter-spacing:-.3px; color:var(--yellow); display:flex; align-items:center; gap:10px; margin-bottom:12px; }
.fdesc { font-size:13px; color:rgba(255,210,150,.48); line-height:1.85; max-width:260px; font-weight:400; }
.fh { font-family:var(--font-mono); font-size:9.5px; letter-spacing:2px; text-transform:uppercase; color:var(--gold); margin-bottom:16px; font-weight:600; }
.flinks { list-style:none; display:flex; flex-direction:column; gap:11px; }
.flinks li a { font-size:13px; color:rgba(255,210,150,.4); transition:color .25s; cursor:pointer; font-weight:400; }
.flinks li a:hover { color:var(--yellow); }
.fbot { padding-top:26px; border-top:1px solid rgba(255,210,150,.1); font-size:11.5px; color:rgba(255,210,150,.28); }

@media(max-width:1060px){
  .hero{grid-template-columns:1fr; min-height:auto}
  .hphoto{height:min(78vh,520px); min-height:340px; align-items:flex-end; padding:20px 16px 24px}
  .hcont{padding:36px 6vw 52px; border-top:1px solid var(--border)}
  .htitle{font-size:clamp(36px,9vw,54px)}
  .agrid{grid-template-columns:1fr}
  .cgrid{grid-template-columns:1fr}
  .fgrid{grid-template-columns:1fr 1fr}
  .nlinks,.ncta{display:none}
  .mhbg{display:flex!important}
  .tk{width:100%; max-width:340px}
}
@media(max-width:700px){
  section{padding:56px 6vw}
  .mgrid{grid-template-columns:1fr 1fr}
  .fgrid{grid-template-columns:1fr}
  nav{height:64px; padding:0 5vw}
  .heyebrow{margin-bottom:20px}
  .hbtns{gap:10px}
  .hbtns .bprim,.hbtns .bout2{flex:1 1 auto; justify-content:center}
  .htags{gap:12px 18px}
  .mapf{height:220px}
  .ccard{padding:22px}
}
@media(max-width:480px){
  .mgrid{grid-template-columns:1fr}
  .afacts{grid-template-columns:1fr 1fr}
  .tk{padding:16px 16px 14px; max-width:100%}
  .tk-punch::before{left:-24px; width:12px; height:12px; top:-6px} .tk-punch::after{right:-24px; width:12px; height:12px; top:-6px}
  .tk-row{padding:6px 0}
  .htitle{font-size:clamp(32px,10vw,44px)}
  .hsub{font-size:14.5px}
  .htags span{font-size:11px}
  section{padding:48px 6vw}
  .cta-sec{padding:64px 6vw}
}
@media(max-width:360px){
  .tk-eyebrow{font-size:8.5px}
  .tk-stamp{font-size:11px; padding:2px 10px}
  .hphoto{height:min(70vh,440px); min-height:300px}
}
`;