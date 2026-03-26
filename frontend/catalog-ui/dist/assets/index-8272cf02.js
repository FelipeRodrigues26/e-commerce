import { importShared } from './__federation_fn_import-e40783d0.js';
import CatalogApp, { j as jsxRuntimeExports } from './__federation_expose_CatalogApp-1e727e77.js';
import { r as reactDomExports } from './index-ebe3b9e0.js';

var client = {};

var m = reactDomExports;
{
  client.createRoot = m.createRoot;
  client.hydrateRoot = m.hydrateRoot;
}

const React = await importShared('react');
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CatalogApp, {}) })
);
