"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://pos-backend-s380.onrender.com";
const PARCEL_CHARGE = 20;

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("customerJWT") : null;

export default function PaymentPage() {
  const router = useRouter();
  const [cart, setCart]         = useState<any[]>([]);
  const [customer, setCustomer] = useState({ name: "", mobile: "", table: "" });
  const [loading, setLoading]   = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  // ── fetch cart from API (same as CartPage) ──
  const fetchCart = async () => {
    const token = getToken();
    if (!token) { router.push("/customer/scan-qr"); return; }

    try {
      const res  = await fetch(`${BASE_URL}/api/customer/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      console.log("🛒 Payment cart API response:", JSON.stringify(json, null, 2));

      if (!res.ok || !json.success) throw new Error(json?.message || "Failed to fetch cart");

      const rawItems: any[] = json.data?.items ?? json.data ?? json.items ?? [];
      const items = rawItems.map((i: any) => ({
        id:          i.menu_item_id ?? i.id ?? i.item_id,
        name:        i.name         ?? i.item_name ?? i.menu_item?.name ?? "",
        description: i.description  ?? i.menu_item?.description ?? "",
        price:       String(i.price ?? i.unit_price ?? i.menu_item?.price ?? 0),
        image_url:   i.image_url    ?? i.menu_item?.image_url ?? null,
        qty:         i.quantity     ?? i.qty ?? 1,
        notes:       i.notes        ?? i.note ?? "",
        parcel:      i.parcel       ?? false,
      }));

      setCart(items);
    } catch (err: any) {
      console.error("Cart fetch error:", err);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    const token  = localStorage.getItem("customerJWT");
    const name   = localStorage.getItem("customerName")  || "Guest";
    const mobile = localStorage.getItem("customerMobile") || "";
    const table  = localStorage.getItem("tableNumber")    || "";

    if (!token || !table) {
      router.push("/customer/scan-qr");
      return;
    }

    setCustomer({ name, mobile, table });
    fetchCart();
  }, []);

  const placeOrder = async () => {
    if (!cart.length) return alert("Cart is empty");
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        alert("Session expired. Please login again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/customer/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map(item => ({ menu_item_id: item.id, quantity: item.qty })),
        }),
      });

      const res = await response.json();
      console.log("🧾 Place order API response:", JSON.stringify(res, null, 2));

      if (!response.ok || !res.success) {
        throw new Error(res?.message || "Order failed");
      }

      const orderId =
        res.data?.order_id   ??
        res.data?.id         ??
        res.data?.order?.id  ??
        res.order_id         ??
        res.id               ??
        null;

      console.log("✅ Placed order ID:", orderId);

      if (orderId) {
        localStorage.setItem("lastOrderId", String(orderId));
        setPlacedOrderId(String(orderId));
      }

      setCart([]);
      setShowConfirm(true);
    } catch (error: any) {
      console.error("❌ placeOrder error:", error);
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goToTracking = () => {
    if (placedOrderId) {
      localStorage.setItem("lastOrderId", placedOrderId);
    }
    router.push("/customer/order-status");
  };

  const subtotal = cart.reduce(
    (s, i) => s + parseFloat(i.price) * i.qty + (i.parcel ? PARCEL_CHARGE * i.qty : 0),
    0
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{-webkit-text-size-adjust:100%;}
        :root{
          --c:#5D1616;--cd:#3D0D0D;--cm:#7B1F1F;
          --g:#C8A951;--gl:#E2C97A;--ink:#2D0A0F;
          --bg:#FAF5EC;--card:#FFFDF8;
          --serif:'DM Serif Display',Georgia,serif;
          --sans:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif;
        }

        .page{min-height:100vh;background:linear-gradient(155deg,#FAF5EC 0%,#F2E9D8 55%,#FAF5EC 100%);}

        .hdr{background:linear-gradient(150deg,#3A0B0B 0%,#5D1616 45%,#6E1A1A 80%,#4A1010 100%);position:sticky;top:0;z-index:50;}
        .gl{height:2px;background:linear-gradient(90deg,transparent,rgba(200,169,81,.3) 20%,#C8A951 50%,rgba(200,169,81,.3) 80%,transparent);}
        .gl2{height:1px;background:linear-gradient(90deg,transparent,rgba(200,169,81,.55),transparent);}
        .hdr-inner{max-width:1280px;margin:0 auto;padding:12px 16px 14px;display:flex;align-items:center;gap:12px;}
        @media(min-width:768px){.hdr-inner{padding:14px 32px;}}

        .back-btn{
          display:flex;align-items:center;gap:6px;
          padding:9px 16px;border-radius:11px;border:none;cursor:pointer;
          background:rgba(12,2,4,.52);border:1.5px solid rgba(200,169,81,.38);
          color:#fff;font-family:var(--sans);font-size:13px;font-weight:600;
          flex-shrink:0;backdrop-filter:blur(8px);
          -webkit-tap-highlight-color:transparent;
          transition:all .25s cubic-bezier(.23,1,.32,1);
        }
        .back-btn:hover{background:rgba(30,5,8,.8);border-color:var(--g);transform:translateX(-2px);}
        .back-btn:active{transform:scale(.96);}

        .hdr-title{flex:1;text-align:center;}
        .hdr-title-text{font-family:var(--serif);font-style:italic;font-size:20px;color:#FFF8E1;}
        .hdr-sub{font-family:var(--sans);font-size:10px;color:rgba(200,169,81,.6);letter-spacing:.16em;text-transform:uppercase;margin-top:1px;}
        .hdr-spacer{flex-shrink:0;width:80px;}

        .body{max-width:860px;margin:0 auto;padding:0 16px;}
        @media(min-width:768px){.body{padding:0 32px;}}
        @media(min-width:1024px){.body{padding:0 48px;}}

        .eyebrow{font-family:var(--sans);font-size:10px;font-weight:600;color:rgba(200,169,81,.65);letter-spacing:.18em;text-transform:uppercase;margin-bottom:2px;}
        .sec-title{font-family:var(--serif);font-style:italic;font-size:22px;color:var(--c);}
        .rule{height:1px;margin:8px 0 16px;background:linear-gradient(90deg,transparent,rgba(200,169,81,.38),transparent);}

        .empty{
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          min-height:55vh;gap:16px;
          animation:fadeUp .6s cubic-bezier(.23,1,.32,1) both;
        }
        .empty-icon{
          width:96px;height:96px;border-radius:50%;
          background:linear-gradient(135deg,rgba(200,169,81,.15),rgba(212,183,110,.1));
          border:2px solid rgba(200,169,81,.25);
          display:flex;align-items:center;justify-content:center;
        }
        .empty-title{font-family:var(--serif);font-style:italic;font-size:24px;color:var(--c);}
        .empty-sub{font-family:var(--sans);font-size:13px;color:rgba(93,22,22,.55);text-align:center;}
        .empty-btn{
          padding:12px 28px;border-radius:12px;border:none;cursor:pointer;
          background:linear-gradient(135deg,var(--cm),var(--c));
          color:var(--g);font-family:var(--sans);font-size:13px;font-weight:700;
          letter-spacing:.06em;
          transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;
          box-shadow:0 6px 20px rgba(93,22,22,.25);
        }
        .empty-btn:hover{transform:scale(1.05);}

        .summary-card{
          background:var(--card);border:1.5px solid rgba(200,169,81,.2);
          border-radius:18px;overflow:hidden;
          animation:fadeUp .5s cubic-bezier(.23,1,.32,1) both;
        }
        .cgline{height:2px;width:0;background:linear-gradient(90deg,transparent,var(--g),transparent);transition:width .42s;margin:0 auto;}
        .summary-card:hover .cgline{width:100%;}
        .summary-inner{padding:16px 18px;}

        .order-item{
          display:flex;justify-content:space-between;align-items:flex-start;
          padding:12px 0;border-bottom:1px solid rgba(200,169,81,.15);
          animation:fadeUp .5s cubic-bezier(.23,1,.32,1) both;
          transition:background .2s;
        }
        .order-item:last-child{border-bottom:none;}
        .order-item:hover{background:rgba(200,169,81,.03);}
        .order-item-name{font-family:var(--serif);font-size:15px;color:var(--c);}
        .order-item-qty{font-family:var(--sans);font-size:12px;color:rgba(93,22,22,.5);margin-top:2px;}
        .order-item-note{font-family:var(--sans);font-size:11px;color:rgba(93,22,22,.45);margin-top:3px;font-style:italic;}
        .order-item-parcel{
          display:inline-flex;align-items:center;gap:4px;
          font-family:var(--sans);font-size:10px;font-weight:600;
          background:rgba(200,169,81,.18);color:var(--cm);
          padding:2px 8px;border-radius:100px;margin-top:4px;
        }
        .order-item-price{font-family:var(--serif);font-size:18px;color:var(--cd);text-align:right;flex-shrink:0;margin-left:12px;}

        .total-strip{
          background:linear-gradient(135deg,rgba(200,169,81,.12),rgba(212,183,110,.08));
          border-top:1.5px solid rgba(200,169,81,.3);
          padding:14px 18px;display:flex;justify-content:space-between;align-items:center;
        }
        .total-label{font-family:var(--sans);font-size:12px;font-weight:600;color:var(--c);letter-spacing:.06em;text-transform:uppercase;}
        .total-amount{font-family:var(--serif);font-size:24px;color:var(--cd);}

        .actions-wrap{
          position:fixed;bottom:0;left:0;right:0;z-index:40;
          padding:10px 16px 22px;
          background:linear-gradient(to top,rgba(250,245,236,.98) 65%,transparent);
          backdrop-filter:blur(4px);
          animation:ctaUp .42s cubic-bezier(.34,1.56,.64,1);
        }
        @media(min-width:768px){.actions-wrap{padding:12px 32px 24px;}}
        @keyframes ctaUp{from{transform:translateY(70px);opacity:0;}to{transform:translateY(0);opacity:1;}}
        .actions-inner{max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:10px;}

        .cancel-btn{
          width:100%;padding:13px;border-radius:13px;cursor:pointer;
          background:transparent;border:1.5px solid rgba(93,22,22,.25);
          color:rgba(93,22,22,.65);font-family:var(--sans);font-size:13px;font-weight:600;
          -webkit-tap-highlight-color:transparent;
          transition:border-color .25s,color .25s,transform .25s;
        }
        .cancel-btn:hover{border-color:rgba(93,22,22,.45);color:var(--c);transform:translateY(-1px);}
        .cancel-btn:active{transform:scale(.98);}

        .confirm-btn{
          width:100%;display:flex;align-items:center;justify-content:center;gap:10px;
          padding:15px 22px;border-radius:16px;border:none;cursor:pointer;
          background:linear-gradient(135deg,#166534 0%,#14532d 50%,#166534 100%);
          background-size:200% 100%;
          border:1.5px solid rgba(34,197,94,.35);
          box-shadow:0 8px 32px rgba(20,83,45,.35),inset 0 1px 0 rgba(134,239,172,.15);
          -webkit-tap-highlight-color:transparent;
          transition:transform .3s,box-shadow .3s,background-position .4s;
          position:relative;overflow:hidden;
        }
        .confirm-btn:disabled{opacity:.6;cursor:not-allowed;}
        .confirm-btn::after{
          content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(134,239,172,.1),transparent);
          transition:left .7s cubic-bezier(.23,1,.32,1);
        }
        .confirm-btn:hover:not(:disabled)::after{left:150%;}
        .confirm-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 36px rgba(20,83,45,.45);background-position:right center;}
        .confirm-btn:active:not(:disabled){transform:scale(.98);}
        .confirm-lbl{font-family:var(--sans);font-size:15px;font-weight:700;color:#fff;letter-spacing:.06em;}

        .loading-overlay{
          position:fixed;inset:0;z-index:60;
          background:linear-gradient(135deg,#3A0B0B 0%,#2D0A0F 100%);
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;
          animation:fadeIn .4s;
        }
        .spinner-ring{
          width:72px;height:72px;border-radius:50%;
          border:3px solid rgba(200,169,81,.2);border-top-color:var(--g);
          animation:spin .8s linear infinite;
        }
        @keyframes spin{to{transform:rotate(360deg);}}
        .loading-title{font-family:var(--serif);font-style:italic;font-size:26px;color:#FFF8E1;animation:pulse 2s ease-in-out infinite;}
        .loading-sub{font-family:var(--sans);font-size:13px;color:rgba(232,220,200,.6);letter-spacing:.04em;}
        @keyframes pulse{0%,100%{opacity:.8;}50%{opacity:1;}}

        .confirm-overlay{
          position:fixed;inset:0;z-index:60;
          background:linear-gradient(135deg,#064e3b 0%,#022c22 100%);
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
          padding:24px;animation:fadeIn .5s;
        }
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        .confirm-check{
          width:88px;height:88px;border-radius:50%;
          background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.25);
          display:flex;align-items:center;justify-content:center;
          animation:popIn .6s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes popIn{from{transform:scale(0);opacity:0;}to{transform:scale(1);opacity:1;}}
        .confirm-title{font-family:var(--serif);font-style:italic;font-size:32px;color:#fff;text-align:center;animation:fadeUp .6s .2s both;}
        .confirm-sub{font-family:var(--sans);font-size:14px;color:rgba(255,255,255,.7);text-align:center;animation:fadeUp .6s .3s both;}
        .confirm-track-btn{
          padding:14px 36px;border-radius:14px;border:none;cursor:pointer;
          background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.3);
          color:#fff;font-family:var(--sans);font-size:14px;font-weight:700;letter-spacing:.06em;
          display:flex;align-items:center;gap:8px;
          -webkit-tap-highlight-color:transparent;
          animation:fadeUp .6s .45s both;
          transition:background .25s,transform .3s cubic-bezier(.34,1.56,.64,1);
        }
        .confirm-track-btn:hover{background:rgba(255,255,255,.25);transform:scale(1.04);}
        .confirm-track-btn:active{transform:scale(.97);}

        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}

        /* cart loading spinner */
        @keyframes spin{to{transform:rotate(360deg);}}
        .spin{width:40px;height:40px;border-radius:50%;border:2px solid rgba(200,169,81,.18);border-top-color:var(--g);animation:spin .75s linear infinite;}
      `}</style>

      <div className="page" style={{ paddingBottom: cart.length > 0 && !showConfirm ? 140 : 28 }}>

        {/* HEADER */}
        <header className="hdr">
          <div className="gl" />
          <div className="hdr-inner">
            <button className="back-btn" onClick={() => router.push("/customer/cart")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Cart
            </button>
            <div className="hdr-title">
              <p className="hdr-title-text">Payment</p>
              <p className="hdr-sub">{customer.name}</p>
            </div>
            <div className="hdr-spacer" />
          </div>
          <div className="gl2" />
        </header>

        {/* BODY */}
        <div className="body" style={{ paddingTop: 22 }}>

          {/* Cart loading */}
          {cartLoading && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:64, gap:16 }}>
              <div className="spin" />
              <p style={{ fontFamily:"var(--sans)", fontSize:11, color:"var(--c)", opacity:.55, letterSpacing:".16em" }}>LOADING ORDER…</p>
            </div>
          )}

          {/* Empty cart fallback */}
          {!cartLoading && cart.length === 0 && !showConfirm && (
            <div className="empty">
              <div className="empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(93,22,22,.35)" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              <p className="empty-title">Nothing to pay for</p>
              <p className="empty-sub">Your cart is empty. Add some items first.</p>
              <button className="empty-btn" onClick={() => router.push("/customer/menu")}>Browse Menu</button>
            </div>
          )}

          {/* Order summary */}
          {!cartLoading && cart.length > 0 && (
            <>
              <p className="eyebrow">Confirm Your Order</p>
              <p className="sec-title">Order Summary</p>
              <div className="rule" />

              <div className="summary-card">
                <div className="cgline" />
                <div className="summary-inner">
                  {cart.map((item, idx) => (
                    <div key={idx} className="order-item" style={{ animationDelay:`${idx * 70}ms` }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p className="order-item-name">{item.name}</p>
                        <p className="order-item-qty">Qty: {item.qty}</p>
                        {item.notes && <p className="order-item-note">&ldquo;{item.notes}&rdquo;</p>}
                        {item.parcel && (
                          <span className="order-item-parcel">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                            </svg>
                            Parcel
                          </span>
                        )}
                      </div>
                      <p className="order-item-price">
                        ₹{(parseFloat(item.price) * item.qty + (item.parcel ? PARCEL_CHARGE * item.qty : 0)).toFixed(0)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="total-strip">
                  <span className="total-label">Total Amount</span>
                  <span className="total-amount">₹{subtotal.toFixed(0)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ACTION BUTTONS */}
        {!cartLoading && cart.length > 0 && !showConfirm && (
          <div className="actions-wrap">
            <div className="actions-inner">
              <button className="cancel-btn" onClick={() => router.push("/customer/menu")}>
                Cancel Order
              </button>
              <button className="confirm-btn" onClick={placeOrder} disabled={loading}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                <span className="confirm-lbl">Confirm Order</span>
              </button>
            </div>
          </div>
        )}

        {/* LOADING OVERLAY */}
        {loading && (
          <div className="loading-overlay">
            <div className="spinner-ring" />
            <p className="loading-title">Placing Your Order…</p>
            <p className="loading-sub">Preparing your royal dining experience</p>
          </div>
        )}

        {/* SUCCESS OVERLAY */}
        {showConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-check">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(134,239,172,1)" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <p className="confirm-title">Order Confirmed!</p>
            <p className="confirm-sub">Thank you — your dishes are being prepared</p>
            <button className="confirm-track-btn" onClick={goToTracking}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              Track Your Order
            </button>
          </div>
        )}
      </div>
    </>
  );
}