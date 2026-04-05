import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("CUSTOMER");
    const [error, setError] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await axios.post("http://localhost:8080/auth/register", {
                name,
                email,
                password,
                role,
            });

            navigate("/login");
        } catch (err) {
            console.error("Registration error:", err);
            if (err?.response?.status === 409) {
                setError("Email already in use. Try another email.");
            } else {
                setError("Registration failed. Please check details and try again.");
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="title">Create NeuroFleetX Account</h1>

                {error && (
                    <div
                        style={{
                            background: "rgba(255,87,87,0.15)",
                            border: "1px solid rgba(255,87,87,0.4)",
                            color: "#fff",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            marginBottom: "8px",
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <label>Name</label>
                    <input
                        type="text"
                        placeholder="Enter name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <label>Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Fleet Manager</option>
                        <option value="DRIVER">Driver</option>
                        <option value="CUSTOMER">Customer</option>
                    </select>

                    <button type="submit">Sign Up</button>
                </form>

                <p className="signup-text">
                    Already have an account?{" "}
                    <span>
                        <Link to="/login">Login</Link>
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Register;

