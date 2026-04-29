"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pos-backend-s380.onrender.com";

const SLIDES = [
  { src: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1400&q=95&auto=format&fit=crop", label: "Signature Butter Chicken", sub: "Slow-cooked, 72 hours" },
  { src: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1400&q=95&auto=format&fit=crop", label: "Seekh Kebab Platter", sub: "Clay-oven perfection" },
  { src: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1400&q=95&auto=format&fit=crop", label: "Dum Biryani", sub: "Aged Basmati · Sealed vessel" },
  { src: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=1400&q=95&auto=format&fit=crop", label: "Paneer Tikka", sub: "House-marinated overnight" },
];

/* ── SVG Icons ── */
const IUser  = ({s=18,...p}: {s?:number,[k:string]:any}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;
const IPhone = ({s=18,...p}: {s?:number,[k:string]:any}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>;
const IArrow = ({s=18,...p}: {s?:number,[k:string]:any}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const ICheck = ({s=13,...p}: {s?:number,[k:string]:any}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>;
const IStar  = ({s=13,...p}: {s?:number,[k:string]:any}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>;
const IFlame = ({s=20,...p}: {s?:number,[k:string]:any}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.11-3.66 5.65-2.7 8.87.06.22.12.44.12.67 0 .44-.36.82-.8.82-.42 0-.72-.27-.83-.65-.03-.1-.06-.2-.08-.31-1.14 1.6-1.33 3.75-.55 5.56.53 1.22 1.39 2.28 2.45 3.04.98.71 2.09 1.21 3.26 1.41.33.06.66.1.99.1 1.23.04 2.44-.26 3.47-.86 2.01-1.14 3.36-3.28 3.36-5.68 0-1.32-.43-2.57-1.14-3.6z"/></svg>;
const IShield= ({s=13,...p}: {s?:number,[k:string]:any}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>;
const IClock = ({s=13,...p}: {s?:number,[k:string]:any}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>;
const IMap   = ({s=13,...p}: {s?:number,[k:string]:any}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>;
const IDiamond=({s=10,...p}: {s?:number,[k:string]:any}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M19 3H5L2 9l10 12L22 9l-3-6zm-8.5 0h5L17 7H7l1.5-4zm-5.06 6h3.56l2 8-5.56-8zM12 18l-2.5-9h5L12 18zm3.5-1l2-8h3.56l-5.56 8z"/></svg>;

/* ── Cinematic Particle Canvas ── */
function ParticleCanvas({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement> }) {
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    let W: number, H: number, raf: number, frame = 0;
    const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
    resize(); window.addEventListener("resize", resize, { passive: true });
    const pts = Array.from({ length: 28 }, () => ({
      x: Math.random(), y: Math.random(),
      r: .5 + Math.random() * 1.6,
      vy: .00007 + Math.random() * .00013,
      vx: (Math.random() - .5) * .00005,
      a: .04 + Math.random() * .09,
      w: Math.random() * Math.PI * 2,
      ws: .003 + Math.random() * .008,
      c: [
        "rgba(200,0,26,A)",
        "rgba(255,154,0,A)",
        "rgba(255,183,0,A)",
        "rgba(255,213,0,A)",
      ][Math.floor(Math.random() * 4)],
    }));
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.w += p.ws; p.y = (p.y + p.vy) % 1;
        p.x = ((p.x + p.vx + Math.sin(p.w) * .00007) % 1 + 1) % 1;
        const px = p.x * W, py = p.y * H, R = p.r * 10;
        const flicker = .8 + .2 * Math.sin(frame * .05 + p.w);
        const g = ctx.createRadialGradient(px, py, 0, px, py, R);
        const aa = p.a * flicker;
        g.addColorStop(0, p.c.replace("A", aa.toFixed(3)));
        g.addColorStop(.45, p.c.replace("A", (aa * .28).toFixed(3)));
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [canvasRef]);
  return null;
}

export default function CustomerDetails() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{msg:string,type:string} | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(SLIDES.length - 1);
  const [mounted, setMounted] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [mobileTouched, setMobileTouched] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) setQrToken(token);
    else showToast("QR token required. Please scan again.");
    requestAnimationFrame(() => setMounted(true));
    const iv = setInterval(() => {
      setSlideIdx(p => { setPrevIdx(p); return (p + 1) % SLIDES.length; });
    }, 6000);
    return () => clearInterval(iv);
  }, []);

  const showToast = useCallback((msg: string, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3800);
  }, []);

  const handleSubmit = async () => {
    setNameTouched(true); setMobileTouched(true);
    const trimName = name.trim(), trimMobile = mobile.trim();
    if (!trimName || !trimMobile) { showToast("Please enter your name and mobile number"); return; }
    if (!/^\d{10}$/.test(trimMobile)) { showToast("Mobile must be exactly 10 digits"); return; }
    if (!qrToken) { showToast("QR token missing. Please scan again."); return; }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/customer/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimName, phone: trimMobile, qrToken }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || "Login failed");
      const token = data.token ?? data.data?.token;
      const customerId = data.customer?.id ?? data.data?.customerId;
      const tableNumber = data.table?.table_number ?? data.data?.tableNumber ?? data.data?.table?.table_number;
      if (token) localStorage.setItem("customerJWT", token);
      if (customerId) localStorage.setItem("customerId", String(customerId));
      if (tableNumber) localStorage.setItem("tableNumber", String(tableNumber));
      localStorage.setItem("customerName", trimName);
      localStorage.setItem("customerMobile", trimMobile);
      showToast("Welcome! Entering your experience…", "success");
      setTimeout(() => router.push("/customer/menu"), 1600);
    } catch (err: any) {
      showToast(err?.message || "Server error. Try again.");
      setLoading(false);
    }
  };

  const nameValid = name.trim().length > 0;
  const mobileValid = /^\d{10}$/.test(mobile);
  const bothValid = nameValid && mobileValid;

  return (
    <>
      <style>{CSS}</style>
      <div className={`r${mounted ? " in" : ""}`}>

        {/* ═══ LEFT: Cinematic visual panel ═══ */}
        <aside className="lp">
          {SLIDES.map((sl, i) => (
            <div key={sl.src} className={`sl${i === slideIdx ? " on" : i === prevIdx ? " out" : ""}`}>
              <img src={sl.src} alt={sl.label} />
            </div>
          ))}

          <div className="ov-top" />
          <div className="ov-bot" />
          <div className="ov-vign" />
          <canvas ref={canvasRef} className="cv" />
          <ParticleCanvas canvasRef={canvasRef} />

          <div className="live-badge">
            <span className="live-dot" />
            <span>Open Now</span>
            <div className="live-sep" />
            <span>200+ Orders Today</span>
          </div>

          <div className="hcounter">
            <span className="hc-cur">{String(slideIdx + 1).padStart(2, "0")}</span>
            <span className="hc-sep" />
            <span className="hc-tot">{String(SLIDES.length).padStart(2, "0")}</span>
          </div>

          <div className="brand-panel">
            <div className="logo-ring">
              <div className="logo-inner"><IFlame s={22} /></div>
            </div>

            <div className="brand-name">Spice<br /><em>Delight</em></div>
            <div className="brand-city">
              <span className="city-dot" />
              Bangalore · North Indian Heritage Cuisine
            </div>

            <div className="dish-reveal">
              <div className="dish-line" />
              <div className="dish-inner">
                <div className="dish-klass">Now Featuring</div>
                <div className="dish-title" key={slideIdx}>{SLIDES[slideIdx].label}</div>
                <div className="dish-sub">{SLIDES[slideIdx].sub}</div>
              </div>
            </div>

            <div className="step-block">
              <div className="step-meta">Guest Details — Step 1 of 2</div>
              <div className="step-track">
                <div className="step-fill" />
                <div className="step-node on" />
                <div className="step-node" />
              </div>
            </div>

            <div className="rating-row">
              <div className="stars">{[0,1,2,3,4].map(i => <IStar key={i} s={11} />)}</div>
              <span className="rating-val">4.8</span>
              <span className="rating-cnt">· 2,400+ Reviews</span>
            </div>
          </div>

          <div className="mob-brand">
            <div className="mob-logo"><IFlame s={15} /></div>
            <div className="mob-info">
              <strong>Spice Delight</strong>
              <span>{SLIDES[slideIdx].label}</span>
            </div>
          </div>

          <div className="hsdots">
            {SLIDES.map((_, i) => (
              <button key={i} className={`hsdot${i === slideIdx ? " on" : ""}`}
                onClick={() => { setPrevIdx(slideIdx); setSlideIdx(i); }} />
            ))}
          </div>
        </aside>

        {/* ═══ RIGHT: Form panel ═══ */}
        <main className="rp">
          <div className="rp-ambient" />

          <div className="form-shell">

            <div className={`scan-pill${qrToken ? " verified" : " unverified"}`}>
              <span className={`scan-dot${qrToken ? " ok" : " warn"}`} />
              {qrToken ? (
                <><IShield s={11} /><span>Table Verified · QR Authenticated</span></>
              ) : (
                <span>⚠ QR Token Required</span>
              )}
            </div>

            <div className="form-mark">
              <div className="fm-icon"><IFlame s={16} /></div>
              <div className="fm-text">
                <span className="fm-rest">Spice Delight</span>
                <span className="fm-tag">Guest Registration</span>
              </div>
            </div>

            <div className="form-heading">
              <div className="fh-eyebrow">Welcome, Honoured Guest</div>
              <h1 className="fh-title">Your<br /><em>Details</em></h1>
              <p className="fh-body">Enter your name and mobile to unlock your royal dining experience at Bangalore's finest.</p>
            </div>

            <div className="orn-div">
              <div className="od-line" />
              <div className="od-gem"><IDiamond s={8} /></div>
              <div className="od-line" />
            </div>

            <div className="fields">

              <div className="field-group">
                <label className="field-lbl">Full Name</label>
                <div className={`field-box${focused === "name" ? " focus" : ""}${nameTouched && nameValid ? " valid" : ""}${nameTouched && !nameValid ? " err" : ""}`}>
                  <div className="field-ico"><IUser s={16} /></div>
                  <input type="text" className="field-inp" placeholder="Your full name"
                    value={name} onChange={e => setName(e.target.value)}
                    onFocus={() => setFocused("name")}
                    onBlur={() => { setFocused(null); setNameTouched(true); }} />
                  <div className="field-underline" />
                  {nameTouched && nameValid && (
                    <div className="field-ok"><ICheck s={10} /></div>
                  )}
                </div>
              </div>

              <div className="field-group">
                <label className="field-lbl">Mobile Number</label>
                <div className={`field-box${focused === "mobile" ? " focus" : ""}${mobileTouched && mobileValid ? " valid" : ""}${mobileTouched && !mobileValid ? " err" : ""}`}>
                  <div className="field-ico"><IPhone s={16} /></div>
                  <input type="tel" className="field-inp" placeholder="10-digit mobile number"
                    value={mobile} maxLength={10}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, ""))}
                    onFocus={() => setFocused("mobile")}
                    onBlur={() => { setFocused(null); setMobileTouched(true); }} />
                  <div className="field-underline" />
                  {mobileTouched && mobile.length > 0 && !mobileValid && (
                    <div className="field-char">{mobile.length}/10</div>
                  )}
                  {mobileTouched && mobileValid && (
                    <div className="field-ok"><ICheck s={10} /></div>
                  )}
                </div>
              </div>
            </div>

            {!loading ? (
              <button className={`cta${bothValid ? " ready" : ""}`} onClick={handleSubmit}>
                <span className="cta-shine" />
                <span className="cta-txt">Enter Spice Delight</span>
                <span className="cta-arrow"><IArrow s={15} /></span>
              </button>
            ) : (
              <div className="cta-load">
                <div className="load-ring" />
                <span>Preparing your experience…</span>
              </div>
            )}

            <div className="trust-bar">
              <div className="trust-item"><IShield s={11} /><span>Secure</span></div>
              <div className="trust-sep" />
              <div className="trust-item"><IMap s={11} /><span>Table Verified</span></div>
              <div className="trust-sep" />
              <div className="trust-item"><IClock s={11} /><span>Open till 11 PM</span></div>
            </div>

            <div className="form-marquee">
              <div className="fm-track">
                {[...Array(2)].flatMap((_, li) =>
                  ["Butter Chicken","Dum Biryani","Seekh Kebab","Dal Makhani","Paneer Tikka","Gulab Jamun"].map((t, i) => (
                    <span key={`${li}-${i}`} className="fm-item">
                      <IDiamond s={7} />{t}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {toast && (
        <div className={`toast${toast.type === "success" ? " t-ok" : " t-err"}`}>
          <div className="toast-ico">
            {toast.type === "success"
              ? <ICheck s={12} />
              : <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>}
          </div>
          <span>{toast.msg}</span>
        </div>
      )}
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600;700&display=swap');

.r {
  --white:   #FFFFFF;
  --cream:   #FFFBF2;
  --cream2:  #FFF5DC;
  --cream3:  #FFEDBA;
  --saffron: #FF9A00;
  --gold:    #FFB700;
  --yellow:  #FFD500;
  --crimson: #C8001A;
  --dark:    #1C0505;
  --dark2:   #3D0A0A;
  --body:    #5A1A00;
  --muted:   #A0522D;
  --border:      rgba(200,0,26,.1);
  --border-soft: rgba(200,0,26,.07);
  --glow:        rgba(200,0,26,.28);
  --success: #16A34A;
  --error:   #DC2626;
}

*,*::before,*::after { box-sizing:border-box; margin:0; padding:0 }
html,body { height:100%; overflow-x:hidden }

.r {
  font-family:'Jost',system-ui,sans-serif;
  min-height:100vh; display:flex; flex-direction:column;
  background:var(--cream); color:var(--dark);
  opacity:0; transform:translateY(8px);
  transition:opacity .7s ease, transform .7s ease;
}
.r.in { opacity:1; transform:none }
@media(min-width:960px) { .r { flex-direction:row } }

.lp {
  position:relative; overflow:hidden; background:#2A0606;
  height:260px; flex-shrink:0;
}
@media(min-width:960px) { .lp { width:46%; height:100vh; position:sticky; top:0 } }

.sl { position:absolute; inset:0; opacity:0; z-index:1; }
.sl.on  { opacity:1; z-index:2; }
.sl.out { opacity:0; z-index:1; }
.sl img {
  width:100%; height:100%; object-fit:cover;
  transform:scale(1.06); transition:opacity 1.6s cubic-bezier(.4,0,.2,1), transform 9s ease;
}
.sl.on img { transform:scale(1); opacity:1; }
.sl.out img { opacity:0; }

.ov-top  { position:absolute; inset:0; z-index:3; pointer-events:none;
  background:linear-gradient(160deg, rgba(16,2,2,.52) 0%, rgba(16,2,2,.22) 42%, transparent 78%) }
.ov-bot  { position:absolute; inset:0; z-index:3; pointer-events:none;
  background:linear-gradient(to top, rgba(10,2,2,.72) 0%, rgba(10,2,2,.2) 40%, transparent 65%) }
.ov-vign { position:absolute; inset:0; z-index:3; pointer-events:none;
  background:radial-gradient(ellipse at center, transparent 40%, rgba(10,2,2,.28) 100%) }
.cv { position:absolute; inset:0; z-index:4; pointer-events:none; opacity:.35 }

.live-badge {
  position:absolute; top:18px; left:18px; z-index:10;
  display:flex; align-items:center; gap:7px;
  background:rgba(28,5,5,.55); border:1px solid rgba(200,0,26,.2);
  padding:6px 14px; border-radius:2px;
  font-family:'Jost',sans-serif; font-size:9px; font-weight:600;
  letter-spacing:2px; text-transform:uppercase; color:rgba(255,154,0,.7);
  backdrop-filter:blur(16px);
}
.live-dot {
  width:6px; height:6px; border-radius:50%; background:#4ADE80; flex-shrink:0;
  animation:lPulse 1.4s ease-in-out infinite;
}
@keyframes lPulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.5)} 60%{box-shadow:0 0 0 5px rgba(74,222,128,0)} }
.live-sep { width:1px; height:10px; background:rgba(200,0,26,.25) }

.hcounter {
  position:absolute; top:22px; right:18px; z-index:10;
  display:flex; align-items:baseline; gap:8px;
}
.hc-cur { font-family:'Cormorant Garamond',serif; font-size:36px; font-weight:300; color:rgba(255,255,255,.88); line-height:1; letter-spacing:-1px }
.hc-sep { width:22px; height:1px; background:rgba(255,255,255,.2); margin-bottom:7px }
.hc-tot { font-size:10px; color:rgba(255,255,255,.25); font-weight:500; letter-spacing:1.5px }

.brand-panel {
  display:none;
  position:absolute; inset:0; z-index:5;
  padding:clamp(32px,4vw,52px); padding-top:0;
  flex-direction:column; justify-content:flex-end;
}
@media(min-width:960px) { .brand-panel { display:flex } }

.logo-ring {
  width:50px; height:50px; border-radius:50%;
  border:1.5px solid rgba(200,0,26,.35);
  display:flex; align-items:center; justify-content:center;
  margin-bottom:16px; position:relative;
}
.logo-inner {
  width:38px; height:38px; border-radius:50%;
  background:linear-gradient(135deg, var(--crimson), var(--saffron));
  display:flex; align-items:center; justify-content:center;
  color:#fff; box-shadow:0 4px 18px rgba(200,0,26,.4);
}

.brand-name {
  font-family:'Cormorant Garamond',serif;
  font-size:clamp(40px,4.5vw,62px);
  color:#fff; line-height:.88; margin-bottom:10px; font-weight:600;
}
.brand-name em {
  display:block; font-style:italic; font-weight:400;
  background:linear-gradient(90deg, var(--crimson), var(--saffron), var(--gold));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}

.brand-city {
  display:flex; align-items:center; gap:8px;
  font-size:9px; letter-spacing:2.5px; text-transform:uppercase;
  color:rgba(255,255,255,.28); font-weight:500; margin-bottom:26px;
}
.city-dot { width:5px; height:5px; border-radius:50%; background:var(--crimson); flex-shrink:0 }

.dish-reveal { display:flex; gap:14px; margin-bottom:22px }
.dish-line { width:2px; background:linear-gradient(to bottom, transparent, var(--crimson), var(--saffron), transparent); border-radius:2px; flex-shrink:0 }
.dish-inner { padding:2px 0 }
.dish-klass {
  font-size:8px; letter-spacing:2.5px; text-transform:uppercase;
  color:rgba(255,154,0,.45); font-weight:600; margin-bottom:5px; font-family:'Jost',sans-serif;
}
.dish-title {
  font-family:'Cormorant Garamond',serif;
  font-size:18px; color:rgba(255,255,255,.72); margin-bottom:3px; font-weight:500;
  animation:fadeSlide .5s ease both;
}
.dish-sub { font-size:10px; color:rgba(255,255,255,.28); font-weight:400; letter-spacing:.4px }
@keyframes fadeSlide { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

.step-block { margin-bottom:18px }
.step-meta {
  font-size:8px; letter-spacing:2px; text-transform:uppercase;
  color:rgba(255,154,0,.35); font-weight:600; margin-bottom:10px; font-family:'Jost',sans-serif;
}
.step-track {
  height:2px; background:rgba(200,0,26,.14); border-radius:2px; position:relative;
}
.step-fill {
  position:absolute; left:0; top:0; height:100%; width:50%;
  background:linear-gradient(90deg, var(--crimson), var(--saffron));
  border-radius:2px; animation:sFill .9s .4s cubic-bezier(.16,1,.3,1) both;
}
@keyframes sFill { from{width:0} to{width:50%} }
.step-node {
  width:8px; height:8px; border-radius:50%; border:1.5px solid rgba(200,0,26,.25);
  background:rgba(200,0,26,.08); position:absolute; top:50%; transform:translateY(-50%);
}
.step-node:nth-child(2) { left:50%; transform:translate(-50%,-50%); }
.step-node:nth-child(3) { right:0; transform:translateY(-50%); }
.step-node.on { border-color:var(--crimson); background:var(--crimson); box-shadow:0 0 10px rgba(200,0,26,.5); }

.rating-row { display:flex; align-items:center; gap:6px }
.stars { display:flex; gap:2px; color:var(--gold) }
.rating-val { font-size:12px; font-weight:600; color:rgba(255,255,255,.45) }
.rating-cnt { font-size:11px; color:rgba(255,255,255,.2) }

.mob-brand {
  position:absolute; bottom:0; left:0; right:0; z-index:6;
  display:flex; align-items:center; gap:11px; padding:14px 18px;
  background:linear-gradient(to top, rgba(28,5,5,.82), transparent);
}
@media(min-width:960px) { .mob-brand { display:none } }
.mob-logo {
  width:34px; height:34px; border-radius:6px; flex-shrink:0;
  background:linear-gradient(135deg,var(--crimson),var(--saffron));
  display:flex; align-items:center; justify-content:center; color:#fff;
}
.mob-info strong { display:block; font-family:'Cormorant Garamond',serif; font-size:17px; color:#fff; font-weight:600; line-height:1.1 }
.mob-info span { font-size:9px; color:rgba(255,255,255,.3); display:block; margin-top:2px; letter-spacing:.5px }

.hsdots { position:absolute; bottom:16px; left:18px; z-index:10; display:flex; gap:6px }
@media(min-width:960px) { .hsdots { bottom:22px; left:auto; right:20px } }
.hsdot {
  width:6px; height:6px; border-radius:50%; padding:0;
  border:1px solid rgba(255,255,255,.3); background:transparent;
  cursor:pointer; transition:all .4s;
}
.hsdot.on { background:#fff; width:22px; border-radius:3px; border-color:transparent; }

.rp {
  flex:1; position:relative; overflow:hidden;
  display:flex; align-items:flex-start; justify-content:center;
  padding:clamp(28px,5vw,48px) clamp(18px,4vw,40px) 48px;
  background:var(--cream);
}
@media(min-width:960px) { .rp { align-items:center; padding:clamp(48px,6vw,80px) clamp(32px,5vw,64px) } }

.rp-ambient {
  position:absolute; inset:0; pointer-events:none; z-index:0;
  background:
    radial-gradient(ellipse 60% 45% at 90% 8%, rgba(255,183,0,.07), transparent 55%),
    radial-gradient(ellipse 50% 40% at 10% 92%, rgba(200,0,26,.04), transparent 50%),
    repeating-linear-gradient(60deg, transparent, transparent 40px, rgba(200,0,26,.012) 40px, rgba(200,0,26,.012) 80px);
}

.form-shell {
  width:100%; max-width:430px; position:relative; z-index:1;
  animation:shellIn .8s cubic-bezier(.16,1,.3,1) .05s both;
}
@keyframes shellIn { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }

.scan-pill {
  display:inline-flex; align-items:center; gap:6px;
  padding:5px 13px; border-radius:2px; margin-bottom:20px;
  font-size:8px; letter-spacing:2px; text-transform:uppercase;
  font-weight:600; font-family:'Jost',sans-serif; border:1px solid;
}
.scan-pill.verified { background:rgba(22,163,74,.06); border-color:rgba(22,163,74,.22); color:var(--success) }
.scan-pill.unverified { background:rgba(220,38,38,.06); border-color:rgba(220,38,38,.2); color:var(--error) }
.scan-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0 }
.scan-dot.ok { background:var(--success); box-shadow:0 0 6px rgba(22,163,74,.4) }
.scan-dot.warn { background:var(--error) }

.form-mark { display:flex; align-items:center; gap:10px; margin-bottom:18px }
@media(min-width:960px) { .form-mark { display:none } }
.fm-icon {
  width:36px; height:36px; border-radius:6px; flex-shrink:0;
  background:linear-gradient(135deg,var(--crimson),var(--saffron));
  display:flex; align-items:center; justify-content:center; color:#fff;
  box-shadow:0 4px 14px rgba(200,0,26,.28);
}
.fm-text { display:flex; flex-direction:column }
.fm-rest { font-family:'Cormorant Garamond',serif; font-size:17px; font-weight:600; color:var(--dark); line-height:1.1 }
.fm-tag { font-size:9px; color:var(--muted); font-weight:400; margin-top:1px; letter-spacing:.4px }

.form-heading { margin-bottom:20px }
.fh-eyebrow {
  font-size:8px; letter-spacing:4px; text-transform:uppercase;
  color:var(--crimson); font-weight:600; font-family:'Jost',sans-serif; margin-bottom:8px;
  display:flex; align-items:center; gap:12px;
}
.fh-eyebrow::before { content:''; width:22px; height:1px; background:var(--crimson); }
.fh-title {
  font-family:'Cormorant Garamond',serif;
  font-size:clamp(34px,5.5vw,52px); color:var(--dark);
  line-height:.9; margin-bottom:10px; font-weight:300; letter-spacing:-.5px;
}
.fh-title em {
  display:block; font-style:italic; font-weight:400;
  background:linear-gradient(95deg, var(--crimson), var(--saffron) 70%);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  font-size:1.12em;
}
.fh-body { font-size:13px; color:var(--body); line-height:1.9; font-weight:300; max-width:340px }

.orn-div { display:flex; align-items:center; gap:12px; margin-bottom:22px }
.od-line { flex:1; height:1px; background:linear-gradient(90deg, transparent, var(--border), transparent) }
.od-gem {
  width:22px; height:22px; border-radius:2px; transform:rotate(45deg);
  border:1px solid var(--border); display:flex; align-items:center; justify-content:center;
  color:var(--crimson); flex-shrink:0;
}
.od-gem svg { transform:rotate(-45deg) }

.fields { display:flex; flex-direction:column; gap:14px; margin-bottom:20px }
.field-group { display:flex; flex-direction:column; gap:6px }
.field-lbl {
  font-size:8px; letter-spacing:2.5px; text-transform:uppercase;
  font-weight:600; color:var(--muted); font-family:'Jost',sans-serif; padding-left:2px;
}

.field-box {
  display:flex; align-items:center; position:relative;
  background:var(--white); border:1px solid var(--border-soft);
  border-radius:2px; overflow:hidden;
  transition:border-color .22s, box-shadow .22s;
  box-shadow:0 2px 8px rgba(200,0,26,.03);
}
.field-box.focus {
  border-color:var(--crimson);
  box-shadow:0 0 0 3px rgba(200,0,26,.08), 0 2px 10px rgba(200,0,26,.06);
}
.field-box.valid { border-color:rgba(22,163,74,.4) }
.field-box.err   { border-color:rgba(220,38,38,.35) }

.field-ico {
  width:46px; display:flex; align-items:center; justify-content:center;
  flex-shrink:0; color:var(--muted); transition:color .22s;
  border-right:1px solid var(--border-soft);
}
.field-box.focus .field-ico { color:var(--crimson); border-color:rgba(200,0,26,.12) }

.field-inp {
  flex:1; padding:15px 12px; background:transparent;
  border:none; outline:none; font-family:'Jost',sans-serif;
  font-size:15px; color:var(--dark); font-weight:400; min-width:0;
}
.field-inp::placeholder { color:var(--muted); opacity:.5; font-weight:300 }

.field-underline {
  position:absolute; bottom:0; left:0; right:0; height:2px;
  background:linear-gradient(90deg, var(--crimson), var(--saffron));
  transform:scaleX(0); transition:transform .3s cubic-bezier(.4,0,.2,1); pointer-events:none;
}
.field-box.focus .field-underline { transform:scaleX(1) }

.field-ok {
  width:24px; height:24px; border-radius:2px; background:var(--success);
  display:flex; align-items:center; justify-content:center;
  color:#fff; margin-right:12px; flex-shrink:0;
  animation:okIn .25s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes okIn { from{transform:scale(0) rotate(-45deg)} to{transform:scale(1) rotate(0)} }

.field-char {
  font-size:11px; color:var(--muted); margin-right:10px; font-weight:500;
  font-family:'Jost',sans-serif; flex-shrink:0;
}

.cta {
  width:100%; padding:0 24px; height:52px;
  background:var(--crimson); color:rgba(255,255,255,.95);
  border:none; border-radius:2px;
  font-family:'Jost',sans-serif; font-size:9px;
  font-weight:700; letter-spacing:2.8px; text-transform:uppercase;
  cursor:pointer; display:flex; align-items:center; justify-content:center; gap:12px;
  position:relative; overflow:hidden; margin-bottom:18px;
  box-shadow:0 6px 24px rgba(200,0,26,.25);
  transition:transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s, filter .25s;
  filter:saturate(.65);
}
.cta.ready {
  filter:saturate(1);
  box-shadow:0 8px 32px rgba(200,0,26,.38);
}
.cta:hover { transform:translateY(-2px); box-shadow:0 14px 42px rgba(200,0,26,.42) }
.cta:active { transform:translateY(0) scale(.99) }

.cta-shine {
  position:absolute; inset:0;
  background:linear-gradient(105deg, transparent 30%, rgba(255,255,255,.18) 50%, transparent 70%);
  transform:translateX(-100%); pointer-events:none;
}
.cta:hover .cta-shine { animation:shine .7s ease forwards }
@keyframes shine { to{ transform:translateX(200%) } }

.cta-txt { position:relative; z-index:1 }
.cta-arrow { position:relative; z-index:1; display:flex; align-items:center; transition:transform .2s }
.cta:hover .cta-arrow { transform:translateX(4px) }

.cta-load {
  width:100%; height:52px; display:flex; align-items:center; justify-content:center; gap:14px;
  background:var(--crimson); border-radius:2px; margin-bottom:18px;
}
.load-ring {
  width:20px; height:20px; border-radius:50%;
  border:2px solid rgba(255,255,255,.25); border-top-color:#fff;
  animation:spin 1s linear infinite; flex-shrink:0;
}
@keyframes spin { to{transform:rotate(360deg)} }
.cta-load span {
  font-family:'Cormorant Garamond',serif; font-size:15px; font-style:italic; color:#fff;
}

.trust-bar {
  display:flex; align-items:center; justify-content:center;
  gap:0; flex-wrap:wrap; margin-bottom:16px;
}
.trust-item {
  display:flex; align-items:center; gap:5px; padding:0 12px;
  font-size:8px; letter-spacing:2px; text-transform:uppercase;
  font-weight:600; color:var(--muted); font-family:'Jost',sans-serif;
}
.trust-item svg { color:var(--crimson) }
.trust-sep { width:1px; height:12px; background:var(--border-soft); flex-shrink:0 }

.form-marquee {
  overflow:hidden; padding:10px 0;
  border-top:1px solid var(--border); margin-top:4px;
}
.fm-track {
  display:flex; width:max-content;
  animation:mqs 28s linear infinite; user-select:none;
}
@keyframes mqs { from{transform:translateX(0)} to{transform:translateX(-50%)} }
.fm-item {
  display:inline-flex; align-items:center; gap:7px; padding:0 18px;
  font-size:8px; letter-spacing:3px; text-transform:uppercase; font-weight:600;
  white-space:nowrap; color:var(--muted); font-family:'Jost',sans-serif;
}
.fm-item svg { color:var(--crimson); opacity:.6 }

.toast {
  position:fixed; top:22px; left:50%; transform:translateX(-50%);
  padding:12px 20px 12px 16px; border-radius:2px;
  font-family:'Jost',sans-serif; font-size:13px; font-weight:500;
  z-index:10000; display:flex; align-items:center; gap:10px;
  animation:toastIn .4s cubic-bezier(.16,1,.3,1);
  backdrop-filter:blur(20px); border:1px solid;
  white-space:nowrap; max-width:92vw; box-shadow:0 12px 36px rgba(0,0,0,.18);
}
.toast.t-err { background:rgba(255,251,242,.97); color:var(--crimson); border-color:rgba(200,0,26,.18) }
.toast.t-ok  { background:rgba(5,18,5,.96); color:#4ADE80; border-color:rgba(74,222,128,.2) }
.toast-ico {
  width:20px; height:20px; border-radius:2px; border:1px solid currentColor;
  display:flex; align-items:center; justify-content:center; flex-shrink:0; opacity:.8;
}
@keyframes toastIn { from{opacity:0;transform:translate(-50%,-12px)} to{opacity:1;transform:translate(-50%,0)} }

@media(max-width:959px) {
  .rp { padding-top:clamp(22px,4vw,36px) }
  .form-shell { max-width:100% }
}
`;