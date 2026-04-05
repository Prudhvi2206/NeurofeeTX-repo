import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardLayout.css";

function DashboardLayout({ title, menuItems, activeKey, onMenuChange, children }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
    };

    return (
        <div className="nf-layout">
            <aside className="nf-sidebar">
                <div className="nf-sidebar-brand">NeuroFleetX</div>
                <nav className="nf-sidebar-menu">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className={
                                "nf-sidebar-item" +
                                (activeKey === item.key ? " nf-sidebar-item--active" : "")
                            }
                            onClick={() => {
                                if (onMenuChange) {
                                    onMenuChange(item.key);
                                }
                                if (item.path) {
                                    navigate(item.path);
                                }
                            }}
                        >
                            <span className="nf-sidebar-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <button
                    type="button"
                    className="nf-sidebar-logout"
                    onClick={handleLogout}
                >
                    ⏏ Logout
                </button>
            </aside>

            <main className="nf-main">
                <header className="nf-main-header">
                    <h1 className="nf-main-title">{title}</h1>
                </header>
                <div className="nf-main-body">{children}</div>
            </main>
        </div>
    );
}

export default DashboardLayout;

