import { useRef, useState } from "react";
import "./App.css";

const API_BASE = "https://second-tour-mvp-backend.onrender.com";
const ENDPOINT = `${API_BASE}/query/stream`;
const RESET_ENDPOINT = `${API_BASE}/query/reset`;





// ===== [ADDED] (5 lines before/after context) =====
const CARD_ENDPOINT = `${API_BASE}/query/finance_card`;

type FinanceCard = {
  destination: string;
  months_left_in_service: number;
  emergency_fund: {
    monthly_expenses: number;
    multiplier_months: number;
    goal: number;
    saved_assumed: number;
    needed: number;
    monthly_required: number;
  };
  moving_cost: {
    rent_estimate_used: number;
    safety_buffer: number;
    housing_cost: number;
    car_cost: number;
    flight_cost: number;
    goal: number;
    saved_assumed: number;
    needed: number;
    monthly_required: number;
  };
  total_monthly_required: number;
  assumptions: string[];
};

type CardError = {
  message: string;
  missing: string[];
  user_state?: Record<string, any>;
};
// ===== [END ADDED] =====





type ChatMessage = { role: "user" | "assistant"; content: string };

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);




    // ===== [ADDED] (5 lines before/after context) =====
  const [cardOpen, setCardOpen] = useState(false);
  const [cardData, setCardData] = useState<FinanceCard | null>(null);
  const [cardError, setCardError] = useState<CardError | null>(null);
  // ===== [END ADDED] =====






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




  // ===== [ADDED] (5 lines before/after context) =====
  const openCard = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setCardError(null);
    setCardData(null);

    try {
      const res = await fetch(CARD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        // FastAPI HTTPException(detail=...) usually ends up as { detail: ... }
        const detail = data?.detail ?? data;
        setCardError(
          detail?.missing
            ? detail
            : { message: "Missing information to calculate.", missing: [] }
        );
      } else {
        setCardData(data);
      }

      setCardOpen(true);
    } catch {
      setCardError({ message: "Error talking to server.", missing: [] });
      setCardOpen(true);
    } finally {
      setIsLoading(false);
    }
  };
  // ===== [END ADDED] =====






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
        




        {/* ===== [CHANGED] (5 lines before/after context) ===== */}
        <button
          className="reset-btn"
          type="button"
          onClick={openCard}
          disabled={isLoading}
          title="Show finance card"
        >
          card
        </button>
        {/* ===== [END CHANGED] ===== */}





      </div>




      {/* ===== [ADDED] Modal Popup (5 lines before/after context) ===== */}
      {cardOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 9999,
          }}
          onClick={() => setCardOpen(false)}
        >
          <div
            style={{
              width: "min(720px, 100%)",
              background: "#111",
              borderRadius: 12,
              padding: 16,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0 }}>Finance Card</h3>
              <button onClick={() => setCardOpen(false)}>X</button>
            </div>

            {/* ERROR VIEW */}
            {cardError && (
              <div style={{ marginTop: 12 }}>
                <p style={{ marginTop: 0 }}>
                  {cardError.message || "Missing information to calculate."}
                </p>

                {cardError.missing?.length > 0 && (
                  <>
                    <p style={{ marginBottom: 6 }}>Missing fields:</p>
                    <ul style={{ marginTop: 0 }}>
                      {cardError.missing.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <p style={{ marginTop: 12 }}>
                      Type those into chat, then press <b>card</b> again.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* SUCCESS VIEW */}
            {cardData && (
              <div style={{ marginTop: 12 }}>
                <p style={{ marginTop: 0 }}>
                  <b>Destination:</b> {cardData.destination} <br />
                  <b>Months left:</b> {cardData.months_left_in_service}
                </p>

                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <h4 style={{ marginTop: 0 }}>Emergency Fund</h4>
                  <p style={{ margin: 0 }}>
                    Goal: <b>${cardData.emergency_fund.goal.toFixed(2)}</b> <br />
                    Monthly required:{" "}
                    <b>${cardData.emergency_fund.monthly_required.toFixed(2)}</b>
                  </p>
                </div>

                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <h4 style={{ marginTop: 0 }}>Moving Cost</h4>
                  <p style={{ margin: 0 }}>
                    Goal: <b>${cardData.moving_cost.goal.toFixed(2)}</b> <br />
                    Monthly required:{" "}
                    <b>${cardData.moving_cost.monthly_required.toFixed(2)}</b>
                  </p>
                </div>

                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <h4 style={{ marginTop: 0 }}>Total</h4>
                  <p style={{ margin: 0 }}>
                    Total monthly required:{" "}
                    <b>${cardData.total_monthly_required.toFixed(2)}</b>
                  </p>
                </div>

                {cardData.assumptions?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ marginBottom: 6 }}>
                      <b>Assumptions (MVP)</b>
                    </p>
                    <ul style={{ marginTop: 0 }}>
                      {cardData.assumptions.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* ===== [END ADDED] ===== */}




      
    </>
  );
}

export default App;
