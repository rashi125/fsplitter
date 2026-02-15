import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = "https://";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token); // save JWT
    alert("Login Success!");
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
