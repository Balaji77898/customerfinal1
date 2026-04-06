"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = "https://pos-backend-s380.onrender.com";

const STEPS = [
  { label: "Order Placed",    sub: "Order received" },
  { label: "Preparing",       sub: "Chef is cooking" },
  { label: "Ready to Serve",  sub: "Order is ready" },
  { label: "Completed",       sub: "Enjoy your meal!" },
];

const STATUS_MAP: Record<string, number> = {
  PLACED: 0, CONFIRMED: 1, PREPARING: 1, READY: 2, SERVED: 3, COMPLETED: 3,
};

function StepIcon({ index }: { index: number }) {
  const icons = [
    <svg key={0} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    <svg key={1} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    <svg key={2} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    <svg key={3} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>,
  ];
  return icons[index];
}

export default function OrderStatusPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState({ name: "", mobile: "", table: "" });
  const [orders, setOrders]     = useState<any[]>([]);
  const [orderId, setOrderId]   = useState<string | null>(null);
  const [animSteps, setAnimSteps] = useState<Record<string, number>>({});
  const [fetchError, setFetchError] = useState("");

  // FIX: Read orderId on mount AND watch for it appearing (e.g. navigated here
  //      immediately after placeOrder saved it)
  useEffect(() => {
    const name   = localStorage.getItem("customerName")   || "Guest";
    const mobile = localStorage.getItem("customerMobile") || "";
    const table  = localStorage.getItem("tableNumber")    || "1";
    setCustomer({ name, mobile, table });

    // Read immediately
    const lastId = localStorage.getItem("lastOrderId");
    console.log("📦 lastOrderId from localStorage:", lastId);
    if (lastId) {
      setOrderId(lastId);
      return;
    }

    // FIX: Poll localStorage every 500ms for up to 5s in case payment page
    //      hasn't finished saving yet when we land here
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      const id = localStorage.getItem("lastOrderId");
      console.log(`🔄 Polling for lastOrderId (attempt ${attempts}):`, id);
      if (id) {
        setOrderId(id);
        clearInterval(poll);
      } else if (attempts >= 10) {
        console.warn("⚠️ lastOrderId never appeared in localStorage");
        clearInterval(poll);
      }
    }, 500);

    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("customerJWT");
        if (!token) {
          setFetchError("Session expired. Please login again.");
          return;
        }

        console.log("🌐 Fetching order:", `${BASE_URL}/api/customer/orders/${orderId}`);

        const res  = await fetch(`${BASE_URL}/api/customer/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const json = await res.json();
        console.log("📋 Order API raw response:", JSON.stringify(json, null, 2));

        if (!res.ok || !json.success) {
          setFetchError(json?.message || `Error ${res.status}`);
          return;
        }

        // FIX: Try all possible response shapes
        const order =
          json.data?.order ??   // { success, data: { order: {...} } }
          json.data ??          // { success, data: {...} }  (data IS the order)
          json.order ??         // legacy { order: {...} }
          null;

        console.log("✅ Parsed order:", order);

        if (!order?.id) {
          console.warn("⚠️ Could not find order object in response — check shape above");
          setFetchError("Could not read order data. Check console for API shape.");
          return;
        }

        setFetchError("");

        // FIX: normalise item fields — backends differ on field names
        const parsed = {
          id:       order.id,
          status:   order.status,
          items:    (order.items || order.order_items || []).map((i: any) => ({
            id:          i.id,
            name:        i.item_name ?? i.name ?? i.menu_item_name ?? "Item",
            quantity:    i.quantity   ?? i.qty  ?? 1,
            price:       Number(i.price    ?? 0),
            total_price: Number(i.subtotal ?? i.total_price ?? (i.price * (i.quantity || 1)) ?? 0),
          })),
          subtotal: Number(order.subtotal     ?? order.sub_total   ?? 0),
          gst:      Number(order.tax_amount   ?? order.gst_amount  ?? 0),
          gst_pct:  Number(order.gst_percentage ?? order.tax_pct   ?? 0),
          total:    Number(order.total_amount ?? order.total       ?? 0),
          date:     order.created_at,
        };

        setOrders([parsed]);

        const step = STATUS_MAP[(parsed.status ?? "").toUpperCase()] ?? 0;
        setAnimSteps(prev => {
          if (prev[parsed.id] === step) return prev;
          setTimeout(() => setAnimSteps(p => ({ ...p, [parsed.id]: step })), 80);
          return { ...prev, [parsed.id]: -1 };
        });
      } catch (err) {
        console.error("❌ fetchOrder error:", err);
        setFetchError("Network error. Retrying…");
      }
    };

    fetchOrder();
    const iv = setInterval(fetchOrder, 3000);
    return () => clearInterval(iv);
  }, [orderId]);

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

        .hdr { background:linear-gradient(160deg,#3A0B0B 0%,#5D1616 40%,#6E1A1A 75%,#4A1010 100%); position:sticky; top:0; z-index:50; }
        .gl  { height:2px; background:linear-gradient(90deg,transparent,rgba(200,169,81,.3) 20%,#C8A951 50%,rgba(200,169,81,.3) 80%,transparent); }
        .gl2 { height:1px; background:linear-gradient(90deg,transparent,rgba(200,169,81,.5),transparent); }
        .hi  { max-width:1320px; margin:0 auto; padding:12px 16px 12px; display:flex; align-items:center; gap:12px; }
        @media(min-width:768px) { .hi { padding:12px 28px; } }
        @media(min-width:1024px){ .hi { padding:12px 48px; } }

        .bbtn {
          display:flex; align-items:center; gap:6px; padding:9px 16px;
          border-radius:11px; border:none; cursor:pointer;
          background:rgba(10,2,4,.55); border:1.5px solid rgba(200,169,81,.35);
          color:#fff; font-family:var(--sans); font-size:13px; font-weight:600;
          flex-shrink:0; backdrop-filter:blur(8px);
          -webkit-tap-highlight-color:transparent;
          transition:all .25s cubic-bezier(.23,1,.32,1);
        }
        .bbtn:hover  { background:rgba(28,4,8,.8); border-color:var(--g); transform:translateX(-2px); }
        .bbtn:active { transform:scale(.96); }
        .ht  { flex:1; text-align:center; }
        .ht-text { font-family:var(--serif); font-style:italic; font-size:20px; color:#FFF8E1; }
        .ht-sub  { font-family:var(--sans); font-size:10px; color:rgba(200,169,81,.55); letter-spacing:.16em; text-transform:uppercase; margin-top:1px; }
        .hs { flex-shrink:0; width:90px; }

        .bd { max-width:900px; margin:0 auto; padding:0 16px; }
        @media(min-width:768px)  { .bd { padding:0 28px; } }
        @media(min-width:1024px) { .bd { padding:0 48px; } }

        .s-eye   { font-family:var(--sans); font-size:10px; font-weight:700; color:rgba(200,169,81,.7); letter-spacing:.2em; text-transform:uppercase; margin-bottom:3px; }
        .s-title { font-family:var(--serif); font-style:italic; font-size:24px; color:var(--c); }
        .s-rule  { height:1px; margin:8px 0 16px; background:linear-gradient(90deg,transparent,rgba(200,169,81,.4),transparent); }

        .err-banner {
          background:rgba(185,28,28,.08); border:1px solid rgba(185,28,28,.2);
          border-radius:10px; padding:12px 16px; margin:16px 0;
          font-family:var(--sans); font-size:13px; color:#b91c1c;
        }

        .gcard{
          background:linear-gradient(135deg,rgba(200,169,81,.09) 0%,rgba(212,183,110,.05) 100%);
          border:1.5px solid rgba(200,169,81,.28);
          border-radius:16px; padding:14px 18px;
          margin-bottom:22px;
          display:flex; align-items:center; gap:14px; flex-wrap:wrap;
          animation:fadeUp .4s cubic-bezier(.23,1,.32,1) both;
          position:relative; overflow:hidden;
        }
        .gcard::before{
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,rgba(200,169,81,.6),transparent);
        }
        .gavatar{
          width:46px; height:46px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,var(--cm),var(--c));
          border:2px solid rgba(200,169,81,.4);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 4px 12px rgba(93,22,22,.22);
        }
        .gfields{ display:flex; flex-direction:column; gap:4px; flex:1; }
        .gfv { font-family:var(--serif); font-size:17px; color:var(--c); line-height:1.2; }

        .ocard {
          background:var(--card);
          border:1.5px solid rgba(200,169,81,.2);
          border-radius:18px; overflow:hidden;
          animation:fadeUp .5s cubic-bezier(.23,1,.32,1) both;
          transition:box-shadow .35s, border-color .35s;
          margin-bottom:20px;
        }
        .ocard:hover { border-color:rgba(200,169,81,.42); box-shadow:0 12px 40px rgba(93,22,22,.1); }
        .cgline { height:2px; width:0; background:linear-gradient(90deg,transparent,var(--g),transparent); transition:width .42s; margin:0 auto; }
        .ocard:hover .cgline { width:100%; }

        .oc-top {
          padding:14px 18px 12px;
          display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;
          border-bottom:1px solid rgba(200,169,81,.15);
        }
        .oc-badge {
          display:inline-flex; align-items:center; gap:6px;
          font-family:var(--sans); font-size:10px; font-weight:700;
          background:rgba(200,169,81,.14); color:var(--cm);
          padding:4px 12px; border-radius:100px;
          border:1px solid rgba(200,169,81,.28); letter-spacing:.1em; text-transform:uppercase;
        }
        .live { width:6px; height:6px; border-radius:50%; background:#22c55e; animation:blink 1.5s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:.25;} }
        .oc-status-chip {
          font-family:var(--sans); font-size:11px; font-weight:700;
          padding:4px 12px; border-radius:100px; letter-spacing:.08em; text-transform:uppercase;
        }

        .oc-cols { display:flex; flex-direction:column; }
        @media(min-width:640px) {
          .oc-cols { flex-direction:row; }
          .oc-left  { flex:0 0 220px; border-right:1px solid rgba(200,169,81,.15); }
          .oc-right { flex:1; }
        }
        @media(min-width:900px) { .oc-left { flex:0 0 260px; } }

        .oc-left { padding:16px 18px; }

        .step-row { display:flex; align-items:flex-start; gap:12px; position:relative; }
        .step-conn {
          position:absolute; left:17px; top:38px; bottom:-10px; width:2px;
          background:rgba(200,169,81,.15); transition:background .6s;
        }
        .step-conn.done { background:linear-gradient(to bottom,var(--cm),rgba(200,169,81,.3)); }

        .step-circ {
          flex-shrink:0; width:36px; height:36px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          position:relative; z-index:1;
          border:2px solid rgba(200,169,81,.18);
          background:#efe5d4; color:rgba(93,22,22,.28);
          transition:all .5s cubic-bezier(.34,1.56,.64,1);
        }
        .step-circ.done {
          background:linear-gradient(135deg,var(--cm),var(--c));
          border-color:rgba(200,169,81,.45); color:#fff;
          box-shadow:0 3px 12px rgba(93,22,22,.28);
          animation:spop .5s cubic-bezier(.34,1.56,.64,1) both;
        }
        .step-circ.active {
          background:linear-gradient(135deg,var(--g),#D4B76E);
          border-color:var(--g); color:var(--ink);
          box-shadow:0 3px 14px rgba(200,169,81,.4);
          animation:spop .5s cubic-bezier(.34,1.56,.64,1) both;
        }
        .step-circ.active::after {
          content:''; position:absolute; inset:-6px; border-radius:50%;
          border:2px solid rgba(200,169,81,.35);
          animation:pring 2s ease-in-out infinite;
        }
        @keyframes spop  { from{transform:scale(.5);opacity:.3;} to{transform:scale(1);opacity:1;} }
        @keyframes pring { 0%{transform:scale(.9);opacity:.8;} 70%{transform:scale(1.35);opacity:0;} 100%{opacity:0;} }

        .step-body { flex:1; padding-top:7px; padding-bottom:16px; }
        .step-lbl  { font-family:var(--sans); font-size:13px; font-weight:600; color:rgba(93,22,22,.28); transition:color .4s; }
        .step-lbl.done, .step-lbl.active { color:var(--c); }
        .step-sub2 { font-family:var(--sans); font-size:11px; color:rgba(93,22,22,.35); margin-top:1px; transition:color .4s; }
        .step-sub2.done, .step-sub2.active { color:rgba(93,22,22,.55); }

        .oc-right { padding:16px 18px; }
        .oc-right-title { font-family:var(--sans); font-size:10px; font-weight:700; color:rgba(200,169,81,.65); letter-spacing:.18em; text-transform:uppercase; margin-bottom:10px; }

        .item-row {
          display:flex; justify-content:space-between; align-items:center;
          padding:9px 0; border-bottom:1px solid rgba(200,169,81,.1);
          animation:fadeUp .4s cubic-bezier(.23,1,.32,1) both;
        }
        .item-row:last-of-type { border-bottom:none; }
        .item-name  { font-family:var(--serif); font-size:15px; color:var(--c); }
        .item-qty   { font-family:var(--sans); font-size:11px; color:rgba(93,22,22,.45); margin-top:1px; }
        .item-price { font-family:var(--serif); font-size:17px; color:var(--cd); }

        .totals {
          border-top:1.5px solid rgba(200,169,81,.2);
          padding:12px 18px;
          background:linear-gradient(135deg,rgba(200,169,81,.08),rgba(212,183,110,.04));
        }
        .trow { display:flex; justify-content:space-between; font-family:var(--sans); font-size:12px; color:rgba(93,22,22,.55); padding:3px 0; }
        .trow-final { display:flex; justify-content:space-between; align-items:center; margin-top:6px; }
        .trow-lbl { font-family:var(--sans); font-size:11px; font-weight:700; color:var(--c); letter-spacing:.06em; text-transform:uppercase; }
        .trow-val { font-family:var(--serif); font-size:22px; color:var(--cd); }
        .tdiv { height:1px; background:linear-gradient(90deg,transparent,rgba(200,169,81,.35),transparent); margin:8px 0; }

        /* waiting state while orderId is being resolved */
        .waiting {
          display:flex; flex-direction:column; align-items:center;
          padding:64px 0 32px; gap:14px; animation:fadeUp .5s both;
        }
        .spin {
          width:40px; height:40px; border-radius:50%;
          border:2px solid rgba(200,169,81,.18); border-top-color:var(--g);
          animation:spinr .75s linear infinite;
        }
        @keyframes spinr { to{ transform:rotate(360deg); } }

        .empty { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:55vh; gap:14px; animation:fadeUp .6s both; }
        .empty-title { font-family:var(--serif); font-style:italic; font-size:22px; color:var(--c); }
        .empty-btn {
          padding:12px 28px; border-radius:12px; border:none; cursor:pointer;
          background:linear-gradient(135deg,var(--cm),var(--c));
          color:var(--g); font-family:var(--sans); font-size:13px; font-weight:700;
          transition:transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s;
          box-shadow:0 6px 20px rgba(93,22,22,.25);
        }
        .empty-btn:hover { transform:scale(1.05); box-shadow:0 10px 28px rgba(93,22,22,.35); }

        .footer {
          position:fixed; bottom:0; left:0; right:0; z-index:40;
          padding:10px 16px 20px;
          background:linear-gradient(to top,rgba(245,237,224,.98) 65%,transparent);
          backdrop-filter:blur(4px);
          animation:ctaUp .42s cubic-bezier(.34,1.56,.64,1);
        }
        @media(min-width:768px)  { .footer { padding:10px 28px 22px; } }
        @media(min-width:1024px) { .footer { padding:10px 48px 22px; } }
        @keyframes ctaUp { from{transform:translateY(60px);opacity:0;} to{transform:translateY(0);opacity:1;} }
        .ftr-in { max-width:900px; margin:0 auto; display:flex; gap:10px; }
        .fbtn {
          flex:1; padding:13px; border-radius:13px; border:none; cursor:pointer;
          font-family:var(--sans); font-size:13px; font-weight:700;
          -webkit-tap-highlight-color:transparent;
          transition:transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s;
        }
        .fbtn:active { transform:scale(.97); }
        .fbtn-add {
          background:linear-gradient(135deg,rgba(200,169,81,.16),rgba(212,183,110,.1));
          border:1.5px solid rgba(200,169,81,.38); color:var(--c);
        }
        .fbtn-add:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(200,169,81,.22); }
        .fbtn-done {
          background:linear-gradient(135deg,#166534,#14532d);
          border:1.5px solid rgba(34,197,94,.28); color:#fff;
          box-shadow:0 5px 18px rgba(20,83,45,.28);
        }
        .fbtn-done:hover { transform:translateY(-2px); box-shadow:0 10px 26px rgba(20,83,45,.38); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
      `}</style>

      <div className="pg" style={{ paddingBottom: 88 }}>

        <header className="hdr">
          <div className="gl" />
          <div className="hi">
            <button className="bbtn" onClick={() => router.push("/customer/menu")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Menu
            </button>
            <div className="ht">
              <p className="ht-text">Order Tracking</p>
              <p className="ht-sub">{customer.name}</p>
            </div>
            <div className="hs" />
          </div>
          <div className="gl2" />
        </header>

        <div className="bd" style={{ paddingTop: 22 }}>

          {/* FIX: Show spinner while waiting for orderId to resolve from localStorage */}
          {!orderId && (
            <div className="waiting">
              <div className="spin" />
              <p style={{ fontFamily:"var(--sans)", fontSize:13, color:"rgba(93,22,22,.5)" }}>
                Looking for your order…
              </p>
            </div>
          )}

          {/* Show error banner if fetch failed but we have an orderId */}
          {orderId && fetchError && (
            <div className="err-banner">
              ⚠️ {fetchError}
            </div>
          )}

          {/* Only show "no active orders" if orderId is definitely absent */}
          {orderId && orders.length === 0 && !fetchError && (
            <div className="waiting">
              <div className="spin" />
              <p style={{ fontFamily:"var(--sans)", fontSize:13, color:"rgba(93,22,22,.5)" }}>
                Loading order details…
              </p>
            </div>
          )}

          {/* True empty state — no orderId found after polling */}
          {!orderId && (
            /* shown only after the polling window closes — handled by the waiting spinner above */
            null
          )}

          {orders.length > 0 && (
            <>
              <p className="s-eye">Live Tracking</p>
              <p className="s-title">Your Orders</p>
              <div className="s-rule" />

              <div className="gcard">
                <div className="gavatar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF8E1" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="gfields">
                  <p className="gfv">{customer.name}</p>
                  {customer.mobile && (
                    <p className="gfv" style={{ fontSize:14, color:"rgba(93,22,22,.55)", fontFamily:"var(--sans)", fontWeight:500 }}>
                      {customer.mobile}
                    </p>
                  )}
                </div>
              </div>

              {orders.map((order, oi) => {
                const step = animSteps[order.id] ?? -1;
                const chipStyle = step >= 3
                  ? { color:"#166534", background:"rgba(22,101,52,.1)" }
                  : step >= 2
                  ? { color:"#92400e", background:"rgba(146,64,14,.1)" }
                  : { color:"var(--cm)", background:"rgba(93,22,22,.08)" };

                return (
                  <div key={order.id} className="ocard" style={{ animationDelay:`${oi * 80}ms` }}>
                    <div className="cgline" />

                    <div className="oc-top">
                      <span className="oc-badge">
                        <span className="live" />
                        Order #{String(order.id).slice(-4)}
                      </span>
                      <span className="oc-status-chip" style={chipStyle}>
                        {order.status || "PLACED"}
                      </span>
                    </div>

                    <div className="oc-cols">
                      <div className="oc-left">
                        {STEPS.map((s, si) => {
                          const isDone   = step > si;
                          const isActive = step === si;
                          const isLast   = si === STEPS.length - 1;
                          return (
                            <div key={si} className="step-row">
                              {!isLast && (
                                <div className={`step-conn${isDone ? " done" : ""}`} />
                              )}
                              <div
                                className={`step-circ${isDone ? " done" : isActive ? " active" : ""}`}
                                style={{ transitionDelay:`${si * 70}ms` }}
                              >
                                <StepIcon index={si} />
                              </div>
                              <div className="step-body">
                                <p className={`step-lbl${isDone ? " done" : isActive ? " active" : ""}`}>
                                  {s.label}
                                </p>
                                <p className={`step-sub2${isDone ? " done" : isActive ? " active" : ""}`}>
                                  {s.sub}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="oc-right">
                        <p className="oc-right-title">Items Ordered</p>
                        {order.items?.map((item: any, ii: number) => (
                          <div key={item.id ?? ii} className="item-row" style={{ animationDelay:`${ii * 55}ms` }}>
                            <div>
                              <p className="item-name">{item.name}</p>
                              <p className="item-qty">× {item.quantity}</p>
                            </div>
                            <p className="item-price">₹{Number(item.total_price).toFixed(0)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="totals">
                      <div className="trow">
                        <span>Subtotal</span>
                        <span style={{ fontWeight:600, color:"var(--c)" }}>₹{Number(order.subtotal).toFixed(0)}</span>
                      </div>
                      {order.gst_pct > 0 && (
                        <div className="trow">
                          <span>GST ({order.gst_pct}%)</span>
                          <span style={{ fontWeight:600, color:"var(--c)" }}>₹{Number(order.gst).toFixed(0)}</span>
                        </div>
                      )}
                      <div className="tdiv" />
                      <div className="trow-final">
                        <span className="trow-lbl">Total</span>
                        <span className="trow-val">₹{Number(order.total).toFixed(0)}</span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="footer">
          <div className="ftr-in">
            <button className="fbtn fbtn-add" onClick={() => router.push("/customer/menu")}>+ Add More</button>
            <button className="fbtn fbtn-done" onClick={() => router.push("/customer/scan-qr")}>Done</button>
          </div>
        </div>

      </div>
    </>
  );
}
