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
  const filteredOrders = filterStatus ? orders.filter((o) => o.status === filterStatus) : orders;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "1rem", border: "1px solid #ddd", borderRadius: "8px", background: "white" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { marginTop: 0 }, children: "Gestão de Pedidos " }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1rem", padding: "1rem", background: "#f9f9f9", borderRadius: "4px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: { marginTop: 0 }, children: "Novo Pedido (Usuário Fixo #1)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreate, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: form.product_name, onChange: (e) => setForm({ ...form, product_name: e.target.value }), required: true, style: { marginRight: "0.5rem", padding: "0.3rem" }, children: catalog.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: item.name, children: [
          item.name,
          " - R$",
          item.price.toFixed(2)
        ] }, item.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: form.quantity, onChange: (e) => setForm({ ...form, quantity: parseInt(e.target.value) }), min: "1", required: true, style: { marginRight: "0.5rem", width: "60px", padding: "0.3rem" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", style: { padding: "0.3rem 1rem", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }, children: "Criar Pedido" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontWeight: "bold", marginRight: "0.5rem" }, children: "Filtrar por Status: " }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), style: { padding: "0.3rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Todos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PENDING", children: "PENDING" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "SHIPPED", children: "SHIPPED" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "DELIVERED", children: "DELIVERED" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", textAlign: "left", borderCollapse: "collapse" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#eee" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem", borderBottom: "2px solid #ccc" }, children: "ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem", borderBottom: "2px solid #ccc" }, children: "Produto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem", borderBottom: "2px solid #ccc" }, children: "Qtd" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem", borderBottom: "2px solid #ccc" }, children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem", borderBottom: "2px solid #ccc" }, children: "Ações" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        filteredOrders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: "5", style: { padding: "1rem", textAlign: "center" }, children: "Nenhum pedido encontrado." }) }),
        filteredOrders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #eee" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: o.id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: o.product_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: o.quantity }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { padding: "0.2rem 0.5rem", borderRadius: "12px", fontSize: "0.8rem", background: o.status === "PENDING" ? "#ffd700" : o.status === "SHIPPED" ? "#87ceeb" : "#90ee90" }, children: o.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: o.status, onChange: (e) => updateStatus(o.id, e.target.value), children: [
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
