import { useRef, useState } from "react";
import "./App.css";

const API_BASE = "https://second-tour-mvp-backend.onrender.com";
const ENDPOINT = `${API_BASE}/query/stream`;
const RESET_ENDPOINT = `${API_BASE}/query/reset`;

type ChatMessage = { role: "user" | "assistant"; content: string };

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    if (el.value.length === 0) return (el.style.height = "auto");
    const MAX_LINES = 7;
    const LINE_HEIGHT = 20;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, MAX_LINES * LINE_HEIGHT) + "px";
  };

  const sendMessage = async () => {
    const text = userInput.trim();
    if (!text || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setUserInput("");
    setIsLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: text }) });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data?.answer ?? "(No answer returned)" }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error talking to server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = async () => {
    if (isLoading) return;
    try { await fetch(RESET_ENDPOINT, { method: "POST" }); } catch {}
    setMessages([]);
    setUserInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <>
      {/* CHAT AREA */}
      <div className="page chat-area">
        {messages.length === 0 && !isLoading ? (
          <p className="empty-text">Type a message below to start the chat.</p>
        ) : (
          <>
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "row row-user" : "row row-ai"}>
                {m.role === "user" ? (
                  <div className="bubble bubble-user">{m.content}</div>
                ) : (
                  <div className="ai-panel">{m.content}</div>
                )}
              </div>
            ))}
            {isLoading && ( <div className="row row-ai"><div className="ai-panel">AI is thinking...</div></div> )}
          </>
        )}
      </div>

      {/* INPUT ROW (bar + reset side by side) */}
      <div className="input-row">
        {/* INPUT BAR (same structure, still works) */}
        <div className="chat-input-container">
          <div className="chat-input-wrap">
            <textarea
              ref={textareaRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onInput={autoResize}
              placeholder="User Input Goes Here..."
              className="chat-input"
              rows={1}
              maxLength={1500}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button className="chat-send-btn" type="button" aria-label="Send" onClick={sendMessage} disabled={isLoading} title={isLoading ? "Waiting for response..." : "Send"}>↑</button>
          </div>
        </div>

        {/* RESET (outside the bar, next to send) */}
        <button className="reset-btn" type="button" onClick={resetChat} disabled={isLoading} title="Clear conversation">reset</button>
      </div>
    </>
  );
}

export default App;
