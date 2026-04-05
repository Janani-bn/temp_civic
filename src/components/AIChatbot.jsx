import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../services/api';
import './AIChatbot.css';

const WELCOME_MESSAGE = {
  role: 'assistant',
  text: "Hi! I'm CivicFix AI Assistant. I can help you:\n\n• **Report an issue** — just describe what you see\n• **Track a complaint** — give me your complaint ID\n• **Answer questions** about how CivicFix works\n\nHow can I help you today?",
};

// Local action parser for fallback mode when AI is unavailable
function parseLocalAction(text) {
  const lower = text.toLowerCase();

  // Check for complaint ID tracking (CIV-XXX or track keywords)
  const idMatch = text.match(/CIV-[A-Z0-9]{6}/i) || text.match(/\b(CIV-[A-Z0-9]+)\b/i);
  if (idMatch) {
    return { type: 'track_complaint', data: { complaintId: idMatch[0].toUpperCase() } };
  }
  if (lower.includes('track') && lower.includes('complaint')) {
    return { type: 'track_prompt' };
  }

  // Check for issue reporting keywords
  const issueTypes = [
    { keywords: ['pothole', 'road', 'hole'], type: 'Pothole' },
    { keywords: ['garbage', 'trash', 'waste', 'dump'], type: 'Garbage overflow' },
    { keywords: ['water', 'leak', 'pipe'], type: 'Water leakage' },
    { keywords: ['streetlight', 'light', 'dark'], type: 'Streetlight not working' },
    { keywords: ['drain', 'drainage', 'sewage', 'flood'], type: 'Drainage issue' },
    { keywords: ['broken road', 'bad road', 'damaged road'], type: 'Broken road' },
  ];

  for (const issue of issueTypes) {
    if (issue.keywords.some(k => lower.includes(k))) {
      const severity = lower.includes('urgent') || lower.includes('danger') || lower.includes('bad')
        ? 'high'
        : lower.includes('minor') || lower.includes('small')
          ? 'low'
          : 'medium';
      return {
        type: 'prefill_report',
        data: { issueType: issue.type, severity, description: text }
      };
    }
  }

  return null;
}

const AIChatbot = ({ onPrefillReport }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleAction = useCallback((action) => {
    if (!action) return;

    if (action.type === 'prefill_report' && onPrefillReport) {
      onPrefillReport(action.data);
      setIsOpen(false);
    }

    if (action.type === 'track_complaint' && action.data?.complaintId) {
      navigate(`/track?id=${encodeURIComponent(action.data.complaintId)}`);
      setIsOpen(false);
    }
  }, [navigate, onPrefillReport]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const conversationHistory = messages
      .filter(m => m !== WELCOME_MESSAGE)
      .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', text: m.text }));

    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationHistory }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to get response');
      }

      // Handle fallback mode: parse user message locally for actions
      let action = data.data.action || null;
      if (data.data.fallback) {
        action = parseLocalAction(text);
      }

      const assistantMsg = {
        role: 'assistant',
        text: data.data.reply,
        action: action,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      // Even on network error, try to parse local actions
      const localAction = parseLocalAction(text);
      const actionMsg = localAction?.type === 'prefill_report'
        ? 'I can help you report this issue. Click the button below to open the form with your details.'
        : localAction?.type === 'track_complaint'
          ? `I found your complaint ID. Click below to track it.`
          : 'Sorry, I encountered an error. Please try again or use the Report Issue button.';

      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: actionMsg, action: localAction },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    setHasUnread(false);
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="ai-chatbot">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header__info">
              <div className="chatbot-avatar">
                <Sparkles size={18} />
              </div>
              <div>
                <h3>CivicFix AI</h3>
                <span className="chatbot-status">Online</span>
              </div>
            </div>
            <button className="chatbot-close" onClick={toggleChat} aria-label="Close chat">
              <X size={18} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg--${msg.role}`}>
                <div className="chatbot-msg__icon">
                  {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="chatbot-msg__bubble">
                  <div
                    className="chatbot-msg__text"
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                  />
                  {msg.action && (
                    <button
                      className="chatbot-action-btn"
                      onClick={() => handleAction(msg.action)}
                    >
                      {msg.action.type === 'prefill_report' && (
                        <>
                          <Sparkles size={14} />
                          Open Report Form with AI Data
                          <ArrowRight size={14} />
                        </>
                      )}
                      {msg.action.type === 'track_complaint' && (
                        <>
                          <Sparkles size={14} />
                          Track Complaint {msg.action.data?.complaintId}
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chatbot-msg chatbot-msg--assistant">
                <div className="chatbot-msg__icon"><Bot size={16} /></div>
                <div className="chatbot-msg__bubble">
                  <div className="chatbot-typing">
                    <Loader2 size={16} className="spinning" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe an issue or ask a question..."
              disabled={loading}
              className="chatbot-input"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="chatbot-send"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <button
        className={`chatbot-fab ${isOpen ? 'chatbot-fab--open' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {hasUnread && !isOpen && <span className="chatbot-fab__badge" />}
      </button>
    </div>
  );
};

export default AIChatbot;
