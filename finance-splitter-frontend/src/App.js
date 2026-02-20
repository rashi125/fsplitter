import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Signup";
// import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import GroupDetails from "./pages/GroupDetail";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route → redirect to register */}
        <Route path="/" element={<Navigate to="/register" />}  />
        <Route path="/register" element={<Register />} />
        <Route path="/group" element={<GroupDetails/>}/>
        <Route path="/dashboard" element={<Dashboard />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
