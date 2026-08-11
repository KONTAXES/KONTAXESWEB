import './index.css';
import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./App";

const SAPortal = React.lazy(() => import("./pages/SA/SAPortal").then(m => ({ default: m.SAPortal })));
const SAAdmin  = React.lazy(() => import("./pages/SA/SAAdmin").then(m => ({ default: m.SAAdmin })));

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Suspense fallback={null}>
      <Routes>
        <Route path="/sa/admin" element={<SAAdmin />} />
        <Route path="/sa"       element={<SAPortal />} />
        <Route path="/*"        element={<App />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
