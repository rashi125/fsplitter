import React, { useState } from "react";
import "./AuthForm.css";
import { registerUser, loginUser } from "../api";
import axios from "axios";

const AuthForm = () => {
  const [rightPanelActive, setRightPanelActive] = useState(false);

  const [signUpData, setSignUpData] = useState({ name: "", email: "", password: "" });
  const [signInData, setSignInData] = useState({ email: "", password: "" });

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const data = await registerUser(signUpData);
      localStorage.setItem("token", data.token);
      alert("Registered successfully!");
      window.location.href = "/dashboard";
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const email = prompt("Please enter your email address:");
    if (!email) return;
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      alert("If that email exists, a reset link has been sent!");
    } catch (error) {
      alert("Error sending reset link.");
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(signInData);
      localStorage.setItem("token", data.token);
      alert("Logged in successfully!");
      window.location.href = "/dashboard";
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    /* Apply the maanga hua gradient here */
    <div className="auth-page-wrapper bg-[#0F172A]">
      <h1 className="text-white text-4xl md:text-6xl text-center mb-8 main-title font-bold">
        Finance Splitter
      </h1>
      
      <div className={`container ${rightPanelActive ? "right-panel-active" : ""}`} id="container">
        
        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignUp}>
            <h1>Create Account</h1>
            <input type="text" placeholder="Name" value={signUpData.name} onChange={e => setSignUpData({...signUpData, name: e.target.value})} />
            <input type="email" placeholder="Email" value={signUpData.email} onChange={e => setSignUpData({...signUpData, email: e.target.value})} />
            <input type="password" placeholder="Password" value={signUpData.password} onChange={e => setSignUpData({...signUpData, password: e.target.value})} />
            <button type="submit">Sign Up</button>
            
            <button type="button" className="mobile-toggle-btn" onClick={() => setRightPanelActive(false)}>
              Already have an account? Sign In
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleSignIn}>
            <h1>Sign in</h1>
            <input type="email" placeholder="Email" value={signInData.email} onChange={e => setSignInData({...signInData, email: e.target.value})} />
            <input type="password" placeholder="Password" value={signInData.password} onChange={e => setSignInData({...signInData, password: e.target.value})} />
            <a href="#" onClick={handleForgotPassword} className="forgot-link">Forgot your password?</a>
            <button type="submit">Sign In</button>

            <button type="button" className="mobile-toggle-btn" onClick={() => setRightPanelActive(true)}>
              New here? Create Account
            </button>
          </form>
        </div>

        {/* Overlay Panel */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" onClick={() => setRightPanelActive(false)}>Sign In</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button className="ghost" onClick={() => setRightPanelActive(true)}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;