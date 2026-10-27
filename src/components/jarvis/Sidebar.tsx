"use client";

import type { AssistantAction } from "@/types/assistant";

type SidebarProps = {
  activeSection: AssistantAction;
  onNavigate: (section: AssistantAction) => void;
  mobileOpen: boolean;
  onClose: () => void;
};

const navigation: {
  id: AssistantAction;
  label: string;
  icon: string;
}[] = [
  { id: "home", label: "হোম", icon: "⌂" },
  { id: "chat", label: "কথোপকথন", icon: "▤" },
  { id: "reminders", label: "রিমাইন্ডার", icon: "◷" },
  { id: "settings", label: "সেটিংস", icon: "⚙" },
];

export default function Sidebar({
  activeSection,
  onNavigate,
  mobileOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="মেনু বন্ধ করুন"
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <span>J</span>
          </div>

          <div className="brand-copy">
            <strong>JARVIS</strong>
            <span>PERSONAL AI</span>
          </div>

          <button
            className="mobile-close"
            onClick={onClose}
            aria-label="বন্ধ করুন"
          >
            ×
          </button>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                activeSection === item.id ? "nav-active" : ""
              }`}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>

              {activeSection === item.id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="connection-card">
            <div className="connection-top">
              <span className="status-dot" />
              <span>ইন্টারফেস চালু আছে</span>
            </div>

            <p>JARVIS Frontend</p>
            <span className="connection-note">AI Backend এখনো যুক্ত হয়নি</span>
          </div>

          <div className="profile">
            <div className="profile-avatar">M</div>

            <div className="profile-copy">
              <strong>My Assistant</strong>
              <span>Personal workspace</span>
            </div>

            <span className="profile-menu">•••</span>
          </div>
        </div>
      </aside>
    </>
  );
}
