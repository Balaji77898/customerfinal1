"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface FoodItem {
  id: string; name: string; description: string; price: string;
  image_url: string | null; type?: "veg" | "nonveg";
}
interface Category { id: string; name: string; description: string; items: FoodItem[]; }
interface CartItem extends FoodItem { qty: number; parcel: boolean; notes: string; }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://pos-backend-s380.onrender.com";

const isSpecialCat = (name: string) =>
  name.toLowerCase().includes("today") || name.toLowerCase().includes("special");

export default function MenuPage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("Guest");
  const [tableNumber, setTableNumber]   = useState("");
  const [categories, setCategories]     = useState<Category[]>([]);
  const [todaySpecials, setTodaySpecials] = useState<FoodItem[]>([]);
  const [selectedCat, setSelectedCat]   = useState("All");
  const [search, setSearch]             = useState("");
  const [cart, setCart]                 = useState<CartItem[]>([]);
  const [toast, setToast]               = useState("");
  const [toastOn, setToastOn]           = useState(false);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [scrolled, setScrolled]         = useState(false);
  const [visible, setVisible]           = useState<Set<string>>(new Set());
  const [splVisible, setSplVisible]     = useState(false);
  const cardRefs   = useRef<Map<string, HTMLDivElement>>(new Map());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observer   = useRef<IntersectionObserver | null>(null);

  // All localStorage and window access guarded inside useEffect — SSR safe
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSplVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    observer.current?.disconnect();
    observer.current = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = (e.target as HTMLElement).dataset.cid;
          if (id) setVisible(p => new Set([...p, id]));
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });
    cardRefs.current.forEach(el => observer.current?.observe(el));
    return () => observer.current?.disconnect();
  }, [categories, selectedCat, search]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const name  = localStorage.getItem("customerName")  || "Guest";
    const table = localStorage.getItem("tableNumber")   || "";
    setCustomerName(name);
    setTableNumber(table);
    if (name && table) {
      const s = localStorage.getItem(`currentCart_${table}_${name}`);
      if (s) { try { setCart(JSON.parse(s)); } catch { /* ignore */ } }
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("customerJWT");
      if (!token) { setError("Session expired. Please login again."); setLoading(false); return; }
      try {
        const res  = await fetch(`${BASE_URL}/api/customer/menu`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json?.message || `Server error: ${res.status}`);
        const cats: Category[] =
          json.data?.categories ?? json.data?.menu ?? json.data?.items ??
          (Array.isArray(json.data) ? json.data : null) ?? json.categories ?? json.menu ?? [];

        const specialCat = cats.find(c => isSpecialCat(c.name));
        const normalCats = cats.filter(c => !isSpecialCat(c.name));

        setTodaySpecials(specialCat?.items || []);
        setCategories(normalCats);
        setSelectedCat("All");
        setError("");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unable to load menu.");
      } finally { setLoading(false); }
    })();
  }, []);

  const saveCart = (u: CartItem[]) => {
    setCart(u);
    if (typeof window === "undefined") return;
    const name  = localStorage.getItem("customerName")  || "";
    const table = localStorage.getItem("tableNumber")   || "";
    if (name && table) localStorage.setItem(`currentCart_${table}_${name}`, JSON.stringify(u));
  };

  const syncCartToBackend = async (items: CartItem[]) => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("customerJWT");
    if (!token) return;
    try {
      await fetch(`${BASE_URL}/api/customer/cart`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map(i => ({ item_id: i.id, qty: i.qty, parcel: i.parcel, notes: i.notes })) }),
      });
    } catch (err) { console.warn("Cart sync failed:", err); }
  };

  const addItem = (item: FoodItem) => {
    const u = [...cart], i = u.findIndex(x => x.id === item.id);
    if (i >= 0) u[i].qty += 1;
    else u.push({ ...item, image_url: item.image_url || null, qty: 1, parcel: false, notes: "" });
    saveCart(u); syncCartToBackend(u); showToast(`${item.name} added`);
  };

  const removeItem = (id: string) => {
    const u = cart.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0);
    saveCart(u); syncCartToBackend(u);
  };

  const getQty   = (id: string) => cart.find(i => i.id === id)?.qty || 0;
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  const filteredItems = useMemo(() => {
    const base = selectedCat === "All"
      ? categories.flatMap(c => c.items)
      : categories.find(c => c.name === selectedCat)?.items || [];
    return search ? base.filter(i => i.name.toLowerCase().includes(search.toLowerCase())) : base;
  }, [categories, selectedCat, search]);

  const allItems = useMemo(() => categories.flatMap(c => c.items).filter(i => i.image_url), [categories]);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg); setToastOn(true);
    toastTimer.current = setTimeout(() => setToastOn(false), 2200);
  };

  const regCard = (id: string, el: HTMLDivElement | null) => {
    if (el) { cardRefs.current.set(id, el); observer.current?.observe(el); }
    else cardRefs.current.delete(id);
  };

  // Suppress unused var — tableNumber kept for potential future use
  void tableNumber;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; }

        :root {
          --c:  #5D1616; --cd: #3D0D0D; --cm: #7B1F1F;
          --g:  #C8A951; --gd: #A88A3A; --gl: #E8D08E;
          --ink: #2D0A0F; --bg: #F5EDE0; --card: #FFFDF8;
          --serif: 'Cormorant Garamond', Georgia, serif;
          --sans:  'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .pg {
          min-height: 100vh; background: var(--bg);
          background-image:
            radial-gradient(ellipse 80% 40% at 50% -10%, rgba(200,169,81,.08) 0%, transparent 70%),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='.5' fill='%23C8A951' fill-opacity='.18'/%3E%3C/svg%3E");
        }

        .hdr { background: linear-gradient(160deg,#2A0606 0%,#4A1010 35%,#5D1616 65%,#3A0B0B 100%); position:sticky; top:0; z-index:50; transition:box-shadow .3s; }
        .hdr.up { box-shadow:0 8px 40px rgba(0,0,0,.5); backdrop-filter:blur(12px); }
        .gline  { height:2px; background:linear-gradient(90deg,transparent,rgba(200,169,81,.25) 20%,#C8A951 50%,rgba(200,169,81,.25) 80%,transparent); }
        .gline2 { height:1px; background:linear-gradient(90deg,transparent,rgba(200,169,81,.4),transparent); }

        .hi { max-width:1320px; margin:0 auto; padding:14px 16px; display:flex; flex-direction:column; gap:12px; }
        .hi-top { display:flex; align-items:center; justify-content:space-between; gap:10px; }
        @media(min-width:768px){ .hi{flex-direction:row;align-items:center;padding:14px 28px;gap:16px} .hi-top{flex-shrink:0} .hi-search{flex:1} .hi-btns{flex-shrink:0} }
        @media(min-width:1024px){ .hi{padding:14px 48px} }

        .w-eye  { font-family:var(--sans); font-size:9px; font-weight:600; color:rgba(200,169,81,.5); letter-spacing:.22em; text-transform:uppercase; margin-bottom:2px; }
        .w-name { font-family:var(--serif); font-weight:500; font-size:21px; color:#FFF8E1; line-height:1.1; }

        .hi-btns { display:flex; gap:8px; }
        .nbtn { display:flex; align-items:center; justify-content:center; gap:6px; padding:9px 18px; border-radius:10px; background:rgba(255,255,255,.06); border:1px solid rgba(200,169,81,.28); color:rgba(255,248,225,.9); font-family:var(--sans); font-size:13px; font-weight:600; white-space:nowrap; cursor:pointer; backdrop-filter:blur(8px); -webkit-tap-highlight-color:transparent; transition:background .25s,border-color .25s,transform .2s,box-shadow .25s; }
        @media(max-width:767px){ .nbtn{padding:9px 13px;font-size:12px} }
        .nbtn:hover  { background:rgba(255,255,255,.12); border-color:var(--g); box-shadow:0 4px 20px rgba(0,0,0,.3); transform:translateY(-1px); }
        .nbtn:active { transform:scale(.96); }
        .badge { display:inline-flex; align-items:center; justify-content:center; min-width:18px; height:18px; padding:0 4px; border-radius:9px; background:var(--g); color:var(--ink); font-family:var(--sans); font-size:10px; font-weight:700; animation:bpop .4s cubic-bezier(.34,1.56,.64,1); }
        @keyframes bpop { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }

        .hi-search { position:relative; }
        .srch { width:100%; padding:10px 14px 10px 40px; border-radius:10px; background:rgba(255,255,255,.07); border:1px solid rgba(200,169,81,.22); color:#FFF8E1; font-family:var(--sans); font-size:14px; -webkit-appearance:none; transition:border-color .3s,box-shadow .3s,background .3s; backdrop-filter:blur(10px); }
        .srch::placeholder { color:rgba(240,220,190,.3); font-style:italic; }
        .srch:focus { outline:none; border-color:var(--g); background:rgba(255,255,255,.12); box-shadow:0 0 0 3px rgba(200,169,81,.12); }
        .srch-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:rgba(200,169,81,.4); pointer-events:none; }

        .bd { max-width:1320px; margin:0 auto; padding:0 16px; }
        @media(min-width:768px)  { .bd{padding:0 28px} }
        @media(min-width:1024px) { .bd{padding:0 48px} }

        .s-eye   { font-family:var(--sans); font-size:9px; font-weight:700; color:rgba(200,169,81,.65); letter-spacing:.24em; text-transform:uppercase; margin-bottom:4px; }
        .s-title { font-family:var(--serif); font-weight:500; font-size:26px; color:var(--c); }
        @media(min-width:768px){ .s-title{font-size:30px} }

        .spl-section { margin-top:28px; margin-bottom:36px; opacity:0; transform:translateY(32px); transition:opacity .7s cubic-bezier(.23,1,.32,1),transform .7s cubic-bezier(.23,1,.32,1); }
        .spl-section.vis { opacity:1; transform:translateY(0); }
        .spl-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:0; }
        .spl-tagline { font-family:var(--serif); font-style:italic; font-weight:400; font-size:13px; color:rgba(93,22,22,.45); padding-bottom:2px; }

        .spl-grid { display:grid; grid-template-columns:1fr; gap:16px; }
        @media(min-width:580px)  { .spl-grid{grid-template-columns:repeat(2,1fr)} }
        @media(min-width:1024px) { .spl-grid{grid-template-columns:repeat(2,1fr);gap:20px} }

        .spl-card { position:relative; overflow:hidden; border-radius:20px; background:var(--card); border:1.5px solid rgba(200,169,81,.3); display:flex; gap:0; box-shadow:0 4px 24px rgba(93,22,22,.1),0 1px 4px rgba(93,22,22,.06); -webkit-tap-highlight-color:transparent; transition:transform .4s cubic-bezier(.23,1,.32,1),box-shadow .4s,border-color .4s; animation:splIn .7s cubic-bezier(.23,1,.32,1) both; }
        .spl-card:nth-child(2){animation-delay:.12s}
        .spl-card:nth-child(3){animation-delay:.22s}
        .spl-card:nth-child(4){animation-delay:.32s}
        @keyframes splIn { from{opacity:0;transform:translateY(28px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .spl-card::before { content:''; position:absolute; inset:0; z-index:0; background:linear-gradient(135deg,rgba(200,169,81,.06) 0%,transparent 60%); pointer-events:none; }
        .spl-card:hover { transform:translateY(-6px) scale(1.015); box-shadow:0 20px 56px rgba(93,22,22,.18),0 4px 16px rgba(93,22,22,.1); border-color:rgba(200,169,81,.6); }
        .spl-card:active { transform:scale(.98); }
        .spl-card::after { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--g) 30%,var(--gl) 50%,var(--g) 70%,transparent); background-size:200% 100%; animation:shimmer 3s linear infinite; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

        .spl-img-wrap { flex-shrink:0; width:130px; height:150px; position:relative; overflow:hidden; border-radius:18px 0 0 18px; }
        @media(min-width:580px)  { .spl-img-wrap{width:150px;height:170px} }
        @media(min-width:1024px) { .spl-img-wrap{width:180px;height:190px} }
        .spl-img-wrap img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .6s cubic-bezier(.23,1,.32,1); }
        .spl-card:hover .spl-img-wrap img { transform:scale(1.1); }
        .spl-img-side-fade { position:absolute; top:0; right:0; bottom:0; width:40px; background:linear-gradient(to right,transparent,var(--card)); pointer-events:none; z-index:1; }

        .spl-body { flex:1; padding:16px 18px 16px 14px; display:flex; flex-direction:column; justify-content:space-between; position:relative; z-index:1; }
        @media(min-width:580px){ .spl-body{padding:18px 20px 18px 16px} }

        .spl-badges { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; }
        .spl-badge { font-family:var(--sans); font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:3px 9px; border-radius:20px; background:linear-gradient(135deg,var(--g),var(--gd)); color:var(--ink); box-shadow:0 2px 8px rgba(200,169,81,.35); }
        .spl-vb { display:inline-flex; align-items:center; gap:4px; background:rgba(8,1,3,.06); border:1px solid rgba(0,0,0,.08); border-radius:6px; padding:2px 7px; }
        .spl-vdot { width:8px; height:8px; border-radius:2px; }
        .spl-vtext { font-family:var(--sans); font-size:9px; font-weight:600; color:rgba(45,10,15,.5); }

        .spl-name { font-family:var(--serif); font-weight:600; font-size:19px; color:var(--cd); line-height:1.15; margin-bottom:6px; }
        @media(min-width:580px){ .spl-name{font-size:21px} }
        .spl-desc { font-family:var(--sans); font-size:12px; color:rgba(93,22,22,.5); line-height:1.5; flex:1; margin-bottom:14px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        @media(min-width:580px){ .spl-desc{font-size:13px} }

        .spl-foot { display:flex; align-items:center; justify-content:space-between; gap:8px; }
        .spl-price { font-family:var(--serif); font-weight:600; font-size:26px; color:var(--cd); line-height:1; }
        @media(min-width:580px){ .spl-price{font-size:28px} }
        .spl-price span { font-family:var(--sans); font-size:11px; font-weight:400; color:rgba(93,22,22,.4); vertical-align:super; margin-right:1px; }

        .spl-abtn { padding:10px 22px; border-radius:11px; border:1px solid rgba(200,169,81,.35); cursor:pointer; background:linear-gradient(135deg,#5D1616 0%,#3D0D0D 100%); color:var(--g); font-family:var(--sans); font-size:12px; font-weight:700; letter-spacing:.08em; -webkit-tap-highlight-color:transparent; position:relative; overflow:hidden; transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s; box-shadow:0 4px 16px rgba(45,10,15,.25); }
        .spl-abtn:hover { box-shadow:0 8px 28px rgba(45,10,15,.4); transform:scale(1.06); }
        .spl-abtn:active { transform:scale(.94); }

        .spl-qw { display:flex; align-items:center; height:36px; border-radius:11px; overflow:hidden; background:rgba(200,169,81,.08); border:1.5px solid rgba(200,169,81,.4); }
        .spl-qb { width:36px; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,var(--cm),var(--c)); color:var(--g); font-size:18px; font-weight:700; border:none; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:transform .25s cubic-bezier(.34,1.56,.64,1); }
        .spl-qb:hover { transform:scale(1.1); }
        .spl-qb:active { transform:scale(.9); }
        .spl-qn { padding:0 10px; min-width:28px; text-align:center; font-family:var(--sans); font-size:14px; font-weight:700; color:var(--c); }

        .strip-box { overflow:hidden; position:relative; }
        .strip-box::before,.strip-box::after { content:''; position:absolute; top:0; bottom:0; width:80px; z-index:2; pointer-events:none; }
        .strip-box::before { left:0; background:linear-gradient(to right,var(--bg),transparent); }
        .strip-box::after  { right:0; background:linear-gradient(to left,var(--bg),transparent); }
        .strip-track { display:flex; gap:14px; width:max-content; animation:march 34s linear infinite; padding:6px 0 10px; }
        .strip-track:hover { animation-play-state:paused; }
        @keyframes march { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        .sc { flex-shrink:0; position:relative; overflow:hidden; cursor:pointer; border-radius:16px; border:1.5px solid rgba(200,169,81,.2); box-shadow:0 4px 14px rgba(45,10,15,.1); width:112px; height:112px; -webkit-tap-highlight-color:transparent; transition:transform .4s cubic-bezier(.23,1,.32,1),box-shadow .4s,border-color .3s; }
        @media(min-width:640px)  { .sc{width:130px;height:130px} }
        @media(min-width:1024px) { .sc{width:150px;height:150px;border-radius:20px} }
        .sc:hover  { transform:scale(1.08) translateY(-5px); box-shadow:0 14px 32px rgba(45,10,15,.22); border-color:rgba(200,169,81,.55); }
        .sc:active { transform:scale(.96); }
        .sc-ov { position:absolute; inset:0; background:linear-gradient(to top,rgba(20,4,6,.75) 0%,rgba(0,0,0,.1) 55%,transparent 100%); }
        .sc img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .5s cubic-bezier(.23,1,.32,1); }
        .sc:hover img { transform:scale(1.1); }
        .sc-name { position:absolute; bottom:8px; left:8px; right:8px; font-family:var(--sans); font-size:10px; font-weight:600; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-shadow:0 1px 4px rgba(0,0,0,.6); }
        @media(min-width:640px){ .sc-name{font-size:11px} }

        .pills { display:flex; gap:8px; overflow-x:auto; padding:2px 1px 14px; scrollbar-width:none; }
        .pills::-webkit-scrollbar { display:none; }
        .pill { flex-shrink:0; padding:8px 22px; border-radius:100px; cursor:pointer; border:1.5px solid rgba(93,22,22,.12); background:var(--card); color:var(--c); font-family:var(--sans); font-size:13px; font-weight:500; white-space:nowrap; -webkit-tap-highlight-color:transparent; box-shadow:0 2px 8px rgba(93,22,22,.05); transition:all .3s cubic-bezier(.23,1,.32,1); }
        .pill:hover { border-color:rgba(200,169,81,.5); transform:translateY(-2px); box-shadow:0 6px 16px rgba(93,22,22,.1); }
        .pill.on { background:linear-gradient(135deg,var(--cm) 0%,var(--c) 100%); color:var(--g); border-color:rgba(200,169,81,.45); box-shadow:0 6px 20px rgba(93,22,22,.3); transform:translateY(-2px) scale(1.04); }

        .grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
        @media(min-width:580px)  { .grid{grid-template-columns:repeat(3,1fr);gap:16px} }
        @media(min-width:900px)  { .grid{grid-template-columns:repeat(4,1fr);gap:18px} }
        @media(min-width:1200px) { .grid{grid-template-columns:repeat(5,1fr);gap:20px} }

        .fc { background:var(--card); border:1.5px solid rgba(200,169,81,.15); border-radius:18px; overflow:hidden; display:flex; flex-direction:column; opacity:0; transform:translateY(24px) scale(.97); box-shadow:0 2px 12px rgba(93,22,22,.06); transition:opacity .5s cubic-bezier(.23,1,.32,1),transform .5s cubic-bezier(.23,1,.32,1),box-shadow .4s,border-color .4s; }
        .fc.vis { opacity:1; transform:translateY(0) scale(1); }
        .fc:hover { border-color:rgba(200,169,81,.5); box-shadow:0 16px 48px rgba(93,22,22,.14),0 4px 12px rgba(93,22,22,.07); transform:translateY(-6px) !important; }

        .fc-img { position:relative; width:100%; padding-top:70%; overflow:hidden; }
        .fc-img img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .6s cubic-bezier(.23,1,.32,1); }
        .fc:hover .fc-img img { transform:scale(1.09); }
        .fc-img::after { content:''; position:absolute; inset:0; background:linear-gradient(to top,rgba(30,6,10,.22) 0%,transparent 50%); pointer-events:none; }

        .vb { position:absolute; top:8px; left:8px; z-index:2; background:rgba(8,1,3,.72); backdrop-filter:blur(6px); border:1px solid rgba(200,169,81,.15); border-radius:6px; padding:3px 7px; display:flex; align-items:center; gap:4px; }
        .vdot { width:8px; height:8px; border-radius:2px; }

        .fc-gline { height:2px; width:0; background:linear-gradient(90deg,transparent,var(--g),transparent); transition:width .5s cubic-bezier(.23,1,.32,1); margin:0 auto; }
        .fc:hover .fc-gline { width:100%; }

        .fc-body { padding:10px 12px 13px; flex:1; display:flex; flex-direction:column; }
        .fc-name { font-family:var(--serif); font-weight:500; font-size:16px; color:var(--c); line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:3px; }
        @media(min-width:768px){ .fc-name{font-size:17px} }
        .fc-desc { font-family:var(--sans); font-size:11px; color:rgba(93,22,22,.45); line-height:1.4; flex:1; margin-bottom:10px; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden; }
        .fc-foot { display:flex; align-items:center; justify-content:space-between; gap:6px; flex-wrap:wrap; }
        .fc-price { font-family:var(--serif); font-weight:600; font-size:21px; color:var(--cd); flex-shrink:0; }

        .abtn { padding:7px 17px; border-radius:9px; border:none; cursor:pointer; background:linear-gradient(135deg,var(--g) 0%,var(--gd) 100%); color:var(--ink); font-family:var(--sans); font-size:11px; font-weight:700; letter-spacing:.07em; flex-shrink:0; -webkit-tap-highlight-color:transparent; transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s; box-shadow:0 3px 10px rgba(200,169,81,.3); }
        .abtn:hover  { box-shadow:0 6px 18px rgba(200,169,81,.45); transform:scale(1.09); }
        .abtn:active { transform:scale(.93); }

        .qw { display:flex; align-items:center; height:32px; border-radius:9px; overflow:hidden; background:rgba(200,169,81,.08); border:1.5px solid rgba(200,169,81,.38); flex-shrink:0; }
        .qb { width:30px; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,var(--cm),var(--c)); color:var(--g); font-size:16px; font-weight:700; border:none; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:transform .25s cubic-bezier(.34,1.56,.64,1); }
        .qb:hover  { transform:scale(1.12); }
        .qb:active { transform:scale(.9); }
        .qn { padding:0 8px; min-width:24px; text-align:center; font-family:var(--sans); font-size:13px; font-weight:700; color:var(--c); }
        .fc-bot { height:2px; transition:background .5s; }

        .cta-wrap { position:fixed; bottom:0; left:0; right:0; z-index:40; padding:10px 16px 20px; background:linear-gradient(to top,rgba(245,237,224,.98) 65%,transparent); backdrop-filter:blur(4px); animation:ctaUp .5s cubic-bezier(.34,1.56,.64,1); }
        @media(min-width:768px)  { .cta-wrap{padding:10px 28px 22px} }
        @media(min-width:1024px) { .cta-wrap{padding:10px 48px 22px} }
        @keyframes ctaUp { from{transform:translateY(80px);opacity:0} to{transform:translateY(0);opacity:1} }
        .cta-in { max-width:1320px; margin:0 auto; }
        .ctabtn { width:100%; display:flex; align-items:center; justify-content:space-between; padding:15px 24px; border-radius:16px; border:1.5px solid rgba(200,169,81,.45); cursor:pointer; background:linear-gradient(135deg,#6E1A1A 0%,#3A0808 50%,#6E1A1A 100%); background-size:200% 100%; box-shadow:0 8px 32px rgba(45,10,15,.4),inset 0 1px 0 rgba(200,169,81,.15); -webkit-tap-highlight-color:transparent; transition:transform .3s,box-shadow .3s,background-position .6s; position:relative; overflow:hidden; }
        .ctabtn::after { content:''; position:absolute; top:0; left:-100%; width:60%; height:100%; background:linear-gradient(90deg,transparent,rgba(200,169,81,.12),transparent); transition:left .8s cubic-bezier(.23,1,.32,1); }
        .ctabtn:hover::after { left:150%; }
        .ctabtn:hover  { transform:translateY(-2px); box-shadow:0 14px 42px rgba(45,10,15,.55); background-position:right center; }
        .ctabtn:active { transform:scale(.98); }
        .cta-lbl   { display:flex; align-items:center; gap:8px; font-family:var(--sans); font-size:15px; font-weight:700; color:#fff; letter-spacing:.04em; }
        .cta-badge { font-family:var(--sans); font-size:12px; font-weight:700; background:var(--g); color:var(--ink); padding:5px 16px; border-radius:100px; }

        .toast { position:fixed; bottom:90px; left:50%; transform:translateX(-50%) translateY(16px) scale(.9); background:rgba(24,4,8,.97); border:1px solid rgba(200,169,81,.38); color:var(--g); font-family:var(--sans); font-size:13px; font-weight:500; padding:10px 24px; border-radius:12px; white-space:nowrap; z-index:60; box-shadow:0 10px 40px rgba(0,0,0,.45); opacity:0; pointer-events:none; transition:opacity .3s,transform .3s cubic-bezier(.34,1.56,.64,1); }
        .toast.on { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }

        @keyframes spin { to{transform:rotate(360deg)} }
        .spin { width:40px; height:40px; border-radius:50%; border:2px solid rgba(200,169,81,.15); border-top-color:var(--g); animation:spin .75s linear infinite; }

        .ornament { display:flex; align-items:center; gap:12px; margin:6px 0 20px; }
        .ornament-line { flex:1; height:1px; background:linear-gradient(90deg,transparent,rgba(200,169,81,.35)); }
        .ornament-line.r { background:linear-gradient(90deg,rgba(200,169,81,.35),transparent); }
        .ornament-gem { width:6px; height:6px; background:var(--g); transform:rotate(45deg); box-shadow:0 0 8px rgba(200,169,81,.4); }
      `}</style>

      <div className="pg" style={{ paddingBottom: totalQty > 0 ? 92 : 28 }}>

        {/* ── HEADER ── */}
        <header className={`hdr${scrolled ? " up" : ""}`}>
          <div className="gline" />
          <div className="hi">
            <div className="hi-top">
              <div>
                <p className="w-eye">Welcome back</p>
                <p className="w-name">{customerName}</p>
              </div>
              <div className="hi-btns">
                <button className="nbtn" onClick={() => router.push("/customer/cart")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  Cart
                  {totalQty > 0 && <span className="badge">{totalQty}</span>}
                </button>
                <button className="nbtn" onClick={() => router.push("/customer/order-status")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg>
                  Status
                </button>
              </div>
            </div>
            <div className="hi-search" style={{ width:"100%" }}>
              <svg className="srch-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                className="srch" type="text" placeholder="Search dishes…"
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="gline2" />
        </header>

        {/* ── BODY ── */}
        <div className="bd">

          {loading && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:72, gap:18 }}>
              <div className="spin" />
              <p style={{ fontFamily:"var(--sans)", fontSize:10, color:"var(--c)", opacity:.5, letterSpacing:".2em" }}>LOADING MENU…</p>
            </div>
          )}

          {error && (
            <div style={{ textAlign:"center", paddingTop:72 }}>
              <p style={{ fontFamily:"var(--sans)", fontSize:14, color:"#b91c1c", marginBottom:14 }}>{error}</p>
              <button onClick={() => window.location.reload()} style={{ padding:"9px 22px", borderRadius:9, border:"1.5px solid var(--c)", background:"transparent", color:"var(--c)", fontFamily:"var(--sans)", fontSize:13, cursor:"pointer" }}>Try Again</button>
            </div>
          )}

          {!loading && !error && (<>

            {/* ══ TODAY'S SPECIAL ══ */}
            {todaySpecials.length > 0 && (
              <div className={`spl-section${splVisible ? " vis" : ""}`}>
                <div className="spl-header">
                  <div>
                    <p className="s-eye">Limited Time</p>
                    <p className="s-title" style={{ display:"flex", alignItems:"center", gap:10 }}>
                      Today&apos;s Special
                      <span style={{ display:"inline-block", width:6, height:6, background:"var(--g)", transform:"rotate(45deg)", marginBottom:2, boxShadow:"0 0 8px rgba(200,169,81,.5)" }} />
                    </p>
                  </div>
                  <p className="spl-tagline">Chef&apos;s curated picks · today only</p>
                </div>

                <div className="ornament">
                  <div className="ornament-line" />
                  <div className="ornament-gem" />
                  <div className="ornament-line r" />
                </div>

                <div className="spl-grid">
                  {todaySpecials.map(item => {
                    const qty = getQty(item.id);
                    return (
                      <div key={item.id} className="spl-card">
                        <div className="spl-img-wrap">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image_url?.trim() ? item.image_url : "/images/paneer.jpg"}
                            alt={item.name}
                            onError={e => { (e.target as HTMLImageElement).src = "/images/paneer.jpg"; }}
                          />
                          <div className="spl-img-side-fade" />
                        </div>
                        <div className="spl-body">
                          <div>
                            <div className="spl-badges">
                              <span className="spl-badge">✦ Today&apos;s Special</span>
                              {item.type && (
                                <div className="spl-vb">
                                  <div className="spl-vdot" style={{ background: item.type === "veg" ? "#1a7a1a" : "#b91c1c" }} />
                                  <span className="spl-vtext">{item.type === "veg" ? "Veg" : "Non-veg"}</span>
                                </div>
                              )}
                            </div>
                            <p className="spl-name">{item.name}</p>
                            <p className="spl-desc">{item.description}</p>
                          </div>
                          <div className="spl-foot">
                            <p className="spl-price"><span>₹</span>{parseFloat(item.price).toFixed(0)}</p>
                            {qty === 0 ? (
                              <button className="spl-abtn" onClick={() => addItem(item)}>ADD TO CART</button>
                            ) : (
                              <div className="spl-qw">
                                <button className="spl-qb" onClick={() => removeItem(item.id)}>−</button>
                                <span className="spl-qn">{qty}</span>
                                <button className="spl-qb" onClick={() => addItem(item)}>+</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══ SCROLLING STRIP ══ */}
            {allItems.length > 0 && (
              <div style={{ marginBottom:30 }}>
                <p className="s-eye">Featured Dishes</p>
                <p className="s-title">Kitchen&apos;s Highlights</p>
                <div className="ornament">
                  <div className="ornament-line" />
                  <div className="ornament-gem" />
                  <div className="ornament-line r" />
                </div>
                <div className="strip-box">
                  <div className="strip-track">
                    {[...allItems, ...allItems].map((item, i) => (
                      <div key={`${item.id}-${i}`} className="sc" onClick={() => addItem(item)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url!}
                          alt={item.name}
                          onError={e => { (e.target as HTMLImageElement).src = "/images/paneer.jpg"; }}
                        />
                        <div className="sc-ov" />
                        <p className="sc-name">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ MENU GRID ══ */}
            <p className="s-eye">Menu</p>
            <p className="s-title">Our Specialities</p>
            <div className="ornament">
              <div className="ornament-line" />
              <div className="ornament-gem" />
              <div className="ornament-line r" />
            </div>

            <div className="pills">
              <button className={`pill${selectedCat === "All" ? " on" : ""}`} onClick={() => setSelectedCat("All")}>All</button>
              {categories.map(cat => (
                <button key={cat.id} className={`pill${selectedCat === cat.name ? " on" : ""}`} onClick={() => setSelectedCat(cat.name)}>
                  {cat.name}
                </button>
              ))}
            </div>

            <p style={{ fontFamily:"var(--sans)", fontSize:11, color:"rgba(93,22,22,.38)", marginBottom:18, letterSpacing:".05em" }}>
              {filteredItems.length} {filteredItems.length === 1 ? "dish" : "dishes"}
            </p>

            <div className="grid">
              {filteredItems.map((item, idx) => {
                const qty   = getQty(item.id);
                const isVis = visible.has(item.id);
                return (
                  <div
                    key={item.id}
                    ref={el => regCard(item.id, el)}
                    data-cid={item.id}
                    className={`fc${isVis ? " vis" : ""}`}
                    style={{ transitionDelay:`${Math.min(idx % 8, 7) * 55}ms` }}
                  >
                    <div className="fc-gline" />
                    <div className="fc-img">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_url?.trim() ? item.image_url : "/images/paneer.jpg"}
                        alt={item.name}
                        onError={e => { (e.target as HTMLImageElement).src = "/images/paneer.jpg"; }}
                      />
                      {item.type && (
                        <div className="vb">
                          <div className="vdot" style={{ background: item.type === "veg" ? "#1a7a1a" : "#b91c1c" }} />
                        </div>
                      )}
                    </div>
                    <div className="fc-body">
                      <p className="fc-name">{item.name}</p>
                      <p className="fc-desc">{item.description}</p>
                      <div className="fc-foot">
                        <span className="fc-price">₹{parseFloat(item.price).toFixed(0)}</span>
                        {qty === 0 ? (
                          <button className="abtn" onClick={() => addItem(item)}>ADD</button>
                        ) : (
                          <div className="qw">
                            <button className="qb" onClick={() => removeItem(item.id)}>−</button>
                            <span className="qn">{qty}</span>
                            <button className="qb" onClick={() => addItem(item)}>+</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="fc-bot" style={{ background: qty > 0 ? "linear-gradient(90deg,transparent,var(--g),transparent)" : "transparent" }} />
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && categories.length > 0 && (
              <div style={{ textAlign:"center", padding:"56px 0" }}>
                <p style={{ fontFamily:"var(--serif)", fontStyle:"italic", fontSize:22, color:"rgba(93,22,22,.28)" }}>No dishes found</p>
              </div>
            )}

          </>)}
        </div>

        <div className={`toast${toastOn ? " on" : ""}`}>
          <span style={{ marginRight:7, opacity:.45 }}>✦</span>{toast}<span style={{ marginLeft:7, opacity:.45 }}>✦</span>
        </div>

        {totalQty > 0 && (
          <div className="cta-wrap">
            <div className="cta-in">
              <button className="ctabtn" onClick={() => router.push("/customer/cart")}>
                <span className="cta-lbl">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  View Cart
                </span>
                <span className="cta-badge">{totalQty} {totalQty === 1 ? "item" : "items"}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}