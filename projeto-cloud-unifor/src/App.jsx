import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Auth from "./pages/Auth.jsx";
import WhoWeAre from "./pages/WhoWeAre.jsx";

import Overview from "./pages/Dashboard/Overview.jsx";
import Orders from "./pages/Dashboard/Orders.jsx";
import Inventory from "./pages/Dashboard/Inventory.jsx";
import Status from "./pages/Dashboard/Status.jsx";
import History from "./pages/Dashboard/History.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/quem-somos" element={<WhoWeAre />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="pedidos" element={<Orders />} />
        <Route path="estoque" element={<Inventory />} />
        <Route path="status" element={<Status />} />
        <Route path="historico" element={<History />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}