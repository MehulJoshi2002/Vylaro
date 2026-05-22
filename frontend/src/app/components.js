"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, X, Send, Dumbbell, Award, Utensils, TrendingUp, User, LogOut, Settings, Menu } from "lucide-react";
import { api } from "./api";

// -------------------------------------------------------------
// ----------------------- NAVBAR COMPONENT ---------------------
// -------------------------------------------------------------
export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Get logged in user name
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    } else {
      api.me()
        .then(u => {
          setUserName(u.name || "User");
          localStorage.setItem("userName", u.name);
        })
        .catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    router.push("/");
  };

  // Hide nav on login/onboarding landing pages
  const isAuthPage = pathname === "/" || pathname === "/onboarding";
  if (isAuthPage) return null;

  const navLinks = [
    { href: "/dashboard", icon: <Award size={18} />, label: "Dashboard" },
    { href: "/workout", icon: <Dumbbell size={18} />, label: "Workout" },
    { href: "/diet", icon: <Utensils size={18} />, label: "Diet & Recipes" },
    { href: "/progress", icon: <TrendingUp size={18} />, label: "Progress" },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="app-container flex-between">
          <div className="flex-center" style={{ gap: "0.75rem" }}>
            {/* Mobile Hamburger toggle - positioned on left */}
            <button className="nav-mobile-toggle" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu size={24} />
            </button>

            <Link href="/dashboard" className="nav-logo">
              <Dumbbell style={{ color: "var(--accent-lime)" }} size={28} />
              <span className="gradient-text">Vylaro</span>
            </Link>
          </div>

          {/* Desktop nav links */}
          <ul className="nav-links">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link href={link.href} className={`nav-link ${pathname === link.href ? "active" : ""}`}>
                  {link.icon} {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop user menu */}
          <div className="flex-center nav-user-desktop" style={{ gap: "0.75rem" }}>
            <Link href="/settings" className="flex-center font-heading" style={{ gap: "0.5rem", fontSize: "0.9rem", textDecoration: "none", color: pathname === "/settings" ? "var(--accent-lime)" : "var(--text-primary)", background: pathname === "/settings" ? "rgba(163,230,53,0.08)" : "transparent", border: "1px solid var(--card-border)", borderRadius: "2rem", padding: "0.35rem 0.85rem" }}>
              <User size={15} style={{ color: pathname === "/settings" ? "var(--accent-lime)" : "var(--text-secondary)" }} />
              <span>{userName}</span>
              <Settings size={13} style={{ color: "var(--text-muted)" }} />
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (Sidebar) */}
      <div className={`drawer-overlay ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />
      
      <div className={`drawer-panel ${menuOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="flex-center" style={{ gap: "0.5rem" }}>
            <Dumbbell style={{ color: "var(--accent-lime)" }} size={24} />
            <span className="gradient-text font-heading" style={{ fontWeight: "800", fontSize: "1.2rem" }}>Vylaro</span>
          </div>
          <button onClick={() => setMenuOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", padding: "0.25rem", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        <div className="drawer-links">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className={`drawer-link ${pathname === link.href ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
              {link.icon} {link.label}
            </Link>
          ))}
          <Link href="/settings" className={`drawer-link ${pathname === "/settings" ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
            <User size={18} /> Settings
          </Link>
        </div>

        <div className="drawer-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.25rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(163,230,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={18} style={{ color: "var(--accent-lime)" }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: "600", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Standard User</div>
            </div>
          </div>
          <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", gap: "0.5rem" }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </>
  );
}

// -------------------------------------------------------------
// ----------------------- CHAT COMPONENT ----------------------
// -------------------------------------------------------------
export function ChatPanel() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "model", text: "Hey! I'm your Vylaro AI. Need help swapping food, adjusting your workout sets, or tracking calories? Ask away!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Load chat session from sessionStorage
  useEffect(() => {
    const savedChat = sessionStorage.getItem("vylaro_chat");
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    }
  }, []);

  // Save history on changes
  const saveMessages = (msgs) => {
    setMessages(msgs);
    sessionStorage.setItem("vylaro_chat", JSON.stringify(msgs));
  };

  // Hide on login screen
  if (pathname === "/") return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    
    const updatedMessages = [...messages, { role: "user", text: userMsg }];
    saveMessages(updatedMessages);
    setLoading(true);

    try {
      // Format history matching FitCopilot structure: list of {"role": "user"|"model", "content": "..."}
      const historyFormatted = messages.map(m => ({
        role: m.role,
        content: m.text
      }));

      const res = await api.sendChatMessage(userMsg, historyFormatted);
      saveMessages([...updatedMessages, { role: "model", text: res.reply }]);
    } catch (err) {
      saveMessages([...updatedMessages, { role: "model", text: "Oops, I encountered a connection issue. Please make sure my FastAPI backend is running!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Persistent Chat Bubble Button */}
      <button className="ai-chat-bubble flex-center" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} style={{ color: "#000" }} /> : <MessageSquare size={24} style={{ color: "#000" }} />}
      </button>

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="ai-chat-window glass-card">
          <div className="chat-header flex-between">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Dumbbell size={18} style={{ color: "var(--accent-lime)" }} />
              <div>
                <h4 style={{ fontSize: "0.95rem" }}>Vylaro AI</h4>
                <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Active Fitness Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`chat-bubble-msg ${msg.role === "user" ? "chat-msg-user" : "chat-msg-ai"}`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble-msg chat-msg-ai" style={{ opacity: 0.6 }}>
                Typing recipe swaps...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask about protein swaps, form, etc..." 
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: "0.5rem 0.75rem" }} disabled={loading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
