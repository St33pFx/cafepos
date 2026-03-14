/* ═══════════════════════════════════════
   Café POS — App Logic
   ═══════════════════════════════════════ */

// ─── Storage Helper ───
window.store = {
  get: (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ─── Data ───
const MENU = [
  { id: 1, name: "Tacos", price: 15, cat: "comida", emoji: "🌮" },
  { id: 2, name: "Quesadillas", price: 20, cat: "comida", emoji: "🫓" },
  { id: 3, name: "Sincronizada", price: 50, cat: "comida", emoji: "🧇" },
  { id: 4, name: "Pay queso", price: 25, cat: "comida", emoji: "🧀" },
  { id: 5, name: "Pay zarzamoras", price: 30, cat: "comida", emoji: "🫐" },
  { id: 6, name: "Sandwich", price: 35, cat: "comida", emoji: "🥪" },
  { id: 7, name: "Tortas", price: 50, cat: "comida", emoji: "🥖" },
  { id: 8, name: "Torta pierna/comb.", price: 60, cat: "comida", emoji: "🍖" },
  { id: 9, name: "Sándwich combinado", price: 40, cat: "comida", emoji: "🥪" },
  { id: 10, name: "Cuernitos", price: 40, cat: "comida", emoji: "🥐" },
  { id: 11, name: "Charola fruta", price: 60, cat: "comida", emoji: "🍇" },
  { id: 12, name: "Galletas integrales", price: 14, cat: "snacks", emoji: "🍪" },
  { id: 13, name: "Galletas Marinela", price: 15, cat: "snacks", emoji: "🍪" },
  { id: 14, name: "Galletas (Triki, Oreo…)", price: 20, cat: "snacks", emoji: "🍫" },
  { id: 15, name: "Cigarro", price: 8, cat: "snacks", emoji: "🚬" },
  { id: 16, name: "Agua", price: 20, cat: "bebidas", emoji: "💧" },
  { id: 17, name: "Coca", price: 27, cat: "bebidas", emoji: "🥤" },
  { id: 18, name: "Licuado chico", price: 25, cat: "bebidas", emoji: "🥛" },
  { id: 19, name: "Licuado grande", price: 40, cat: "bebidas", emoji: "🥛" },
  { id: 20, name: "Jugo naranja chico", price: 28, cat: "bebidas", emoji: "🍊" },
  { id: 21, name: "Jugo naranja grande", price: 54, cat: "bebidas", emoji: "🍊" },
  { id: 22, name: "Jugo verde", price: 30, cat: "bebidas", emoji: "🥒" },
  { id: 23, name: "Café", price: 25, cat: "bebidas", emoji: "☕" },
  { id: 24, name: "Té", price: 25, cat: "bebidas", emoji: "🍵" },
];

const CATS = [
  { key: "todos", label: "Todos", icon: "☕" },
  { key: "comida", label: "Comida", icon: "🍽" },
  { key: "bebidas", label: "Bebidas", icon: "🥤" },
  { key: "snacks", label: "Snacks", icon: "🍪" },
];

const TYPE_OPTIONS = [
  { key: "llevar", label: "Llevar", icon: "🛍" },
  { key: "aqui", label: "Aquí", icon: "🪑" },
  { key: "whatsapp", label: "WhatsApp", icon: "💬" },
];

const QUICK_PAY = [20, 50, 70, 100, 150, 200, 500];

// ─── Helpers ───
const fmt = (n) => `$${n}`;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ─── Shared inline style base ───
const baseBtn = { border: "none", cursor: "pointer", WebkitTapHighlightColor: "transparent" };

// ─── React App ───
const { useState, useEffect } = React;

function App() {
  const [tab, setTab] = useState("pos");
  const [cart, setCart] = useState([]);
  const [type, setType] = useState("llevar");
  const [cat, setCat] = useState("todos");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [dineIn, setDineIn] = useState(0);
  const [receipt, setReceipt] = useState(null);
  const [payInput, setPayInput] = useState("");
  const [name, setName] = useState("");
  const [toast, setToast] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditNote, setCreditNote] = useState("");

  // ─── Persistence ───
  useEffect(() => {
    const saved = window.store.get("cafe-pos-data");
    if (saved?.orders) {
      setOrders(saved.orders);
      setDineIn(saved.orders.filter(o => o.type === "aqui" && o.status !== "done").length);
    }
    setTimeout(() => document.getElementById("splash")?.classList.add("hide"), 600);
  }, []);

  useEffect(() => {
    window.store.set("cafe-pos-data", { orders });
  }, [orders]);

  // ─── Actions ───
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  const filtered = MENU.filter(i =>
    (cat === "todos" || i.cat === cat) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const add = (item) => {
    setCart(p => {
      const e = p.find(c => c.id === item.id);
      return e ? p.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
               : [...p, { ...item, qty: 1 }];
    });
  };

  const qtyUpdate = (id, d) => {
    setCart(p => p.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + d) } : c).filter(c => c.qty > 0));
  };

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);

  const submit = () => {
    if (!cart.length) return;
    if (type === "aqui" && dineIn >= 7) { flash("⚠️ Lleno (7/7 mesas)"); return; }
    const creditNum = creditAmount ? parseFloat(creditAmount) : 0;
    const o = {
      id: uid(), items: [...cart], total, type,
      name: name || (type === "whatsapp" ? "WhatsApp" : "Orden"),
      status: "pending",
      time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      deliveryTime: deliveryTime || null,
      saldo: creditNum > 0 ? { amount: creditNum, note: creditNote || "Saldo a favor", resolved: false } : null,
    };
    setOrders(p => [o, ...p]);
    if (type === "aqui") setDineIn(c => c + 1);
    setCart([]); setName(""); setShowCart(false); setPayInput("");
    setDeliveryTime(""); setCreditAmount(""); setCreditNote("");
    setReceipt(o); flash("✅ Orden registrada");
  };

  const advance = (id, to) => {
    setOrders(p => p.map(o => {
      if (o.id !== id) return o;
      if (o.type === "aqui" && to === "done" && o.status !== "done") setDineIn(c => Math.max(0, c - 1));
      return { ...o, status: to };
    }));
  };

  const resolveSaldo = (id) => {
    setOrders(p => p.map(o => o.id !== id ? o : { ...o, saldo: o.saldo ? { ...o.saldo, resolved: true } : null }));
    flash("✅ Saldo liquidado");
  };

  const removeOrder = (id) => {
    setOrders(p => {
      const o = p.find(x => x.id === id);
      if (o?.type === "aqui" && o.status !== "done") setDineIn(c => Math.max(0, c - 1));
      return p.filter(x => x.id !== id);
    });
  };

  const active = orders.filter(o => o.status !== "done");
  const done = orders.filter(o => o.status === "done");
  const pendingSaldos = orders.filter(o => o.saldo && !o.saldo.resolved);
  const dailyTotal = orders.reduce((s, o) => s + o.total, 0);

  const timeOptions = (() => {
    const opts = [];
    const now = new Date();
    let h = now.getHours(), m = now.getMinutes() < 30 ? 30 : 0;
    if (m === 0) h += 1;
    for (let i = 0; i < 16 && h < 22; i++) {
      opts.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
      m += 30; if (m >= 60) { m = 0; h++; }
    }
    return opts;
  })();

  // ═══════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════
  return (
    <div style={{ minHeight:"100vh", position:"relative", userSelect:"none", WebkitUserSelect:"none" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:54, left:"50%", transform:"translateX(-50%)",
          background:"#1c1c1e", color:"#fff", padding:"12px 24px", borderRadius:50,
          fontSize:15, fontWeight:600, zIndex:999, boxShadow:"0 8px 24px rgba(0,0,0,0.2)", whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}

      {/* ═══ RECEIPT MODAL ═══ */}
      {receipt && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(8px)",
          display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 }}
          onClick={() => { setReceipt(null); setPayInput(""); }}>
          <div style={{ background:"#fff", borderRadius:"28px 28px 0 0", padding:"16px 24px 24px",
            width:"100%", maxWidth:430, paddingBottom:"max(24px,env(safe-area-inset-bottom,24px))",
            maxHeight:"92vh", overflowY:"auto", animation:"slideUp 0.3s ease" }}
            onClick={e => e.stopPropagation()}>

            <div style={{ width:40, height:5, borderRadius:3, background:"#d1d1d6", margin:"0 auto 14px" }} />
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:40, marginBottom:6 }}>✅</div>
              <div style={{ fontSize:22, fontWeight:800 }}>Orden confirmada</div>
              <div style={{ fontSize:14, color:"#8e8e93", marginTop:6 }}>
                {receipt.time} · {TYPE_OPTIONS.find(t=>t.key===receipt.type)?.icon} {TYPE_OPTIONS.find(t=>t.key===receipt.type)?.label}
                {receipt.name !== "Orden" && ` · ${receipt.name}`}
              </div>
              {receipt.deliveryTime && (
                <div style={{ fontSize:15, fontWeight:700, color:"#f59e0b", marginTop:6 }}>🕐 Para las {receipt.deliveryTime}</div>
              )}
            </div>

            <div style={{ borderTop:"1px dashed #d1d1d6", borderBottom:"1px dashed #d1d1d6", padding:"12px 0", marginBottom:16 }}>
              {receipt.items.map((it,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", fontSize:16 }}>
                  <span style={{ color:"#555" }}>{it.qty}× {it.name}</span>
                  <span style={{ fontWeight:700 }}>{fmt(it.price*it.qty)}</span>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", fontSize:26, fontWeight:800, marginBottom:4 }}>
              <span>Total</span><span>{fmt(receipt.total)}</span>
            </div>

            {receipt.saldo && (
              <div style={{ background:"#fef3c7", borderRadius:14, padding:12, marginTop:10, textAlign:"center" }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#92400e" }}>💳 Le debemos al cliente</div>
                <div style={{ fontSize:24, fontWeight:800, color:"#d97706" }}>{fmt(receipt.saldo.amount)}</div>
                {receipt.saldo.note && <div style={{ fontSize:13, color:"#92400e", marginTop:2 }}>{receipt.saldo.note}</div>}
              </div>
            )}

            <div style={{ background:"#f2f1f6", borderRadius:18, padding:18, marginTop:14 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#6366f1", marginBottom:10 }}>💵 Calcular cambio</div>
              <input type="number" inputMode="numeric" placeholder="¿Con cuánto paga?"
                value={payInput} onChange={e => setPayInput(e.target.value)}
                style={{ width:"100%", padding:"14px 16px", border:"1.5px solid #e5e5ea", borderRadius:14,
                  fontSize:20, fontWeight:700, textAlign:"center", outline:"none", background:"#fff", WebkitAppearance:"none" }} />
              <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap", justifyContent:"center" }}>
                {QUICK_PAY.filter(n => n >= receipt.total).map(n => (
                  <button key={n} onClick={() => setPayInput(String(n))}
                    style={{ ...baseBtn, padding:"10px 16px", borderRadius:12,
                      border: payInput===String(n) ? "2px solid #6366f1" : "1.5px solid #e5e5ea",
                      background: payInput===String(n) ? "#eef2ff" : "#fff",
                      fontSize:16, fontWeight:700, color: payInput===String(n) ? "#6366f1" : "#3a3a3c" }}>
                    ${n}
                  </button>
                ))}
              </div>
              {payInput && parseFloat(payInput) >= receipt.total && (
                <div style={{ textAlign:"center", fontSize:28, fontWeight:800, color:"#34d399", padding:"12px 0 4px" }}>
                  Cambio: {fmt(parseFloat(payInput) - receipt.total)}
                </div>
              )}
              {payInput && parseFloat(payInput) > 0 && parseFloat(payInput) < receipt.total && (
                <div style={{ textAlign:"center", fontSize:28, fontWeight:800, color:"#ef4444", padding:"12px 0 4px" }}>
                  Falta: {fmt(receipt.total - parseFloat(payInput))}
                </div>
              )}
            </div>

            <button onClick={() => { setReceipt(null); setPayInput(""); }}
              style={{ ...baseBtn, width:"100%", padding:18, borderRadius:18, background:"#1c1c1e",
                color:"#fff", fontSize:18, fontWeight:700, marginTop:18 }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ═══ CART SHEET ═══ */}
      {showCart && (
        <>
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", backdropFilter:"blur(3px)", zIndex:70 }}
            onClick={() => setShowCart(false)} />
          <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
            width:"100%", maxWidth:430, background:"#fff", borderRadius:"28px 28px 0 0",
            maxHeight:"92vh", display:"flex", flexDirection:"column", zIndex:80,
            paddingBottom:"max(12px,env(safe-area-inset-bottom,12px))",
            boxShadow:"0 -10px 40px rgba(0,0,0,0.12)", animation:"slideUp 0.3s ease" }}>

            <div style={{ width:40, height:5, borderRadius:3, background:"#d1d1d6", margin:"10px auto 6px" }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 20px 12px" }}>
              <span style={{ fontSize:20, fontWeight:800 }}>Tu orden</span>
              <button onClick={() => { setCart([]); setShowCart(false); }}
                style={{ ...baseBtn, background:"#fee2e2", color:"#dc2626", borderRadius:12, padding:"8px 16px", fontSize:14, fontWeight:700 }}>
                Vaciar
              </button>
            </div>

            {/* Type selector */}
            <div style={{ display:"flex", gap:8, padding:"0 20px 12px" }}>
              {TYPE_OPTIONS.map(t => (
                <button key={t.key} onClick={() => setType(t.key)}
                  style={{ ...baseBtn, flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                    padding:"12px 6px", borderRadius:16,
                    border: type===t.key ? "2px solid #6366f1" : "1.5px solid #e5e5ea",
                    background: type===t.key ? "#eef2ff" : "#fff",
                    fontSize:13, fontWeight:700, color: type===t.key ? "#6366f1" : "#8e8e93" }}>
                  <span style={{ fontSize:18 }}>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>

            {/* Name input */}
            {(type==="whatsapp"||type==="aqui") && (
              <input type="text" placeholder={type==="whatsapp"?"Nombre (WhatsApp)":"Nombre / mesa"}
                value={name} onChange={e=>setName(e.target.value)}
                style={{ margin:"0 20px 12px", padding:"12px 16px", border:"1.5px solid #e5e5ea",
                  borderRadius:14, fontSize:16, outline:"none", background:"#fafafa", WebkitAppearance:"none" }} />
            )}

            {/* Delivery time */}
            <div style={{ padding:"0 20px 10px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#8e8e93", marginBottom:6 }}>🕐 ¿Para cuándo?</div>
              <div style={{ display:"flex", gap:6, overflowX:"auto", WebkitOverflowScrolling:"touch", paddingBottom:4 }}>
                <button onClick={() => setDeliveryTime("")}
                  style={{ ...baseBtn, flexShrink:0, padding:"8px 14px", borderRadius:12,
                    border: !deliveryTime ? "2px solid #f59e0b" : "1.5px solid #e5e5ea",
                    background: !deliveryTime ? "#fef3c7" : "#fff",
                    fontSize:14, fontWeight:700, color: !deliveryTime ? "#92400e" : "#8e8e93" }}>
                  Ahora
                </button>
                {timeOptions.map(t => (
                  <button key={t} onClick={() => setDeliveryTime(t)}
                    style={{ ...baseBtn, flexShrink:0, padding:"8px 14px", borderRadius:12,
                      border: deliveryTime===t ? "2px solid #f59e0b" : "1.5px solid #e5e5ea",
                      background: deliveryTime===t ? "#fef3c7" : "#fff",
                      fontSize:14, fontWeight:700, color: deliveryTime===t ? "#92400e" : "#8e8e93" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart items */}
            <div style={{ flex:1, overflowY:"auto", padding:"0 20px", WebkitOverflowScrolling:"touch" }}>
              {cart.map(item => (
                <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 0", borderBottom:"0.5px solid #f0f0f0" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:16, fontWeight:600 }}>{item.emoji} {item.name}</div>
                    <div style={{ fontSize:14, color:"#8e8e93", marginTop:2 }}>{fmt(item.price)} c/u</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", background:"#f2f2f7", borderRadius:12, overflow:"hidden" }}>
                    <button style={{ ...baseBtn, width:40, height:40, background:"transparent", fontSize:22, fontWeight:600, color:"#6366f1", display:"flex", alignItems:"center", justifyContent:"center" }}
                      onClick={() => qtyUpdate(item.id,-1)}>−</button>
                    <span style={{ width:30, textAlign:"center", fontSize:17, fontWeight:700 }}>{item.qty}</span>
                    <button style={{ ...baseBtn, width:40, height:40, background:"transparent", fontSize:22, fontWeight:600, color:"#6366f1", display:"flex", alignItems:"center", justifyContent:"center" }}
                      onClick={() => qtyUpdate(item.id,1)}>+</button>
                  </div>
                  <div style={{ minWidth:55, textAlign:"right", fontSize:17, fontWeight:700 }}>{fmt(item.price*item.qty)}</div>
                </div>
              ))}
            </div>

            {/* Cart footer */}
            <div style={{ padding:"14px 20px 6px", borderTop:"0.5px solid #e5e5ea" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:14, color:"#8e8e93", fontWeight:600 }}>{count} productos</span>
                <span style={{ fontSize:34, fontWeight:800, letterSpacing:-1 }}>{fmt(total)}</span>
              </div>

              {/* Saldo a favor */}
              <div style={{ background:"#fef9ec", borderRadius:14, padding:12, marginBottom:10, border:"1.5px solid #fde68a" }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#92400e", marginBottom:6 }}>💳 ¿Dejó pagado de más?</div>
                <input type="number" inputMode="numeric" placeholder="Monto que debemos"
                  value={creditAmount} onChange={e => setCreditAmount(e.target.value)}
                  style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #e5e5ea", borderRadius:12,
                    fontSize:16, fontWeight:700, outline:"none", background:"#fff", WebkitAppearance:"none" }} />
                {creditAmount && parseFloat(creditAmount) > 0 && (
                  <input type="text" placeholder="Nota (ej: María, falta café)"
                    value={creditNote} onChange={e => setCreditNote(e.target.value)}
                    style={{ width:"100%", marginTop:8, padding:"10px 12px", border:"1.5px solid #e5e5ea",
                      borderRadius:12, fontSize:14, outline:"none", background:"#fafafa", WebkitAppearance:"none" }} />
                )}
              </div>

              {/* Quick pay */}
              <div style={{ background:"#f2f1f6", borderRadius:16, padding:14, marginBottom:10 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#6366f1", marginBottom:8 }}>💵 Pago rápido</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {QUICK_PAY.filter(n => n >= total).map(n => (
                    <button key={n} onClick={() => setPayInput(String(n))}
                      style={{ ...baseBtn, padding:"10px 16px", borderRadius:12,
                        border: payInput===String(n) ? "2px solid #6366f1" : "1.5px solid #e5e5ea",
                        background: payInput===String(n) ? "#eef2ff" : "#fff",
                        fontSize:16, fontWeight:700, color: payInput===String(n) ? "#6366f1" : "#3a3a3c" }}>
                      ${n}
                    </button>
                  ))}
                </div>
                {payInput && parseFloat(payInput) >= total && (
                  <div style={{ textAlign:"center", fontSize:26, fontWeight:800, color:"#34d399", padding:"10px 0 4px" }}>
                    Cambio: {fmt(parseFloat(payInput) - total)}
                  </div>
                )}
              </div>

              <button onClick={submit}
                style={{ ...baseBtn, width:"100%", padding:18, borderRadius:18,
                  background:"linear-gradient(135deg,#6366f1,#7c3aed)", color:"#fff",
                  fontSize:18, fontWeight:700, boxShadow:"0 4px 18px rgba(99,102,241,0.35)" }}>
                Registrar orden · {fmt(total)}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ═══ POS TAB ═══ */}
      {tab === "pos" && (
        <div>
          <div style={{ position:"sticky", top:0, zIndex:50, background:"rgba(242,241,246,0.88)",
            backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
            borderBottom:"0.5px solid rgba(0,0,0,0.06)", padding:"12px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:30, fontWeight:800, letterSpacing:-0.5 }}>Menú</span>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                {pendingSaldos.length > 0 && (
                  <div style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 10px", borderRadius:20,
                    background:"#fef3c7", fontSize:13, fontWeight:700, color:"#d97706" }}>
                    💳 {pendingSaldos.length}
                  </div>
                )}
                <div style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:20,
                  background: dineIn>=7?"#fee2e2":dineIn>=5?"#fef3c7":"#dcfce7",
                  fontSize:14, fontWeight:700, color: dineIn>=7?"#dc2626":dineIn>=5?"#d97706":"#16a34a" }}>
                  🪑 {dineIn}/7
                </div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(118,118,128,0.12)",
              borderRadius:14, padding:"11px 14px", marginTop:12 }}>
              <span style={{ fontSize:16, color:"#8e8e93" }}>🔍</span>
              <input type="text" placeholder="Buscar…" value={search} onChange={e=>setSearch(e.target.value)}
                style={{ flex:1, border:"none", outline:"none", background:"transparent", fontSize:17, color:"#1c1c1e" }} />
              {search && <button onClick={() => setSearch("")}
                style={{ ...baseBtn, background:"transparent", fontSize:18, color:"#8e8e93", padding:4 }}>✕</button>}
            </div>
          </div>

          {/* Categories */}
          <div style={{ display:"flex", gap:8, overflowX:"auto", padding:"14px 16px 6px", WebkitOverflowScrolling:"touch" }}>
            {CATS.map(c => (
              <button key={c.key} onClick={() => setCat(c.key)}
                style={{ ...baseBtn, flexShrink:0, display:"flex", alignItems:"center", gap:6,
                  padding:"9px 16px", borderRadius:22,
                  background: cat===c.key ? "#1c1c1e" : "#fff",
                  color: cat===c.key ? "#fff" : "#6b6b6f",
                  fontSize:15, fontWeight:600,
                  boxShadow: cat===c.key ? "0 2px 10px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.06)" }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, padding:"10px 16px 170px" }}>
            {filtered.map((item, i) => {
              const inCart = cart.find(c => c.id === item.id);
              return (
                <button key={item.id} onClick={() => add(item)}
                  style={{ ...baseBtn, position:"relative",
                    background: inCart ? "linear-gradient(145deg,#eef2ff,#f0ebff)" : "#fff",
                    borderRadius:18, padding:"16px 8px 14px",
                    border: inCart ? "2px solid #c7d2fe" : "1px solid rgba(0,0,0,0.04)",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.04)", textAlign:"center",
                    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                    minHeight:100, animation:`popIn 0.25s ease ${i*15}ms both` }}>
                  {inCart && (
                    <div style={{ position:"absolute", top:-6, right:-6,
                      background:"linear-gradient(135deg,#6366f1,#7c3aed)", color:"#fff",
                      width:24, height:24, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:13, fontWeight:700, boxShadow:"0 2px 8px rgba(99,102,241,0.4)" }}>
                      {inCart.qty}
                    </div>
                  )}
                  <div style={{ fontSize:30, marginBottom:4 }}>{item.emoji}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#1c1c1e", lineHeight:1.2, marginBottom:4 }}>{item.name}</div>
                  <div style={{ fontSize:17, fontWeight:800, color:"#6366f1" }}>{fmt(item.price)}</div>
                </button>
              );
            })}
          </div>

          {/* Floating cart bar */}
          {count > 0 && (
            <div onClick={() => setShowCart(true)}
              style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)",
                width:"calc(100% - 32px)", maxWidth:400,
                background:"linear-gradient(135deg,#6366f1,#7c3aed)", borderRadius:22, padding:"16px 20px",
                display:"flex", alignItems:"center", justifyContent:"space-between",
                boxShadow:"0 8px 30px rgba(99,102,241,0.4)", zIndex:40, cursor:"pointer" }}>
              <div>
                <div style={{ color:"#fff", fontSize:17, fontWeight:700 }}>Ver orden</div>
                <div style={{ color:"rgba(255,255,255,0.75)", fontSize:14 }}>{count} productos</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ color:"#fff", fontSize:24, fontWeight:800 }}>{fmt(total)}</span>
                <span style={{ color:"rgba(255,255,255,0.7)", fontSize:22 }}>›</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ ORDERS TAB ═══ */}
      {tab === "orders" && (
        <div>
          <div style={{ position:"sticky", top:0, zIndex:50, background:"rgba(242,241,246,0.88)",
            backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
            borderBottom:"0.5px solid rgba(0,0,0,0.06)", padding:"12px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:30, fontWeight:800, letterSpacing:-0.5 }}>Pedidos</span>
              <div style={{ display:"flex", gap:8 }}>
                {done.length > 0 && (
                  <button onClick={() => setOrders(p => p.filter(o => o.status !== "done"))}
                    style={{ ...baseBtn, background:"#f2f2f7", borderRadius:12, padding:"8px 16px", fontSize:14, fontWeight:600, color:"#8e8e93" }}>
                    Limpiar ✓
                  </button>
                )}
              </div>
            </div>
            {/* Daily stats */}
            <div style={{ display:"flex", gap:12, marginTop:10 }}>
              <div style={{ flex:1, background:"#fff", borderRadius:14, padding:"10px 14px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize:11, color:"#8e8e93", fontWeight:600 }}>VENTA HOY</div>
                <div style={{ fontSize:22, fontWeight:800, color:"#1c1c1e" }}>{fmt(dailyTotal)}</div>
              </div>
              <div style={{ flex:1, background:"#fff", borderRadius:14, padding:"10px 14px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize:11, color:"#8e8e93", fontWeight:600 }}>ÓRDENES</div>
                <div style={{ fontSize:22, fontWeight:800, color:"#1c1c1e" }}>{orders.length}</div>
              </div>
              <div style={{ flex:1, background: pendingSaldos.length ? "#fef3c7" : "#fff", borderRadius:14, padding:"10px 14px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize:11, color: pendingSaldos.length ? "#92400e" : "#8e8e93", fontWeight:600 }}>SALDOS</div>
                <div style={{ fontSize:22, fontWeight:800, color: pendingSaldos.length ? "#d97706" : "#1c1c1e" }}>{pendingSaldos.length}</div>
              </div>
            </div>
          </div>

          <div style={{ padding:"8px 16px 110px" }}>
            {/* Pending saldos */}
            {pendingSaldos.length > 0 && (
              <div style={{ background:"#fef3c7", borderRadius:18, padding:16, marginBottom:14, border:"1.5px solid #fde68a" }}>
                <div style={{ fontSize:15, fontWeight:800, color:"#92400e", marginBottom:10 }}>💳 Saldos pendientes</div>
                {pendingSaldos.map(o => (
                  <div key={o.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"0.5px solid #fde68a" }}>
                    <div>
                      <div style={{ fontSize:16, fontWeight:700 }}>{o.name} — <span style={{ color:"#d97706" }}>{fmt(o.saldo.amount)}</span></div>
                      <div style={{ fontSize:13, color:"#92400e" }}>{o.saldo.note} · {o.time}</div>
                    </div>
                    <button onClick={() => resolveSaldo(o.id)}
                      style={{ ...baseBtn, background:"#065f46", color:"#fff", borderRadius:12, padding:"10px 16px", fontSize:14, fontWeight:700 }}>
                      ✅ Pagado
                    </button>
                  </div>
                ))}
              </div>
            )}

            {active.length === 0 && done.length === 0 && pendingSaldos.length === 0 && (
              <div style={{ textAlign:"center", padding:"100px 20px", color:"#8e8e93" }}>
                <div style={{ fontSize:56 }}>📋</div>
                <p style={{ marginTop:14, fontSize:17 }}>Sin pedidos aún</p>
              </div>
            )}

            {active.map((o, i) => {
              const color = o.status==="cooking"?"#f59e0b":o.status==="ready"?"#34d399":
                o.type==="whatsapp"?"#25d366":o.type==="aqui"?"#6366f1":"#94a3b8";
              return (
                <div key={o.id} style={{ background:"#fff", borderRadius:18, padding:18, marginBottom:12,
                  borderLeft:`4px solid ${color}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
                  animation:`popIn 0.3s ease ${i*40}ms both` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div style={{ fontSize:17, fontWeight:700 }}>
                        {TYPE_OPTIONS.find(t=>t.key===o.type)?.icon} {o.name}
                      </div>
                      <div style={{ fontSize:13, color:"#8e8e93", marginTop:3 }}>
                        {o.time} · {TYPE_OPTIONS.find(t=>t.key===o.type)?.label}
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:22, fontWeight:800 }}>{fmt(o.total)}</div>
                      {o.deliveryTime && (
                        <div style={{ fontSize:13, fontWeight:700, color:"#f59e0b", marginTop:2 }}>🕐 {o.deliveryTime}</div>
                      )}
                    </div>
                  </div>

                  <div style={{ padding:"10px 0", borderTop:"0.5px solid #f0f0f0", marginTop:10 }}>
                    {o.items.map((it,j) => (
                      <div key={j} style={{ fontSize:15, color:"#555", padding:"3px 0" }}><b>{it.qty}×</b> {it.name}</div>
                    ))}
                  </div>

                  {o.saldo && !o.saldo.resolved && (
                    <div style={{ background:"#fef3c7", borderRadius:12, padding:"8px 12px", marginTop:6,
                      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#92400e" }}>💳 Debemos: {fmt(o.saldo.amount)}</div>
                        {o.saldo.note && <div style={{ fontSize:12, color:"#a16207" }}>{o.saldo.note}</div>}
                      </div>
                      <button onClick={() => resolveSaldo(o.id)}
                        style={{ ...baseBtn, background:"#065f46", color:"#fff", borderRadius:10, padding:"6px 12px", fontSize:13, fontWeight:700 }}>
                        ✅
                      </button>
                    </div>
                  )}
                  {o.saldo?.resolved && (
                    <div style={{ background:"#d1fae5", borderRadius:12, padding:"6px 12px", marginTop:6,
                      fontSize:13, fontWeight:600, color:"#065f46", textAlign:"center" }}>
                      ✅ Saldo liquidado ({fmt(o.saldo.amount)})
                    </div>
                  )}

                  <div style={{ display:"flex", gap:8, marginTop:12 }}>
                    {o.status==="pending" && (
                      <button style={{ ...baseBtn, flex:1, padding:12, borderRadius:14, background:"#fef3c7", color:"#92400e", fontSize:15, fontWeight:700 }}
                        onClick={() => advance(o.id,"cooking")}>🔥 Preparando</button>
                    )}
                    {o.status==="cooking" && (
                      <button style={{ ...baseBtn, flex:1, padding:12, borderRadius:14, background:"#d1fae5", color:"#065f46", fontSize:15, fontWeight:700 }}
                        onClick={() => advance(o.id,"ready")}>✅ Listo</button>
                    )}
                    {o.status==="ready" && (
                      <button style={{ ...baseBtn, flex:1, padding:12, borderRadius:14, background:"#e0e7ff", color:"#3730a3", fontSize:15, fontWeight:700 }}
                        onClick={() => advance(o.id,"done")}>📦 Entregado</button>
                    )}
                    <button style={{ ...baseBtn, width:52, padding:12, borderRadius:14, background:"#fee2e2", color:"#991b1b", fontSize:15, fontWeight:700 }}
                      onClick={() => removeOrder(o.id)}>🗑</button>
                  </div>

                  <div style={{ marginTop:10, padding:"8px 0", borderRadius:12, fontSize:13, fontWeight:700, textAlign:"center",
                    background: o.status==="pending"?"#f2f2f7":o.status==="cooking"?"#fef3c7":"#d1fae5",
                    color: o.status==="pending"?"#8e8e93":o.status==="cooking"?"#92400e":"#065f46" }}>
                    {o.status==="pending"?"⏳ Pendiente":o.status==="cooking"?"🔥 Preparando":"✅ Listo para entregar"}
                  </div>
                </div>
              );
            })}

            {done.length > 0 && (
              <>
                <div style={{ fontSize:15, fontWeight:700, color:"#8e8e93", padding:"20px 0 10px" }}>
                  Completados ({done.length}) · Venta: {fmt(done.reduce((s,o)=>s+o.total,0))}
                </div>
                {done.slice(0,8).map(o => (
                  <div key={o.id} style={{ background:"#fff", borderRadius:18, padding:16, marginBottom:10,
                    borderLeft:"4px solid #d1d5db", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", opacity:0.5 }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <div>
                        <div style={{ fontSize:15, fontWeight:600, color:"#8e8e93" }}>
                          {TYPE_OPTIONS.find(t=>t.key===o.type)?.icon} {o.name}
                        </div>
                        <div style={{ fontSize:12, color:"#aeaeb2" }}>{o.time}</div>
                      </div>
                      <div style={{ fontSize:17, fontWeight:700, color:"#8e8e93" }}>{fmt(o.total)}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ TAB BAR ═══ */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:430, background:"rgba(255,255,255,0.92)",
        backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
        borderTop:"0.5px solid rgba(0,0,0,0.08)", display:"flex", justifyContent:"space-around",
        paddingTop:10, paddingBottom:"max(10px,env(safe-area-inset-bottom,10px))", zIndex:60 }}>
        <button style={{ ...baseBtn, display:"flex", flexDirection:"column", alignItems:"center", gap:3,
          background:"transparent", fontSize:11, fontWeight:600, color: tab==="pos"?"#6366f1":"#8e8e93", padding:"0 24px" }}
          onClick={() => setTab("pos")}>
          <span style={{ fontSize:26 }}>💰</span><span>Cobrar</span>
        </button>
        <button style={{ ...baseBtn, display:"flex", flexDirection:"column", alignItems:"center", gap:3,
          background:"transparent", fontSize:11, fontWeight:600, color: tab==="orders"?"#6366f1":"#8e8e93", padding:"0 24px", position:"relative" }}
          onClick={() => setTab("orders")}>
          <span style={{ fontSize:26 }}>📋</span><span>Pedidos</span>
          {(active.length > 0 || pendingSaldos.length > 0) && (
            <span style={{ position:"absolute", top:-5, right:10, background:"#ef4444", color:"#fff",
              fontSize:11, fontWeight:700, borderRadius:10, minWidth:19, height:19,
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              {active.length + pendingSaldos.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Mount ───
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
