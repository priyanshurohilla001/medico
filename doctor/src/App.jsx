import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
// import ProfilePage from "./pages/ProfilePage";
// import AppointmentsPage from "./pages/AppointmentsPage";
// import SettingsPage from "./pages/SettingsPage";

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
        {/* <Route path="/dashboard/profile" element={<ProfilePage />} />
        <Route path="/dashboard/appointments" element={<AppointmentsPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
         */}
        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Global Toaster for notifications */}
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
