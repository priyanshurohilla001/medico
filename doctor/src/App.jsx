import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Dashboard and its related pages */}
        <Route path="/dashboard" element={<DashboardPage />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Global Toaster for notifications */}
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
