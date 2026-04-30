"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface FoodItem {
  id: string; name: string; description: string; price: string;
  image_url: string | null; type?: "veg" | "nonveg";
}
interface Category { id: string; name: string; description: string; items: FoodItem[]; }
interface CartItem extends FoodItem { qty: number; parcel: boolean; notes: string; }

const BASE_URL = "https://pos-backend-s380.onrender.com";

export default function MenuPage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("Guest");
  const [tableNumber, setTableNumber]   = useState("");
  const [categories, setCategories]     = useState<Category[]>([]);
  const [selectedCat, setSelectedCat]   = useState("All");
  const [search, setSearch]             = useState("");
  const [cart, setCart]                 = useState<CartItem[]>([]);
  const [toast, setToast]               = useState("");
  const [toastOn, setToastOn]           = useState(false);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [scrolled, setScrolled]         = useState(false);
  const [visible, setVisible]           = useState<Set<string>>(new Set());
  const cardRefs   = useRef<Map<string, HTMLDivElement>>(new Map());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observer   = useRef<IntersectionObserver | null>(null);

  // ── scroll shadow ──
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // ── intersection observer for card reveal ──
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

  // ── load auth + cart from localStorage ──
  useEffect(() => {
    const name  = localStorage.getItem("customerName") || "Guest";
    const table = localStorage.getItem("tableNumber")  || "";

    setCustomerName(name);
    setTableNumber(table);

    if (!name || !table) return;

    const correctKey = `currentCart_${table}_${name}`;

    // ── FIX: clean up stale carts from previous users on this device/table ──
    const toDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || "";
      if (k.startsWith(`currentCart_${table}_`) && k !== correctKey) {
        toDelete.push(k);
      }
    }
    toDelete.forEach(k => {
      console.log("🧹 Removed stale cart:", k);
      localStorage.removeItem(k);
    });

    // ── load cart for current user ──
    const s = localStorage.getItem(correctKey);
    if (s) {
      try {
        setCart(JSON.parse(s));
        console.log("🛒 Cart loaded from:", correctKey);
      } catch {
        console.warn("Cart parse failed, clearing");
        localStorage.removeItem(correctKey);
      }
    }
  }, []);

  // ── fetch menu ──
  useEffect(() => {
    (async () => {
      setLoading(true);
      const token = localStorage.getItem("customerJWT");
      if (!token) {
        setError("Session expired. Please login again.");
        setLoading(false);
        return;
      }
      try {
        const res  = await fetch(`${BASE_URL}/api/customer/menu`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const json = await res.json();
        console.log("🍽️ Menu API raw response:", JSON.stringify(json, null, 2));

        if (!res.ok || !json.success) {
          throw new Error(json?.message || `Server error: ${res.status}`);
        }

        const cats: Category[] =
          json.data?.categories ??
          json.data?.menu ??
          json.data?.items ??
          (Array.isArray(json.data) ? json.data : null) ??
          json.categories ??
          json.menu ??
          [];

        console.log(`✅ Parsed ${cats.length} categories`);
        if (cats.length === 0) console.warn("⚠️ No categories found — check API shape above");

        setCategories(cats);
        setSelectedCat("All");
        setError("");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unable to load menu.";
        console.error("❌ Menu fetch error:", err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── FIX: always read name + table fresh from localStorage, never from stale state ──
  const saveCart = (u: CartItem[]) => {
    setCart(u);

    const name  = localStorage.getItem("customerName") || "Guest";
    const table = localStorage.getItem("tableNumber")  || "1";
    const key   = `currentCart_${table}_${name}`;

    console.log("💾 Saving cart →", key, u);
    localStorage.setItem(key, JSON.stringify(u));
  };

  const addItem = (item: FoodItem) => {
    const u = [...cart];
    const i = u.findIndex(x => x.id === item.id);
    if (i >= 0) {
      u[i] = { ...u[i], qty: u[i].qty + 1 };
    } else {
      u.push({ ...item, image_url: item.image_url || null, qty: 1, parcel: false, notes: "" });
    }
    saveCart(u);
    showToast(`${item.name} added`);
  };

  const removeItem = (id: string) =>
    saveCart(
      cart.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0)
    );

  const getQty   = (id: string) => cart.find(i => i.id === id)?.qty || 0;
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  const filteredItems = useMemo(() => {
    const base = selectedCat === "All"
      ? categories.flatMap(c => c.items)
      : categories.find(c => c.name === selectedCat)?.items || [];
    return search
      ? base.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
      : base;
  }, [categories, selectedCat, search]);

  const allItems = useMemo(
    () => categories.flatMap(c => c.items).filter(i => i.image_url),
    [categories]
  );

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg); setToastOn(true);
    toastTimer.current = setTimeout(() => setToastOn(false), 2200);
  };

  const regCard = (id: string, el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(id, el);
      observer.current?.observe(el);
    } else {
      cardRefs.current.delete(id);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        html { -webkit-text-size-adjust:100%; }
        :root {
          --c:#5D1616; --cd:#3D0D0D; --cm:#7B1F1F;
          --g:#C8A951; --ink:#2D0A0F;
          --card:#FFFDF8;
          --serif:'DM Serif Display',Georgia,serif;
          --sans:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif;
        }

        .pg { min-height:100vh; background:#F5EDE0; }

        .hdr {
          background:linear-gradient(160deg,#3A0B0B 0%,#5D1616 40%,#6E1A1A 75%,#4A1010 100%);
          position:sticky; top:0; z-index:50; transition:box-shadow .3s;
        }
        .hdr.up { box-shadow:0 6px 30px rgba(0,0,0,.45); }
        .gline  { height:2px; background:linear-gradient(90deg,transparent,rgba(200,169,81,.3) 20%,#C8A951 50%,rgba(200,169,81,.3) 80%,transparent); }
        .gline2 { height:1px; background:linear-gradient(90deg,transparent,rgba(200,169,81,.5),transparent); }

        .hi {
          max-width:1320px; margin:0 auto;
          padding:12px 16px 12px;
          display:flex; flex-direction:column; gap:10px;
        }
        .hi-top { display:flex; align-items:center; justify-content:space-between; gap:10px; }
        @media(min-width:768px) {
          .hi { flex-direction:row; align-items:center; padding:12px 28px; gap:14px; }
          .hi-top { flex-shrink:0; }
          .hi-search { flex:1; }
          .hi-btns  { flex-shrink:0; }
        }
        @media(min-width:1024px) { .hi { padding:12px 48px; } }

        .w-eye  { font-family:var(--sans); font-size:10px; font-weight:600; color:rgba(200,169,81,.55); letter-spacing:.16em; text-transform:uppercase; }
        .w-name { font-family:var(--serif); font-style:italic; font-size:19px; color:#FFF8E1; line-height:1.1; }

        .hi-btns { display:flex; gap:8px; }
        .nbtn {
          display:flex; align-items:center; justify-content:center; gap:6px;
          padding:9px 18px; border-radius:11px; border:none; cursor:pointer;
          background:rgba(10,2,4,.55); border:1.5px solid rgba(200,169,81,.35);
          color:#fff; font-family:var(--sans); font-size:13px; font-weight:600;
          white-space:nowrap; backdrop-filter:blur(8px);
          -webkit-tap-highlight-color:transparent;
          transition:background .25s, border-color .25s, transform .2s, box-shadow .25s;
        }
        @media(max-width:767px) { .nbtn { padding:9px 14px; font-size:12px; } }
        .nbtn:hover  { background:rgba(28,4,8,.8); border-color:var(--g); box-shadow:0 4px 14px rgba(0,0,0,.3); transform:translateY(-1px); }
        .nbtn:active { transform:scale(.96); }
        .badge {
          display:inline-flex; align-items:center; justify-content:center;
          min-width:18px; height:18px; padding:0 4px; border-radius:9px;
          background:var(--g); color:var(--ink); font-family:var(--sans); font-size:10px; font-weight:700;
          animation:bpop .4s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes bpop { from{transform:scale(0);opacity:0;} to{transform:scale(1);opacity:1;} }

        .hi-search { position:relative; }
        .srch {
          width:100%; padding:10px 14px 10px 38px;
          border-radius:11px;
          background:rgba(10,2,4,.5); border:1.5px solid rgba(200,169,81,.25);
          color:#FFF8E1; font-family:var(--sans); font-size:14px;
          -webkit-appearance:none;
          transition:border-color .3s, box-shadow .3s, background .3s;
          backdrop-filter:blur(10px);
        }
        .srch::placeholder { color:rgba(240,220,190,.35); font-style:italic; }
        .srch:focus { outline:none; border-color:var(--g); background:rgba(10,2,4,.72); box-shadow:0 0 0 3px rgba(200,169,81,.1); }
        .srch-icon { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:rgba(200,169,81,.4); pointer-events:none; }

        .bd { max-width:1320px; margin:0 auto; padding:0 16px; }
        @media(min-width:768px)  { .bd { padding:0 28px; } }
        @media(min-width:1024px) { .bd { padding:0 48px; } }

        .s-eye   { font-family:var(--sans); font-size:10px; font-weight:700; color:rgba(200,169,81,.7); letter-spacing:.2em; text-transform:uppercase; margin-bottom:3px; }
        .s-title { font-family:var(--serif); font-style:italic; font-size:24px; color:var(--c); }
        @media(min-width:768px) { .s-title { font-size:28px; } }
        .s-rule  { height:1px; margin:8px 0 16px; background:linear-gradient(90deg,transparent,rgba(200,169,81,.4),transparent); }

        .strip-box { overflow:hidden; position:relative; }
        .strip-box::before, .strip-box::after {
          content:''; position:absolute; top:0; bottom:0; width:60px; z-index:2; pointer-events:none;
        }
        .strip-box::before { left:0;  background:linear-gradient(to right,#F5EDE0,transparent); }
        .strip-box::after  { right:0; background:linear-gradient(to left, #F5EDE0,transparent); }
        .strip-track {
          display:flex; gap:12px; width:max-content;
          animation:march 32s linear infinite;
        }
        .strip-track:hover { animation-play-state:paused; }
        @keyframes march { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
        .sc {
          flex-shrink:0; position:relative; overflow:hidden; cursor:pointer;
          border-radius:14px; border:1.5px solid rgba(200,169,81,.2);
          box-shadow:0 3px 12px rgba(45,10,15,.12);
          width:110px; height:110px;
          -webkit-tap-highlight-color:transparent;
          transition:transform .35s cubic-bezier(.23,1,.32,1), box-shadow .35s, border-color .3s;
        }
        @media(min-width:640px)  { .sc { width:128px; height:128px; } }
        @media(min-width:1024px) { .sc { width:148px; height:148px; border-radius:18px; } }
        .sc:hover  { transform:scale(1.07) translateY(-4px); box-shadow:0 12px 28px rgba(45,10,15,.24); border-color:rgba(200,169,81,.55); }
        .sc:active { transform:scale(.96); }
        .sc-ov     { position:absolute; inset:0; background:linear-gradient(to top, rgba(40,8,10,.7) 0%, transparent 55%); }
        .sc-name   { position:absolute; bottom:7px; left:8px; right:8px; font-family:var(--sans); font-size:10px; font-weight:600; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        @media(min-width:640px) { .sc-name { font-size:11px; } }

        .pills {
          display:flex; gap:8px; overflow-x:auto;
          padding:2px 1px 12px; scrollbar-width:none;
        }
        .pills::-webkit-scrollbar { display:none; }
        .pill {
          flex-shrink:0; padding:8px 20px; border-radius:100px; cursor:pointer;
          border:1.5px solid rgba(93,22,22,.14); background:var(--card); color:var(--c);
          font-family:var(--sans); font-size:13px; font-weight:500; white-space:nowrap;
          -webkit-tap-highlight-color:transparent;
          transition:all .3s cubic-bezier(.23,1,.32,1);
        }
        .pill:hover  { border-color:rgba(200,169,81,.48); transform:translateY(-2px); box-shadow:0 5px 12px rgba(93,22,22,.1); }
        .pill.on {
          background:linear-gradient(135deg,var(--cm) 0%,var(--c) 100%);
          color:var(--g); border-color:rgba(200,169,81,.42);
          box-shadow:0 5px 18px rgba(93,22,22,.28); transform:translateY(-2px) scale(1.04);
        }

        .grid {
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:14px;
        }
        @media(min-width:580px)  { .grid { grid-template-columns:repeat(3,1fr); gap:16px; } }
        @media(min-width:900px)  { .grid { grid-template-columns:repeat(4,1fr); gap:18px; } }
        @media(min-width:1200px) { .grid { grid-template-columns:repeat(5,1fr); gap:20px; } }

        .fc {
          background:var(--card);
          border:1.5px solid rgba(200,169,81,.18);
          border-radius:16px; overflow:hidden;
          display:flex; flex-direction:column;
          opacity:0; transform:translateY(24px) scale(.97);
          transition:
            opacity .5s cubic-bezier(.23,1,.32,1),
            transform .5s cubic-bezier(.23,1,.32,1),
            box-shadow .35s, border-color .35s;
        }
        .fc.vis { opacity:1; transform:translateY(0) scale(1); }
        .fc:hover {
          border-color:rgba(200,169,81,.48);
          box-shadow:0 14px 44px rgba(93,22,22,.13), 0 3px 10px rgba(93,22,22,.06);
          transform:translateY(-5px) !important;
        }

        .fc-img { position:relative; width:100%; padding-top:68%; overflow:hidden; }
        .fc-img img { transition:transform .6s cubic-bezier(.23,1,.32,1), filter .45s; }
        .fc:hover .fc-img img { transform:scale(1.08); filter:brightness(1.04) saturate(1.06); }
        .fc-img::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(to top, rgba(45,10,15,.25) 0%, transparent 48%);
          pointer-events:none;
        }

        .vb {
          position:absolute; top:8px; left:8px; z-index:2;
          background:rgba(8,1,3,.7); backdrop-filter:blur(6px);
          border:1px solid rgba(200,169,81,.18); border-radius:6px;
          padding:3px 6px; display:flex; align-items:center; gap:4px;
        }
        .vdot { width:8px; height:8px; border-radius:2px; }

        .fc-gline {
          height:2px; width:0;
          background:linear-gradient(90deg,transparent,var(--g),transparent);
          transition:width .4s cubic-bezier(.23,1,.32,1); margin:0 auto;
        }
        .fc:hover .fc-gline { width:100%; }

        .fc-body { padding:10px 11px 12px; flex:1; display:flex; flex-direction:column; }
        .fc-name {
          font-family:var(--serif); font-size:15px; color:var(--c);
          line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:3px;
        }
        @media(min-width:768px) { .fc-name { font-size:16px; } }
        .fc-desc {
          font-family:var(--sans); font-size:11px; color:rgba(93,22,22,.5);
          line-height:1.35; flex:1; margin-bottom:10px;
          display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;
        }

        .fc-foot { display:flex; align-items:center; justify-content:space-between; gap:6px; flex-wrap:wrap; }
        .fc-price { font-family:var(--serif); font-size:20px; color:var(--cd); flex-shrink:0; }

        .abtn {
          padding:7px 16px; border-radius:9px; border:none; cursor:pointer;
          background:linear-gradient(135deg,var(--g) 0%,#D4B76E 100%);
          color:var(--ink); font-family:var(--sans); font-size:11px; font-weight:700; letter-spacing:.07em;
          flex-shrink:0; -webkit-tap-highlight-color:transparent;
          transition:transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s;
        }
        .abtn:hover  { box-shadow:0 5px 16px rgba(200,169,81,.4); transform:scale(1.08); }
        .abtn:active { transform:scale(.94); }

        .qw {
          display:flex; align-items:center;
          height:32px; border-radius:9px; overflow:hidden;
          background:rgba(200,169,81,.1); border:1.5px solid rgba(200,169,81,.35); flex-shrink:0;
        }
        .qb {
          width:30px; height:100%; display:flex; align-items:center; justify-content:center;
          background:linear-gradient(135deg,var(--cm),var(--c));
          color:var(--g); font-size:16px; font-weight:700; border:none; cursor:pointer;
          -webkit-tap-highlight-color:transparent;
          transition:transform .25s cubic-bezier(.34,1.56,.64,1); flex-shrink:0;
        }
        .qb:hover  { transform:scale(1.12); }
        .qb:active { transform:scale(.9); }
        .qn { padding:0 8px; min-width:24px; text-align:center; font-family:var(--sans); font-size:13px; font-weight:700; color:var(--c); }

        .fc-bot { height:2px; transition:background .5s; }

        .cta-wrap {
          position:fixed; bottom:0; left:0; right:0; z-index:40;
          padding:10px 16px 20px;
          background:linear-gradient(to top,rgba(245,237,224,.98) 65%,transparent);
          backdrop-filter:blur(4px);
          animation:ctaUp .42s cubic-bezier(.34,1.56,.64,1);
        }
        @media(min-width:768px)  { .cta-wrap { padding:10px 28px 22px; } }
        @media(min-width:1024px) { .cta-wrap { padding:10px 48px 22px; } }
        @keyframes ctaUp { from{transform:translateY(70px);opacity:0;} to{transform:translateY(0);opacity:1;} }
        .cta-in { max-width:1320px; margin:0 auto; }
        .ctabtn {
          width:100%; display:flex; align-items:center; justify-content:space-between;
          padding:14px 22px; border-radius:15px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#6E1A1A 0%,#4A1010 50%,#6E1A1A 100%);
          background-size:200% 100%;
          border:1.5px solid rgba(200,169,81,.42);
          box-shadow:0 8px 30px rgba(45,10,15,.38), inset 0 1px 0 rgba(200,169,81,.18);
          -webkit-tap-highlight-color:transparent;
          transition:transform .3s, box-shadow .3s, background-position .4s;
          position:relative; overflow:hidden;
        }
        .ctabtn::after {
          content:''; position:absolute; top:0; left:-100%; width:60%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(200,169,81,.1),transparent);
          transition:left .7s cubic-bezier(.23,1,.32,1);
        }
        .ctabtn:hover::after { left:150%; }
        .ctabtn:hover  { transform:translateY(-2px); box-shadow:0 12px 38px rgba(45,10,15,.5); background-position:right center; }
        .ctabtn:active { transform:scale(.98); }
        .cta-lbl   { display:flex; align-items:center; gap:8px; font-family:var(--sans); font-size:15px; font-weight:700; color:#fff; letter-spacing:.04em; }
        .cta-badge { font-family:var(--sans); font-size:12px; font-weight:700; background:var(--g); color:var(--ink); padding:4px 14px; border-radius:100px; }

        .toast {
          position:fixed; bottom:86px; left:50%;
          transform:translateX(-50%) translateY(16px) scale(.9);
          background:rgba(24,4,8,.97); border:1px solid rgba(200,169,81,.36);
          color:var(--g); font-family:var(--sans); font-size:13px; font-weight:500;
          padding:10px 22px; border-radius:12px; white-space:nowrap; z-index:60;
          box-shadow:0 10px 36px rgba(0,0,0,.4);
          opacity:0; pointer-events:none;
          transition:opacity .3s cubic-bezier(.23,1,.32,1), transform .3s cubic-bezier(.34,1.56,.64,1);
        }
        .toast.on { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }

        .debug-banner {
          background:rgba(200,169,81,.12); border:1px solid rgba(200,169,81,.3);
          border-radius:10px; padding:12px 16px; margin:16px 0;
          font-family:var(--sans); font-size:12px; color:var(--c);
        }
        .debug-banner strong { display:block; margin-bottom:4px; font-size:13px; }

        @keyframes spin { to{transform:rotate(360deg);} }
        .spin {
          width:40px; height:40px; border-radius:50%;
          border:2px solid rgba(200,169,81,.18); border-top-color:var(--g);
          animation:spin .75s linear infinite;
        }
      `}</style>

      <div className="pg" style={{ paddingBottom: totalQty > 0 ? 88 : 24 }}>

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

            <div className="hi-search" style={{ width: "100%" }}>
              <svg className="srch-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                className="srch"
                type="text"
                placeholder="Search dishes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="gline2" />
        </header>

        {/* ── BODY ── */}
        <div className="bd">

          {loading && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:64, gap:16 }}>
              <div className="spin" />
              <p style={{ fontFamily:"var(--sans)", fontSize:11, color:"var(--c)", opacity:.55, letterSpacing:".16em" }}>
                LOADING MENU…
              </p>
            </div>
          )}

          {error && (
            <div style={{ textAlign:"center", paddingTop:64 }}>
              <p style={{ fontFamily:"var(--sans)", fontSize:14, color:"#b91c1c", marginBottom:12 }}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding:"8px 20px", borderRadius:8, border:"1.5px solid var(--c)",
                  background:"transparent", color:"var(--c)",
                  fontFamily:"var(--sans)", fontSize:13, cursor:"pointer",
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (<>

            {categories.length === 0 && (
              <div className="debug-banner">
                <strong>⚠️ Menu loaded but 0 categories found</strong>
                Open DevTools → Console and look for{" "}
                <code>🍽️ Menu API raw response</code> to see the exact shape.
              </div>
            )}

            {/* ── Featured strip ── */}
            {allItems.length > 0 && (
              <div style={{ marginTop:22, marginBottom:26 }}>
                <p className="s-eye">Featured Dishes</p>
                <p className="s-title">Today&apos;s Highlights</p>
                <div className="s-rule" />
                <div className="strip-box" style={{ paddingBottom:6 }}>
                  <div className="strip-track">
                    {[...allItems, ...allItems].map((item, i) => (
                      <div key={`${item.id}-${i}`} className="sc" onClick={() => addItem(item)}>
                        <Image src={item.image_url!} alt={item.name} fill sizes="148px" className="object-cover" />
                        <div className="sc-ov" />
                        <p className="sc-name">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Category pills ── */}
            <p className="s-eye">Menu</p>
            <p className="s-title">Our Specialities</p>
            <div className="s-rule" />

            <div className="pills">
              <button
                className={`pill${selectedCat === "All" ? " on" : ""}`}
                onClick={() => setSelectedCat("All")}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`pill${selectedCat === cat.name ? " on" : ""}`}
                  onClick={() => setSelectedCat(cat.name)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <p style={{ fontFamily:"var(--sans)", fontSize:12, color:"rgba(93,22,22,.4)", marginBottom:16, letterSpacing:".04em" }}>
              {filteredItems.length} {filteredItems.length === 1 ? "dish" : "dishes"}
            </p>

            {/* ── Item grid ── */}
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
                      <Image
                        src={
                          item.image_url && item.image_url.trim() !== ""
                            ? item.image_url
                            : "/images/paneer.jpg"
                        }
                        alt={item.name}
                        fill
                        sizes="(max-width:580px) 50vw,(max-width:900px) 33vw,25vw"
                        className="object-cover"
                      />
                      {item.type && (
                        <div className="vb">
                          <div
                            className="vdot"
                            style={{ background: item.type === "veg" ? "#1a7a1a" : "#b91c1c" }}
                          />
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

                    <div
                      className="fc-bot"
                      style={{
                        background: qty > 0
                          ? "linear-gradient(90deg,transparent,var(--g),transparent)"
                          : "transparent",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && categories.length > 0 && (
              <div style={{ textAlign:"center", padding:"48px 0" }}>
                <p style={{ fontFamily:"var(--serif)", fontStyle:"italic", fontSize:20, color:"rgba(93,22,22,.3)" }}>
                  No dishes found
                </p>
              </div>
            )}

          </>)}
        </div>

        {/* ── Toast ── */}
        <div className={`toast${toastOn ? " on" : ""}`}>
          <span style={{ marginRight:6, opacity:.5 }}>✦</span>
          {toast}
          <span style={{ marginLeft:6, opacity:.5 }}>✦</span>
        </div>

        {/* ── Sticky View Cart CTA ── */}
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