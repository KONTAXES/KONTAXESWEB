import './index.css';
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./App";
import { SAPortal } from "./pages/SA/SAPortal";
import { SAAdmin } from "./pages/SA/SAAdmin";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/sa/admin" element={<SAAdmin />} />
      <Route path="/sa"       element={<SAPortal />} />
      <Route path="/*"        element={<App />} />
    </Routes>
  </BrowserRouter>
);