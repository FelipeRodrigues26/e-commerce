import { importShared } from './__federation_fn_import-e40783d0.js';
import { r as reactExports } from './index-6af61f11.js';

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
var f=reactExports,k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};
function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a)void 0===d[b]&&(d[b]=a[b]);return {$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;

{
  jsxRuntime.exports = reactJsxRuntime_production_min;
}

var jsxRuntimeExports = jsxRuntime.exports;

const React = await importShared('react');
const {useState,useEffect} = React;

const API_URL = "http://localhost:8003/catalog";
function CatalogApp() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", price: 0, description: "", stock: 0 });
  const fetchCatalog = async () => {
    try {
      const res = await fetch(API_URL + "/");
      const data = await res.json();
      const sortedData = Array.isArray(data) ? data.sort((a, b) => a.id - b.id) : [];
      setItems(sortedData);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    fetchCatalog();
  }, []);
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL + "/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ name: "", price: 0, description: "", stock: 0 });
        fetchCatalog();
      }
    } catch (e2) {
      alert("Erro ao criar item.");
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Deseja excluir este item?"))
      return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCatalog();
      } else {
        alert("Erro ao excluir.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9f9f9", padding: "1.5rem", borderRadius: 8, marginBottom: "2rem", border: "1px solid #ddd" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { marginTop: 0 }, children: "🛍️ Novo Item no Catálogo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreate, style: { display: "flex", gap: "1rem", flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            placeholder: "Nome do Produto",
            style: { padding: "0.5rem", borderRadius: 4, border: "1px solid #ccc", flex: 1 },
            value: form.name,
            onChange: (e) => setForm({ ...form, name: e.target.value }),
            required: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            placeholder: "Preço",
            style: { padding: "0.5rem", width: 100, borderRadius: 4, border: "1px solid #ccc" },
            value: form.price,
            onChange: (e) => setForm({ ...form, price: parseFloat(e.target.value) }),
            min: "0",
            step: "0.01",
            required: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            placeholder: "Descrição",
            style: { padding: "0.5rem", borderRadius: 4, border: "1px solid #ccc", flex: 2 },
            value: form.description,
            onChange: (e) => setForm({ ...form, description: e.target.value })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            placeholder: "Estoque",
            style: { padding: "0.5rem", width: 80, borderRadius: 4, border: "1px solid #ccc" },
            value: form.stock,
            onChange: (e) => setForm({ ...form, stock: parseInt(e.target.value) }),
            min: "0",
            required: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: { padding: "0.6rem 1.5rem", background: "#28a745", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }, children: "Adicionar" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { marginTop: 0 }, children: "Itens Disponíveis" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", textAlign: "left", borderCollapse: "collapse", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginTop: "1rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "Produto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "Preço" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "Descrição" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "Estoque" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "Ações" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: items.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f1f5f9" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "1rem", fontSize: "14px", background: "white" }, children: p.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "1rem", fontSize: "14px", background: "white", fontWeight: "bold", color: "#1e293b" }, children: p.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "1rem", fontSize: "14px", background: "white" }, children: [
          "R$",
          p.price.toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "1rem", fontSize: "13px", background: "white", color: "#64748b" }, children: p.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "1rem", fontSize: "14px", background: "white", fontWeight: "bold" }, children: p.stock }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "1rem", background: "white" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleDelete(p.id),
            style: { background: "#fee2e2", color: "#dc2626", border: "none", padding: "0.4rem 0.8rem", borderRadius: 4, cursor: "pointer", fontSize: "12px", fontWeight: "600" },
            children: "🗑️ Excluir"
          }
        ) })
      ] }, p.id)) })
    ] })
  ] });
}

export { CatalogApp as default, jsxRuntimeExports as j };
