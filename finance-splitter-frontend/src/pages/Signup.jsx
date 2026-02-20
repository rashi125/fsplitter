import React, { useState } from "react";
import "./AuthForm.css";
import { registerUser, loginUser } from "../api";

const AuthForm = () => {
  const [rightPanelActive, setRightPanelActive] = useState(false);

  // Sign Up State
  const [signUpData, setSignUpData] = useState({ name: "", email: "", password: "" });

  // Sign In State
  const [signInData, setSignInData] = useState({ email: "", password: "" });

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const data = await registerUser(signUpData);
      localStorage.setItem("token", data.token);
      alert("Registered successfully!");
      // optionally redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  // Handle Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(signInData);
      localStorage.setItem("token", data.token);
      alert("Logged in successfully!");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div>
        <h1 className="text-black text-6xl text-center mb-4">Finance Splitter</h1>
    <div className={`container ${rightPanelActive ? "right-panel-active" : ""}`} id="container">
     
      {/* Sign Up Form */}
      <div className="form-container sign-up-container">
        <form onSubmit={handleSignUp}>
          <h1>Create Account</h1>
          <div className="social-container">
            <a href="" className="social"><i className="Google"></i></a>
            {/* <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
            <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a> */}
          </div>
          <span>or use your email for registration</span>
          <input type="text" placeholder="Name" value={signUpData.name} onChange={e => setSignUpData({...signUpData, name: e.target.value})} />
          <input type="email" placeholder="Email" value={signUpData.email} onChange={e => setSignUpData({...signUpData, email: e.target.value})} />
          <input type="password" placeholder="Password" value={signUpData.password} onChange={e => setSignUpData({...signUpData, password: e.target.value})} />
          <button type="submit">Sign Up</button>
        </form>
      </div>

      {/* Sign In Form */}
      <div className="form-container sign-in-container">
        <form onSubmit={handleSignIn}>
          <h1>Sign in</h1>
          <div className="social-container">
            <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
            <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
          </div>
          <span>or use your account</span>
          <input type="email" placeholder="Email" value={signInData.email} onChange={e => setSignInData({...signInData, email: e.target.value})} />
          <input type="password" placeholder="Password" value={signInData.password} onChange={e => setSignInData({...signInData, password: e.target.value})} />
          <a href="#">Forgot your password?</a>
          <button type="submit">Sign In</button>
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
