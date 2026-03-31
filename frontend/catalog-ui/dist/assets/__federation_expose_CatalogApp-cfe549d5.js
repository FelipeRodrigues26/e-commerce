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

const API_GATEWAY_URL = "http://localhost:8080";
function CatalogApp() {
  const [items, setItems] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [form, setForm] = useState({ name: "", price: 0, description: "", stock: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const AUTH_ERROR_MESSAGE = "Token invalido ou expirado. Faca login novamente.";
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
  });
  const handleAuthError = () => {
    localStorage.removeItem("jwt_token");
    setFeedback({ type: "error", message: AUTH_ERROR_MESSAGE });
    setTimeout(() => window.location.reload(), 1200);
  };
  const fetchCatalog = async () => {
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/catalog/?t=${Date.now()}`, {
        headers: getHeaders()
      });
      if (res.status === 401) {
        handleAuthError();
        return;
      }
      if (!res.ok)
        throw new Error("Service down");
      const data = await res.json();
      const sortedData = Array.isArray(data) ? data.sort((a, b) => a.id - b.id) : [];
      setItems(sortedData);
    } catch (e) {
      console.error(e);
      setFeedback({ type: "error", message: "Serviço de Catálogo offline ou inacessível." });
    }
  };
  useEffect(() => {
    fetchCatalog();
  }, []);
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/catalog/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(form)
      });
      if (res.status === 401) {
        handleAuthError();
        return;
      }
      if (res.ok) {
        setForm({ name: "", price: 0, description: "", stock: 0 });
        fetchCatalog();
      }
    } catch (e2) {
      alert("Erro ao criar item.");
    }
  };
  const startEdit = (p) => {
    setForm({ name: p.name, price: p.price, description: p.description || "", stock: p.stock });
    setIsEditing(true);
    setEditingId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelEdit = () => {
    setForm({ name: "", price: 0, description: "", stock: 0 });
    setIsEditing(false);
    setEditingId(null);
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/catalog/${editingId}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(form)
      });
      if (res.status === 401) {
        handleAuthError();
        return;
      }
      if (res.ok) {
        cancelEdit();
        fetchCatalog();
        setFeedback({ type: "success", message: "Produto atualizado com sucesso! ✅" });
      } else {
        setFeedback({ type: "error", message: "Erro ao atualizar o item." });
      }
    } catch (e2) {
      setFeedback({ type: "error", message: "Erro de conexão." });
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Deseja excluir este item?"))
      return;
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/catalog/${id}`, { method: "DELETE", headers: getHeaders() });
      if (res.status === 401) {
        handleAuthError();
        return;
      }
      if (res.ok) {
        fetchCatalog();
        setFeedback({ type: "success", message: "Produto excluído com sucesso! 🗑️" });
      } else {
        setFeedback({ type: "error", message: "Erro ao excluir." });
      }
    } catch (e) {
      setFeedback({ type: "error", message: "Erro de conexão." });
    }
  };
  const filteredItems = items.filter((item) => {
    const query = nameFilter.trim().toLowerCase();
    if (!query)
      return true;
    const byName = item.name.toLowerCase().includes(query);
    const byId = String(item.id).includes(query);
    return byName || byId;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "1rem" }, children: [
    feedback.message && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      background: feedback.type === "success" ? "#f0fdf4" : "#fef2f2",
      border: feedback.type === "success" ? "1px solid #bbf7d0" : "1px solid #fecaca",
      color: feedback.type === "success" ? "#15803d" : "#b91c1c",
      padding: "1rem",
      borderRadius: 8,
      marginBottom: "1.5rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        feedback.type === "success" ? "✅" : "⚠️",
        " ",
        feedback.message
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFeedback({ type: "", message: "" }), style: { background: "none", border: "none", color: feedback.type === "success" ? "#15803d" : "#b91c1c", cursor: "pointer", fontWeight: "bold", fontSize: "18px" }, children: "×" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: isEditing ? "#fffbeb" : "#f9f9f9", padding: "1.5rem", borderRadius: 8, marginBottom: "2rem", border: isEditing ? "1px solid #fde68a" : "1px solid #ddd", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { marginTop: 0, color: isEditing ? "#92400e" : "#111827" }, children: isEditing ? `📝 Editando Produto ${editingId}` : "🛍️ Novo Item no Catálogo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: isEditing ? handleUpdate : handleCreate, style: { display: "flex", gap: "1rem", flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            placeholder: "Nome do Produto",
            style: { padding: "0.6rem", borderRadius: 6, border: "1px solid #d1d5db", flex: 1 },
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
            style: { padding: "0.6rem", width: 120, borderRadius: 6, border: "1px solid #d1d5db" },
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
            style: { padding: "0.6rem", borderRadius: 6, border: "1px solid #d1d5db", flex: 2 },
            value: form.description,
            onChange: (e) => setForm({ ...form, description: e.target.value })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            placeholder: "Estoque",
            style: { padding: "0.6rem", width: 90, borderRadius: 6, border: "1px solid #d1d5db" },
            value: form.stock,
            onChange: (e) => setForm({ ...form, stock: parseInt(e.target.value) }),
            min: "0",
            required: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "0.5rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: { padding: "0.6rem 1.5rem", background: isEditing ? "#f59e0b" : "#28a745", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }, children: isEditing ? "Salvar Alterações" : "Adicionar" }),
          isEditing && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: cancelEdit, style: { padding: "0.6rem 1.5rem", background: "#9ca3af", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }, children: "Cancelar" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "0.8rem", alignItems: "center", marginBottom: "0.8rem", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { margin: 0 }, children: "Itens Disponíveis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          placeholder: "Filtrar por nome ou ID do produto...",
          value: nameFilter,
          onChange: (e) => setNameFilter(e.target.value),
          style: { padding: "0.55rem 0.7rem", borderRadius: 6, border: "1px solid #d1d5db", minWidth: "280px" }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", textAlign: "left", borderCollapse: "collapse", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginTop: "1rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "Produto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "Preço" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "Descrição" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "Estoque" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "1rem", fontWeight: "600", color: "#475569" }, children: "Ações" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        filteredItems.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f1f5f9" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "1rem", fontSize: "14px", background: "white" }, children: p.id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "1rem", fontSize: "14px", background: "white", fontWeight: "bold", color: "#1e293b" }, children: p.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "1rem", fontSize: "14px", background: "white" }, children: [
            "R$",
            p.price.toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "1rem", fontSize: "13px", background: "white", color: "#64748b" }, children: p.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "1rem", fontSize: "14px", background: "white", fontWeight: "bold" }, children: p.stock }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "1rem", background: "white", display: "flex", gap: "0.5rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => startEdit(p),
                style: { background: "#e0f2fe", color: "#0369a1", border: "none", padding: "0.4rem 0.8rem", borderRadius: 4, cursor: "pointer", fontSize: "12px", fontWeight: "600" },
                children: "📝 Editar"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleDelete(p.id),
                style: { background: "#fee2e2", color: "#dc2626", border: "none", padding: "0.4rem 0.8rem", borderRadius: 4, cursor: "pointer", fontSize: "12px", fontWeight: "600" },
                children: "🗑️ Excluir"
              }
            )
          ] })
        ] }, p.id)),
        filteredItems.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: "6", style: { padding: "1.2rem", textAlign: "center", color: "#94a3b8", background: "white" }, children: "Nenhum produto encontrado para esse filtro de nome/ID." }) })
      ] })
    ] })
  ] });
}

export { CatalogApp as default, jsxRuntimeExports as j };
