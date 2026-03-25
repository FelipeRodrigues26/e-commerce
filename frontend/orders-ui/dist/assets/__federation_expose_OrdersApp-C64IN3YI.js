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
  const [form, setForm] = useState({ user_id: 1, product_name: "", quantity: 1 });
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
  });
  const fetchOrders = async () => {
    try {
      const res = await fetch(API_URL + "/", { headers: getHeaders() });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };
  const fetchCatalog = async () => {
    try {
      const res = await fetch("http://localhost:8003/catalog/", { headers: getHeaders() });
      const data = await res.json();
      setCatalog(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setForm((f) => ({ ...f, product_name: data[0].name }));
      }
    } catch (e) {
      console.error(e);
    }
  };
  const fetchOrderById = async () => {
    if (!searchId) return;
    try {
      const res = await fetch(`${API_URL}/${searchId}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSearchResult(data);
      } else {
        alert("Pedido não encontrado.");
        setSearchResult(null);
      }
    } catch (e) {
      alert("Erro na busca.");
    }
  };
  useEffect(() => {
    fetchOrders();
    fetchCatalog();
  }, []);
  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch(API_URL + "/", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(form)
    });
    fetchOrders();
    setForm({ ...form, quantity: 1 });
  };
  const updateStatus = async (id, status) => {
    await fetch(`${API_URL}/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    fetchOrders();
  };
  const displayOrders = searchResult ? [searchResult] : filterStatus ? orders.filter((o) => o.status === filterStatus) : orders;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "1.5rem", border: "1px solid #ddd", borderRadius: "8px", background: "white" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9f9f9", padding: "1.5rem", borderRadius: 8, marginBottom: "2rem", border: "1px solid #ddd" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { marginTop: 0 }, children: "Novo Pedido" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreate, style: { display: "flex", gap: "1rem", flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.3rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "12px", fontWeight: "bold" }, children: "Produto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              style: { padding: "0.5rem", borderRadius: 4, border: "1px solid #ccc" },
              value: form.product_name,
              onChange: (e) => setForm({ ...form, product_name: e.target.value }),
              children: catalog.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: p.name, children: [
                p.name,
                " - $",
                p.price
              ] }, p.id))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.3rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "12px", fontWeight: "bold" }, children: "Qtd" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              style: { padding: "0.5rem", width: 60, borderRadius: 4, border: "1px solid #ccc" },
              value: form.quantity,
              onChange: (e) => setForm({ ...form, quantity: parseInt(e.target.value) }),
              min: "1"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: { alignSelf: "flex-end", padding: "0.6rem 1.5rem", background: "#28a745", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }, children: "Criar Pedido" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { margin: 0 }, children: "Lista de Pedidos" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "0.5rem", alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", border: "1px solid #ccc", borderRadius: 4, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              placeholder: "Buscar ID...",
              style: { padding: "0.4rem", border: "none", width: "100px", outline: "none" },
              value: searchId,
              onChange: (e) => setSearchId(e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: fetchOrderById,
              style: { padding: "0.4rem 0.8rem", background: "#333", color: "white", border: "none", cursor: "pointer" },
              children: "🔍"
            }
          )
        ] }),
        searchResult && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setSearchResult(null);
          setSearchId("");
        }, style: { background: "#dc3545", color: "white", border: "none", padding: "0.4rem 0.8rem", borderRadius: 4, cursor: "pointer", fontSize: "12px" }, children: "Limpar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), style: { padding: "0.4rem", borderRadius: 4, border: "1px solid #ccc" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Todos Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PENDING", children: "PENDING" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "SHIPPED", children: "SHIPPED" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "DELIVERED", children: "DELIVERED" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", textAlign: "left", borderCollapse: "collapse", border: "1px solid #ddd" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#eee" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.7rem", border: "1px solid #ddd" }, children: "ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.7rem", border: "1px solid #ddd" }, children: "Produto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.7rem", border: "1px solid #ddd" }, children: "Qtd" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.7rem", border: "1px solid #ddd" }, children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.7rem", border: "1px solid #ddd" }, children: "Ações" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        displayOrders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: "5", style: { padding: "2rem", textAlign: "center", color: "#666" }, children: "Nenhum pedido encontrado." }) }),
        displayOrders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: searchResult ? "#e9f7ef" : "transparent" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.7rem", border: "1px solid #ddd" }, children: o.id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.7rem", border: "1px solid #ddd" }, children: o.product_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.7rem", border: "1px solid #ddd" }, children: o.quantity }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.7rem", border: "1px solid #ddd" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { padding: "0.3rem 0.6rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "bold", background: o.status === "PENDING" ? "#ffd700" : o.status === "SHIPPED" ? "#87ceeb" : "#28a745", color: o.status === "DELIVERED" ? "white" : "black" }, children: o.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.7rem", border: "1px solid #ddd" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { style: { padding: "0.3rem", borderRadius: 4 }, value: o.status, onChange: (e) => updateStatus(o.id, e.target.value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PENDING", children: "Pendente" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "SHIPPED", children: "Enviado" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "DELIVERED", children: "Entregue" })
          ] }) })
        ] }, o.id))
      ] })
    ] })
  ] });
}

export { OrdersApp as default, jsxRuntimeExports as j };
