"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string | null;
  qty: number;
}

export default function CartPage() {

  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("Guest");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
  const name = localStorage.getItem("customerName") || "Guest";
  const table = localStorage.getItem("tableNumber") || "";

  console.log("Customer Name:", name);
  console.log("Table Number:", table);

  setCustomerName(name);

  const token = localStorage.getItem("customerJWT");

if (!token || !table) {
  router.push("/customer/scan-qr");
  return;
}
  const key = `currentCart_${table}_${name}`;
  console.log("Generated Cart Key:", key);

  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      const parsedCart = JSON.parse(stored);
      console.log("Cart loaded from localStorage:", parsedCart);
      setCart(parsedCart);
    } catch (error) {
      console.log("Cart JSON parse failed:", error);
      setCart([]);
    }
  } else {
    console.log("No saved cart found for key:", key);
    setCart([]);
  }

  setMounted(true);
}, []);

 const saveCart = (updated: CartItem[]) => {
  setCart(updated);

  const name =
    localStorage.getItem("customerName") || customerName || "Guest";

  const table =
    localStorage.getItem("tableNumber") || "1";

  const cartKey = `currentCart_${table}_${name}`;

  console.log("Saving cart to:", cartKey);
  console.log("Updated cart:", updated);

  localStorage.setItem(cartKey, JSON.stringify(updated));
};

  const incQty = (id: string) => {
  console.log("Increasing qty for item:", id);

  saveCart(
    cart.map((i) =>
      i.id === id ? { ...i, qty: i.qty + 1 } : i
    )
  );
};

const decQty = (id: string) => {
  console.log("Decreasing qty for item:", id);

  saveCart(
    cart
      .map((i) =>
        i.id === id ? { ...i, qty: i.qty - 1 } : i
      )
      .filter((i) => i.qty > 0)
  );
};

const delItem = (id: string) => {
  console.log("Deleting item:", id);

  saveCart(cart.filter((i) => i.id !== id));
};

  const subtotal = cart.reduce((s, i) => s + parseFloat(i.price) * i.qty, 0);

  console.log("Current cart state:", cart);
console.log("Subtotal:", subtotal);
console.log("Mounted:", mounted);

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

        .hdr{
          background:linear-gradient(150deg,#3A0B0B 0%,#5D1616 45%,#6E1A1A 80%,#4A1010 100%);
          position:sticky;top:0;z-index:50;transition:box-shadow .35s;
        }
        .hdr.raised{box-shadow:0 8px 36px rgba(0,0,0,.5);}
        .gl{height:2px;background:linear-gradient(90deg,transparent,rgba(200,169,81,.3) 20%,#C8A951 50%,rgba(200,169,81,.3) 80%,transparent);}
        .gl2{height:1px;background:linear-gradient(90deg,transparent,rgba(200,169,81,.55),transparent);}
        .hdr-inner{
          max-width:1280px;margin:0 auto;
          padding:12px 16px 14px;
          display:flex;align-items:center;gap:12px;
        }
        @media(min-width:768px){.hdr-inner{padding:14px 32px;}}

        .back-btn{
          display:flex;align-items:center;gap:6px;
          padding:9px 16px;border-radius:11px;border:none;cursor:pointer;
          background:rgba(12,2,4,.52);
          border:1.5px solid rgba(200,169,81,.38);
          color:#fff;font-family:var(--sans);font-size:13px;font-weight:600;
          -webkit-tap-highlight-color:transparent;
          transition:all .25s cubic-bezier(.23,1,.32,1);
          flex-shrink:0;
          backdrop-filter:blur(8px);
        }
        .back-btn:hover{background:rgba(30,5,8,.8);border-color:var(--g);transform:translateX(-2px);}
        .back-btn:active{transform:scale(.96);}

        .hdr-title{
          flex:1;text-align:center;
        }
        .hdr-title-text{
          font-family:var(--serif);font-style:italic;font-size:20px;color:#FFF8E1;
        }
        .hdr-sub{
          font-family:var(--sans);font-size:10px;
          color:rgba(200,169,81,.6);letter-spacing:.16em;text-transform:uppercase;
          margin-top:1px;
        }

        .hdr-spacer{flex-shrink:0;width:80px;}

        .body{max-width:860px;margin:0 auto;padding:0 16px;}
        @media(min-width:768px){.body{padding:0 32px;}}
        @media(min-width:1024px){.body{padding:0 48px;max-width:900px;}}

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
        .empty-btn:hover{transform:scale(1.05);box-shadow:0 10px 28px rgba(93,22,22,.35);}

        .eyebrow{font-family:var(--sans);font-size:10px;font-weight:600;color:rgba(200,169,81,.65);letter-spacing:.18em;text-transform:uppercase;margin-bottom:2px;}
        .sec-title{font-family:var(--serif);font-style:italic;font-size:22px;color:var(--c);}
        .rule{height:1px;margin:8px 0 16px;background:linear-gradient(90deg,transparent,rgba(200,169,81,.38),transparent);}

        .cart-card{
          background:var(--card);
          border:1.5px solid rgba(200,169,81,.2);
          border-radius:18px;overflow:hidden;
          opacity:0;transform:translateY(20px);
          animation:fadeUp .5s cubic-bezier(.23,1,.32,1) both;
          transition:box-shadow .35s,border-color .35s,transform .35s;
        }
        .cart-card:hover{
          border-color:rgba(200,169,81,.45);
          box-shadow:0 12px 40px rgba(93,22,22,.1);
          transform:translateY(-2px);
        }

        .cgline{height:2px;width:0;background:linear-gradient(90deg,transparent,var(--g),transparent);transition:width .42s;margin:0 auto;}
        .cart-card:hover .cgline{width:100%;}

        .card-inner{padding:14px 14px 16px;}
        @media(min-width:768px){.card-inner{padding:16px 18px 18px;}}

        .card-row{display:flex;gap:14px;}

        .item-img{
          flex-shrink:0;width:84px;height:84px;
          border-radius:12px;overflow:hidden;
          border:1.5px solid rgba(200,169,81,.3);
          position:relative;
        }
        @media(min-width:768px){.item-img{width:96px;height:96px;border-radius:14px;}}
        .item-img img{transition:transform .5s cubic-bezier(.23,1,.32,1);}
        .cart-card:hover .item-img img{transform:scale(1.07);}

        .item-info{flex:1;min-width:0;}
        .item-name{font-family:var(--serif);font-size:16px;color:var(--c);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:2px;}
        .item-desc{font-family:var(--sans);font-size:11px;color:rgba(93,22,22,.5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:10px;}

        .del-btn{
          flex-shrink:0;width:30px;height:30px;border-radius:8px;border:none;cursor:pointer;
          background:rgba(185,28,28,.08);color:#b91c1c;
          display:flex;align-items:center;justify-content:center;
          -webkit-tap-highlight-color:transparent;
          transition:background .2s,transform .25s cubic-bezier(.34,1.56,.64,1);
        }
        .del-btn:hover{background:rgba(185,28,28,.15);transform:scale(1.12);}
        .del-btn:active{transform:scale(.9);}

        .price-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;}

        .qwrap{
          display:flex;align-items:center;
          height:34px;border-radius:10px;overflow:hidden;
          background:rgba(200,169,81,.1);
          border:1.5px solid rgba(200,169,81,.35);
        }
        .qbtn{
          width:34px;height:100%;display:flex;align-items:center;justify-content:center;
          background:linear-gradient(135deg,var(--cm),var(--c));
          color:var(--g);font-size:17px;font-weight:700;border:none;cursor:pointer;
          -webkit-tap-highlight-color:transparent;
          transition:transform .25s cubic-bezier(.34,1.56,.64,1),background .2s;flex-shrink:0;
        }
        .qbtn:hover{background:linear-gradient(135deg,#8B2F2F,#6D1616);transform:scale(1.12);}
        .qbtn:active{transform:scale(.9);}
        .qnum{padding:0 10px;min-width:28px;text-align:center;font-family:var(--sans);font-size:14px;font-weight:700;color:var(--c);}

        .iprice-wrap{text-align:right;}
        .iprice-unit{font-family:var(--sans);font-size:11px;color:rgba(93,22,22,.45);margin-bottom:1px;}
        .iprice{font-family:var(--serif);font-size:20px;color:var(--cd);}

        .total-card{
          background:linear-gradient(135deg,rgba(200,169,81,.12) 0%,rgba(212,183,110,.08) 100%);
          border:1.5px solid rgba(200,169,81,.35);
          border-radius:18px;padding:18px 20px;
          margin-top:20px;margin-bottom:24px;
          animation:fadeUp .6s .25s cubic-bezier(.23,1,.32,1) both;
        }
        .total-row{display:flex;justify-content:space-between;align-items:center;font-family:var(--sans);font-size:13px;color:rgba(93,22,22,.7);padding:4px 0;}
        .total-final{font-family:var(--serif);font-size:22px;color:var(--cd);}
        .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(200,169,81,.4),transparent);margin:10px 0;}

        .cta-wrap{
          position:fixed;bottom:0;left:0;right:0;z-index:40;
          padding:10px 16px 22px;
          background:linear-gradient(to top,rgba(250,245,236,.98) 65%,transparent);
          backdrop-filter:blur(4px);
          animation:ctaUp .42s cubic-bezier(.34,1.56,.64,1);
        }
        @media(min-width:768px){.cta-wrap{padding:12px 32px 24px;}}
        @keyframes ctaUp{from{transform:translateY(70px);opacity:0;}to{transform:translateY(0);opacity:1;}}
        .cta-inner{max-width:860px;margin:0 auto;}

        .proceed-btn{
          width:100%;display:flex;align-items:center;justify-content:space-between;
          padding:15px 22px;border-radius:16px;border:none;cursor:pointer;
          background:linear-gradient(135deg,#6E1A1A 0%,#4A1010 50%,#6E1A1A 100%);
          background-size:200% 100%;
          border:1.5px solid rgba(200,169,81,.42);
          box-shadow:0 8px 32px rgba(45,10,15,.4),inset 0 1px 0 rgba(200,169,81,.18);
          -webkit-tap-highlight-color:transparent;
          transition:transform .3s,box-shadow .3s,background-position .4s;
          position:relative;overflow:hidden;
        }
        .proceed-btn::after{
          content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(200,169,81,.12),transparent);
          transition:left .7s cubic-bezier(.23,1,.32,1);
        }
        .proceed-btn:hover::after{left:150%;}
        .proceed-btn:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(45,10,15,.5);background-position:right center;}
        .proceed-btn:active{transform:scale(.98);}
        .proceed-lbl{font-family:var(--sans);font-size:15px;font-weight:700;color:#fff;letter-spacing:.06em;}
        .proceed-amt{font-family:var(--serif);font-size:18px;color:var(--g);}

        @keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
      `}</style>

      <div className="page" style={{ paddingBottom: cart.length > 0 ? 96 : 28 }}>

        {/* HEADER */}
        <header className="hdr">
          <div className="gl" />
          <div className="hdr-inner">
            <button className="back-btn" onClick={() => router.push("/customer/menu")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Menu
            </button>

            <div className="hdr-title">
              <p className="hdr-title-text">My Cart</p>
              <p className="hdr-sub">{customerName}</p>
            </div>

            <div className="hdr-spacer" />
          </div>
          <div className="gl2" />
        </header>

        {/* BODY */}
        <div className="body" style={{ paddingTop: 20 }}>

          {/* EMPTY */}
          {mounted && cart.length === 0 && (
            <div className="empty">
              <div className="empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(93,22,22,.35)" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              <p className="empty-title">Your cart is empty</p>
              <p className="empty-sub">Add items from the menu to get started</p>
              <button className="empty-btn" onClick={() => router.push("/customer/menu")}>Browse Menu</button>
            </div>
          )}

          {/* ITEMS */}
          {cart.length > 0 && (<>
            <p className="eyebrow">Your Order</p>
            <p className="sec-title">Cart Summary</p>
            <div className="rule" />

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {cart.map((item, idx) => (
                <div
                  key={item.id}
                  className="cart-card"
                  style={{ animationDelay: `${idx * 70}ms` }}
                >
                  <div className="cgline" />
                  <div className="card-inner">
                    <div className="card-row">

                      {/* image */}
                      <div className="item-img">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,rgba(200,169,81,.15),rgba(93,22,22,.08))" }} />
                        )}
                      </div>

                      {/* info */}
                      <div className="item-info">
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p className="item-name">{item.name}</p>
                            <p className="item-desc">{item.description}</p>
                          </div>
                          <button className="del-btn" onClick={() => delItem(item.id)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>

                        <div className="price-row">
                          <div className="qwrap">
                            <button className="qbtn" onClick={() => decQty(item.id)}>−</button>
                            <span className="qnum">{item.qty}</span>
                            <button className="qbtn" onClick={() => incQty(item.id)}>+</button>
                          </div>
                          <div className="iprice-wrap">
                            <p className="iprice-unit">₹{parseFloat(item.price).toFixed(0)} × {item.qty}</p>
                            <p className="iprice">₹{(parseFloat(item.price) * item.qty).toFixed(0)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>)}

          {/* ORDER TOTAL */}
          {cart.length > 0 && (
            <div className="total-card">
              <p style={{ fontFamily: "var(--sans)", fontSize: 11, fontWeight: 600, color: "rgba(200,169,81,.65)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 12 }}>
                Order Total
              </p>
              {cart.map(item => (
                <div className="total-row" key={item.id}>
                  <span>{item.name} × {item.qty}</span>
                  <span style={{ fontWeight: 600, color: "var(--c)" }}>
                    ₹{(parseFloat(item.price) * item.qty)}
                  </span>
                </div>
              ))}
              <div className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600, color: "var(--c)" }}>Total</span>
                <span className="total-final">₹{subtotal.toFixed(0)}</span>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div className="cta-wrap">
            <div className="cta-inner">
              <button className="proceed-btn" onClick={() => router.push("/customer/payment")}>
                <span className="proceed-lbl">Proceed to Payment</span>
                <span className="proceed-amt">₹{subtotal.toFixed(0)}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
