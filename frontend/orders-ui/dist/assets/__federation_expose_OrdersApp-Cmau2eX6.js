import { importShared } from './__federation_fn_import-BMdLx5XD.js';
import { r as reactExports } from './index-Dm_EQZZA.js';

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production_min = {};

/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var f=reactExports,k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:true,ref:true,__self:true,__source:true};
function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a) void 0===d[b]&&(d[b]=a[b]);return {$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;

{
  jsxRuntime.exports = reactJsxRuntime_production_min;
}

var jsxRuntimeExports = jsxRuntime.exports;

const React = await importShared('react');
const {useState,useEffect} = React;

const API_URL = "http://localhost:8002/orders";
function OrdersApp() {
  const [orders, setOrders] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
  });
  const fetchOrders = async () => {
    try {
      const res = await fetch(API_URL + "/", { headers: getHeaders() });
      if (!res.ok) throw new Error("Service error");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setFeedback({ type: "error", message: "Serviço de Pedidos offline ou inacessível." });
    }
  };
  const fetchCatalog = async () => {
    try {
      const res = await fetch("http://localhost:8003/catalog/", { headers: getHeaders() });
      if (!res.ok) throw new Error("Service error");
      const data = await res.json();
      const sortedData = Array.isArray(data) ? data : [];
      setCatalog(sortedData);
      return sortedData;
    } catch (e) {
      console.error(e);
      setFeedback({ type: "error", message: "Serviço de Catálogo offline ou inacessível." });
      return [];
    }
  };
  const fetchOrderById = async () => {
    if (!searchId) return;
    try {
      const res = await fetch(`${API_URL}/${searchId}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSearchResult(data);
        setFeedback({ type: "", message: "" });
      } else {
        setFeedback({ type: "error", message: "Pedido não encontrado." });
        setSearchResult(null);
      }
    } catch (e) {
      setFeedback({ type: "error", message: "Erro na busca." });
    }
  };
  useEffect(() => {
    fetchOrders();
    fetchCatalog();
  }, []);
  const addToCart = () => {
    const product = catalog.find((p) => p.id === parseInt(selectedProductId));
    if (!product) return;
    if (product.stock < quantity) {
      setFeedback({ type: "error", message: `Estoque insuficiente! Apenas ${product.stock} disponíveis.` });
      return;
    }
    const newItem = { product_id: product.id, name: product.name, quantity, price: product.price };
    setCart([...cart, newItem]);
    setQuantity(1);
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setFeedback({ type: "error", message: "Adicione pelo menos um item ao carrinho!" });
      return;
    }
    const payload = {
      user_id: 1,
      // MVP User
      items: cart.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        price: Number(item.price)
      }))
    };
    console.log("Enviando Pedido:", payload);
    const res = await fetch(API_URL + "/", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      fetchOrders();
      fetchCatalog();
      setCart([]);
      setSelectedProductId("");
      setQuantity(1);
      setFeedback({ type: "success", message: "Pedido criado com sucesso! ✅" });
    } else {
      const errorData = await res.json();
      console.error("Erro 422/400 Detalhado:", errorData);
      let msg = "Erro na validação do pedido.";
      if (errorData.detail) {
        msg = typeof errorData.detail === "string" ? errorData.detail : errorData.detail[0]?.msg ? `${errorData.detail[0].loc.join(".")}: ${errorData.detail[0].msg}` : JSON.stringify(errorData.detail);
      }
      setFeedback({ type: "error", message: msg });
      const freshCatalog = await fetchCatalog();
      setCart(
        (prevCart) => prevCart.filter((item) => {
          const p = freshCatalog.find((prod) => prod.id === item.product_id);
          return p && p.stock > 0;
        }).map((item) => {
          const p = freshCatalog.find((prod) => prod.id === item.product_id);
          return { ...item, price: p ? p.price : item.price };
        })
      );
    }
  };
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/${id}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setFeedback({ type: "success", message: "Status atualizado com sucesso! ✅" });
        await fetchOrders();
      } else {
        const err = await res.json();
        setFeedback({ type: "error", message: `Erro ao atualizar status: ${err.detail || "Erro desconhecido"}` });
      }
    } catch (e) {
      console.error(e);
      setFeedback({ type: "error", message: "Erro de conexão ao atualizar status." });
    }
  };
  const toggleExpand = (id) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const displayOrders = searchResult ? [searchResult] : filterStatus ? orders.filter((o) => o.status === filterStatus) : orders;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", padding: "1.5rem", borderRadius: 12, marginBottom: "2rem", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { marginTop: 0, color: "#111827", display: "flex", alignItems: "center", gap: "8px" }, children: "🛒 Novo Pedido" }),
      feedback.message && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        background: feedback.type === "success" ? "#f0fdf4" : "#fef2f2",
        border: feedback.type === "success" ? "1px solid #bbf7d0" : "1px solid #fecaca",
        color: feedback.type === "success" ? "#15803d" : "#b91c1c",
        padding: "1rem",
        borderRadius: 8,
        marginBottom: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "14px",
        fontWeight: "500"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          feedback.type === "success" ? "✅" : "⚠️",
          " ",
          feedback.message
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFeedback({ type: "", message: "" }), style: { background: "none", border: "none", color: feedback.type === "success" ? "#15803d" : "#b91c1c", cursor: "pointer", fontWeight: "bold", fontSize: "18px" }, children: "×" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem", alignItems: "flex-end" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.4rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "13px", fontWeight: "600", color: "#374151" }, children: "Produto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              style: { padding: "0.6rem", borderRadius: 6, border: "1px solid #d1d5db", minWidth: "250px" },
              value: selectedProductId,
              onChange: (e) => setSelectedProductId(e.target.value),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Selecione um produto..." }),
                catalog.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: p.id, children: [
                  p.name,
                  " - R$",
                  p.price,
                  " (Estoque: ",
                  p.stock,
                  ")"
                ] }, p.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.4rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "13px", fontWeight: "600", color: "#374151" }, children: "Qtd" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              style: { padding: "0.6rem", width: 80, borderRadius: 6, border: "1px solid #d1d5db" },
              value: quantity,
              onChange: (e) => setQuantity(parseInt(e.target.value)),
              min: "1"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: addToCart,
            style: { padding: "0.6rem 1.2rem", background: "#28a745", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "600", fontSize: "14px" },
            children: "Adicionar Item"
          }
        )
      ] }),
      cart.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "white", padding: "1rem", borderRadius: 8, border: "1px solid #e5e7eb" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: { margin: "0 0 0.5rem 0", fontSize: "14px" }, children: "Itens no Carrinho:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: cart.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { style: { display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid #f3f4f6", fontSize: "14px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            item.name,
            " (x",
            item.quantity,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: "bold" }, children: [
            "R$",
            (item.price * item.quantity).toFixed(2)
          ] })
        ] }, idx)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginTop: "1rem", paddingTop: "0.5rem", borderTop: "2px solid #3b82f6" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: "bold" }, children: "Total Estimado:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: "bold", fontSize: "18px", color: "#2563eb" }, children: [
            "R$",
            cart.reduce((sub, item) => sub + item.price * item.quantity, 0).toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleCreate,
            style: { marginTop: "1rem", width: "100%", padding: "0.8rem", background: "#10b981", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold", fontSize: "16px" },
            children: "Finalizar Pedido ✅"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { margin: 0, color: "#111827" }, children: "Histórico de Pedidos" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "0.5rem", alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              placeholder: "Buscar ID",
              style: { padding: "0.5rem", border: "none", width: "100px", outline: "none" },
              value: searchId,
              onChange: (e) => setSearchId(e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: fetchOrderById, style: { padding: "0.5rem 0.8rem", background: "#e6e7e9ff", color: "white", border: "none", cursor: "pointer" }, children: "🔍" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), style: { padding: "0.5rem", borderRadius: 6, border: "1px solid #d1d5db" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Status: Todos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PENDENTE", children: "PENDENTE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ENVIADO", children: "ENVIADO" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ENTREGUE", children: "ENTREGUE" })
        ] }),
        (searchResult || filterStatus) && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setSearchResult(null);
          setSearchId("");
          setFilterStatus("");
        }, style: { background: "white", color: "#374151", border: "1px solid #d1d5db", padding: "0.5rem 1rem", borderRadius: 6, fontWeight: "600", cursor: "pointer" }, children: "Limpar" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", textAlign: "left", borderCollapse: "collapse", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginTop: "1rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "Data" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "Ações" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        displayOrders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: "5", style: { padding: "3rem", textAlign: "center", color: "#94a3b8" }, children: "Nenhum pedido encontrado." }) }),
        displayOrders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f1f5f9", background: expandedOrders[o.id] ? "#f8fafc" : "white" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "1rem", fontSize: "14px" }, children: o.id }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "1rem", fontSize: "14px" }, children: new Date(o.created_at).toLocaleDateString("pt-BR") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "1rem", fontSize: "14px", fontWeight: "bold", color: "#1e293b" }, children: [
              "R$",
              o.total_price ? o.total_price.toFixed(2) : "0.00"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "1rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { padding: "0.4rem 0.8rem", borderRadius: "20px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", background: o.status === "PENDENTE" ? "#fef3c7" : o.status === "ENVIADO" ? "#e0f2fe" : "#dcfce7", color: o.status === "PENDENTE" ? "#92400e" : o.status === "ENVIADO" ? "#075985" : "#166534" }, children: o.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => toggleExpand(o.id),
                  style: { padding: "0.4rem 0.8rem", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 4, cursor: "pointer", fontSize: "12px", fontWeight: "600" },
                  children: expandedOrders[o.id] ? "🔼 Ocultar" : "🔽 Detalhes"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { style: { padding: "0.4rem", borderRadius: 4, fontSize: "12px" }, value: o.status, onChange: (e) => updateStatus(o.id, e.target.value), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PENDENTE", children: "Alterar para Pendente" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ENVIADO", children: "Alterar para Enviado" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ENTREGUE", children: "Alterar para Entregue" })
              ] })
            ] })
          ] }),
          expandedOrders[o.id] && o.items && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f8fafc" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: "5", style: { padding: "0 1rem 1rem 1rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "white", padding: "1rem", borderRadius: 12, border: "1px solid #e2e8f0", marginLeft: "2rem", marginBottom: "1rem", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h5", { style: { margin: "0 0 1rem 0", color: "#64748b", display: "flex", alignItems: "center", gap: "8px" }, children: [
              "📦 Itens do Pedido ",
              o.id,
              ":"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "13px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "2px solid #f1f5f9", color: "#475569", textAlign: "left", background: "#f8fafc" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.8rem" }, children: "ID Produto" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.8rem" }, children: "Quantidade" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.8rem" }, children: "Preço Unit. (Histórico)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.8rem" }, children: "Subtotal" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: o.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f8fafc" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.8rem" }, children: item.product_id }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.8rem" }, children: item.quantity }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.8rem" }, children: [
                  "R$",
                  item.unit_price.toFixed(2)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.8rem", fontWeight: "bold", color: "#0f172a" }, children: [
                  "R$",
                  (item.unit_price * item.quantity).toFixed(2)
                ] })
              ] }, item.id)) })
            ] })
          ] }) }) })
        ] }, o.id))
      ] })
    ] })
  ] });
}

export { OrdersApp as default, jsxRuntimeExports as j };
