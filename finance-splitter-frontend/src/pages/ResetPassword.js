import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
            alert("Password updated! Redirecting to login...");
            navigate("/auth"); // Adjust this path to your login page
        } catch (err) {
            alert(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container} className="bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))]
from-[#1d4ed8]
via-[#1e40af]
to-[#111827]">
            <form onSubmit={handleSubmit} style={styles.card}>
                <h2 style={styles.title}>Set New Password</h2>
                <p style={styles.subtitle}>Enter a strong password to secure your account.</p>
                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                    required
                    minLength="6"
                />
                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", width: "100%" },
    card: { background: "white", padding: "40px", borderRadius: "12px", width: "100%", maxWidth: "400px", textAlign: "center" },
    title: { margin: "0 0 10px 0", color: "#1e293b" },
    subtitle: { color: "#64748b", marginBottom: "20px", fontSize: "14px" },
    input: { w: "100%", padding: "12px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "90%" },
    button: { width: "100%", padding: "12px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }
};

export default ResetPassword;