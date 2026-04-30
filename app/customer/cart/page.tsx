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

  // Load cart from localStorage
  useEffect(() => {
    const name = localStorage.getItem("customerName") || "Guest";
    const table = localStorage.getItem("tableNumber") || "";

    setCustomerName(name);

    if (name && table) {
      const key = `currentCart_${table}_${name}`;
      const stored = localStorage.getItem(key);

      if (stored) {
        try {
          setCart(JSON.parse(stored));
        } catch {
          console.warn("Invalid cart data");
        }
      }
    }

    setMounted(true);
  }, []);

  // Save cart to localStorage
  const saveCart = (updated: CartItem[]) => {
    setCart(updated);

    const name = localStorage.getItem("customerName") || "";
    const table = localStorage.getItem("tableNumber") || "";

    if (name && table) {
      localStorage.setItem(
        `currentCart_${table}_${name}`,
        JSON.stringify(updated)
      );
    }
  };

  const incQty = (id: string) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, qty: item.qty + 1 } : item
    );
    saveCart(updated);
  };

  const decQty = (id: string) => {
    const updated = cart
      .map((item) =>
        item.id === id ? { ...item, qty: item.qty - 1 } : item
      )
      .filter((item) => item.qty > 0);

    saveCart(updated);
  };

  const delItem = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    saveCart(updated);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.qty,
    0
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF5EC",
        padding: "20px",
        paddingBottom: cart.length > 0 ? "100px" : "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <button onClick={() => router.push("/customer/menu")}>← Menu</button>
        <h2 style={{ margin: 0 }}>My Cart ({customerName})</h2>
      </div>

      {/* Empty cart */}
      {mounted && cart.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 80 }}>
          <h2>Your cart is empty</h2>
          <p>Add items from menu</p>
          <button onClick={() => router.push("/customer/menu")}>
            Browse Menu
          </button>
        </div>
      )}

      {/* Cart items */}
      {cart.length > 0 && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: 16,
                  background: "white",
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 90,
                    height: 90,
                    position: "relative",
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "#eee",
                  }}
                >
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : null}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0 }}>{item.name}</h3>
                  <p style={{ margin: "4px 0", fontSize: 13 }}>
                    {item.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 12,
                    }}
                  >
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => decQty(item.id)}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => incQty(item.id)}>+</button>
                    </div>

                    <strong>
                      ₹{(parseFloat(item.price) * item.qty).toFixed(0)}
                    </strong>
                  </div>
                </div>

                <button onClick={() => delItem(item.id)}>✕</button>
              </div>
            ))}
          </div>

          {/* Total */}
          <div
            style={{
              marginTop: 24,
              background: "white",
              padding: 20,
              borderRadius: 12,
            }}
          >
            <h3>Total: ₹{subtotal.toFixed(0)}</h3>
          </div>

          {/* Footer */}
          <div
            style={{
              position: "fixed",
              bottom: 20,
              left: 20,
              right: 20,
            }}
          >
            <button
              onClick={() => router.push("/customer/payment")}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: 16,
                fontWeight: 700,
                borderRadius: 12,
                border: "none",
                background: "#5D1616",
                color: "#fff",
              }}
            >
              Proceed to Payment — ₹{subtotal.toFixed(0)}
            </button>
          </div>
        </>
      )}
    </div>
  );
}