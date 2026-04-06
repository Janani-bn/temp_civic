import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import './LiveChatbot.css';

// ============================================================
// 🇮🇳 INDIA-WIDE LOCATION DATABASE
// ============================================================
const INDIAN_CITIES = [
  'mumbai', 'pune', 'nagpur', 'nashik', 'aurangabad', 'solapur', 'kolhapur', 'thane', 'navi mumbai',
  'chennai', 'coimbatore', 'madurai', 'trichy', 'tiruchirappalli', 'salem', 'vellore', 'tirunelveli',
  'erode', 'thoothukudi', 'tiruppur', 'ranipet', 'kanchipuram', 'dindigul', 'thanjavur', 'karur',
  'bengaluru', 'bangalore', 'mysuru', 'mysore', 'hubli', 'dharwad', 'mangaluru', 'mangalore',
  'belagavi', 'bellary', 'bidar', 'tumkur', 'shivamogga', 'davangere',
  'visakhapatnam', 'vizag', 'vijayawada', 'guntur', 'nellore', 'tirupati', 'kurnool', 'rajahmundry',
  'kakinada', 'anantapur', 'kadapa',
  'hyderabad', 'warangal', 'nizamabad', 'karimnagar', 'khammam', 'secunderabad',
  'thiruvananthapuram', 'trivandrum', 'kochi', 'cochin', 'kozhikode', 'calicut', 'thrissur',
  'kollam', 'palakkad', 'alappuzha', 'kannur', 'kasaragod',
  'delhi', 'new delhi', 'noida', 'gurgaon', 'gurugram', 'faridabad', 'ghaziabad',
  'lucknow', 'kanpur', 'agra', 'varanasi', 'allahabad', 'prayagraj', 'meerut', 'bareilly',
  'aligarh', 'moradabad', 'saharanpur', 'gorakhpur', 'mathura', 'firozabad',
  'kolkata', 'calcutta', 'howrah', 'durgapur', 'asansol', 'siliguri', 'bardhaman',
  'jaipur', 'jodhpur', 'udaipur', 'kota', 'bikaner', 'ajmer', 'bhilwara', 'alwar',
  'ahmedabad', 'surat', 'vadodara', 'baroda', 'rajkot', 'bhavnagar', 'jamnagar', 'gandhinagar',
  'bhopal', 'indore', 'jabalpur', 'gwalior', 'ujjain', 'sagar', 'rewa', 'satna',
  'patna', 'gaya', 'bhagalpur', 'muzaffarpur', 'purnia', 'darbhanga',
  'ludhiana', 'amritsar', 'jalandhar', 'patiala', 'bathinda', 'mohali',
  'chandigarh', 'ambala', 'hisar', 'rohtak', 'panipat', 'karnal', 'sonipat',
  'bhubaneswar', 'cuttack', 'rourkela', 'berhampur', 'sambalpur',
  'guwahati', 'silchar', 'dibrugarh', 'jorhat', 'nagaon',
  'ranchi', 'jamshedpur', 'dhanbad', 'bokaro', 'hazaribagh',
  'raipur', 'bhilai', 'durg', 'bilaspur', 'korba',
  'shimla', 'manali', 'dharamsala', 'solan', 'mandi',
  'dehradun', 'haridwar', 'rishikesh', 'nainital', 'roorkee',
  'panaji', 'margao', 'vasco', 'mapusa',
  'srinagar', 'jammu', 'leh',
  'imphal', 'shillong', 'aizawl', 'kohima', 'itanagar', 'agartala', 'gangtok',
];

const KNOWN_AREAS = [
  'perumbakkam', 'adyar', 'anna nagar', 'velachery', 'tambaram', 'chromepet', 'porur',
  'ambattur', 'avadi', 'sholinganallur', 'pallavaram', 'kodambakkam', 'nungambakkam',
  'egmore', 't nagar', 'mylapore', 'besant nagar', 'thiruvanmiyur', 'medavakkam',
  'perungudi', 'thoraipakkam', 'navalur', 'siruseri', 'kelambakkam', 'kolathur',
  'villivakkam', 'madhavaram', 'tondiarpet', 'royapuram', 'tiruvottiyur', 'madipakkam',
  'poonamallee', 'gerugambakkam', 'valasaravakkam', 'ramapuram', 'virugambakkam',
  'whitefield', 'koramangala', 'indiranagar', 'jayanagar', 'jp nagar', 'bannerghatta',
  'electronic city', 'hsr layout', 'btm layout', 'marathahalli', 'bellandur',
  'hebbal', 'yelahanka', 'rajajinagar', 'malleshwaram', 'basavanagudi',
  'andheri', 'bandra', 'borivali', 'dadar', 'kurla', 'malad', 'kandivali',
  'ghatkopar', 'mulund', 'vile parle', 'santacruz', 'juhu', 'powai',
  'chembur', 'vikhroli', 'govandi', 'dombivli', 'kalyan', 'ulhasnagar', 'worli', 'lower parel',
  'hitech city', 'madhapur', 'gachibowli', 'kukatpally', 'ameerpet',
  'dilsukhnagar', 'lb nagar', 'uppal', 'miyapur', 'kondapur', 'manikonda',
  'hinjewadi', 'kothrud', 'viman nagar', 'hadapsar', 'wakad', 'baner',
  'aundh', 'pimpri', 'chinchwad', 'kharadi', 'magarpatta', 'kalyani nagar',
  'rohini', 'dwarka', 'janakpuri', 'pitampura', 'laxmi nagar', 'preet vihar',
  'saket', 'vasant kunj', 'green park', 'hauz khas', 'karol bagh', 'paharganj',
  'civil lines', 'cantonment', 'old city', 'new town',
];

// ============================================================
// ONE-SHOT PARSER
// ============================================================
const parseMessage = (text) => {
  const lower = text.toLowerCase();

  let issueType = 'Others';
  if (lower.includes('garbage') || lower.includes('trash') || lower.includes('waste') || lower.includes('dump'))
    issueType = 'Garbage overflow';
  else if (lower.includes('pothole') || lower.includes('pot hole')) issueType = 'Pothole';
  else if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe')) issueType = 'Water leakage';
  else if (lower.includes('light') || lower.includes('lamp') || lower.includes('streetlight')) issueType = 'Streetlight not working';
  else if (lower.includes('drain') || lower.includes('sewer') || lower.includes('sewage')) issueType = 'Drainage issue';
  else if (lower.includes('road') || lower.includes('broken') || lower.includes('damaged')) issueType = 'Broken road';
  else if (lower.includes('noise') || lower.includes('sound')) issueType = 'Noise pollution';
  else if (lower.includes('tree') || lower.includes('fallen')) issueType = 'Fallen tree';
  else if (lower.includes('flood') || lower.includes('waterlog')) issueType = 'Flooding';

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch = text.match(/(?:\+91[-\s]?)?\b[6-9]\d{9}\b/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  const nameMatch = text.match(/(?:my name is|i am|i'm|name[:\s]+)\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i);
  const name = nameMatch ? nameMatch[1].trim() : '';

  let duration = '';
  const durationMatch = text.match(/(?:for|since|past|last)\s+(\d+\s*(days?|weeks?|months?|years?))/i);
  if (durationMatch) duration = durationMatch[1];

  let severity = 'medium';
  if (lower.includes('urgent') || lower.includes('dangerous') || lower.includes('high') || lower.includes('serious') || lower.includes('severe')) severity = 'high';
  else if (lower.includes('minor') || lower.includes('low') || lower.includes('small')) severity = 'low';

  let area = '';
  let city = '';

  const locWithPrep = text.match(/\b(?:in|at|near|around)\s+([A-Za-z][A-Za-z\s]{1,30}?)(?:\s*,\s*([A-Za-z][A-Za-z\s]{1,20}?))?(?=\s|,|$|\.|;)/i);
  if (locWithPrep) {
    const part1 = locWithPrep[1]?.trim().toLowerCase() || '';
    const part2 = locWithPrep[2]?.trim().toLowerCase() || '';
    if (INDIAN_CITIES.includes(part2)) { area = locWithPrep[1].trim(); city = locWithPrep[2].trim(); }
    else if (INDIAN_CITIES.includes(part1)) { city = locWithPrep[1].trim(); }
    else { area = locWithPrep[1].trim(); if (part2) city = locWithPrep[2].trim(); }
  }

  if (!area) {
    for (const a of KNOWN_AREAS) {
      if (new RegExp(`\\b${a}\\b`, 'i').test(lower)) {
        area = a.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }
  }
  if (!city) {
    for (const c of INDIAN_CITIES) {
      if (new RegExp(`\\b${c}\\b`, 'i').test(lower)) {
        city = c.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }
  }
  if (!area && !city) {
    const commaWords = [...text.matchAll(/,\s*([A-Za-z][A-Za-z\s]{1,25}?)(?=\s*(?:,|$|\.|;))/gi)];
    const stopWords = new Set(['my', 'the', 'and', 'for', 'is', 'email', 'phone', 'number', 'please', 'contact', 'it', 'this', 'that', 'here', 'there']);
    for (const match of commaWords) {
      const candidate = match[1].trim();
      if (!stopWords.has(candidate.toLowerCase())) { area = candidate; break; }
    }
  }

  let description = text;
  if (email) description = description.replace(email, '');
  if (phone) description = description.replace(phone, '');
  if (name) description = description.replace(nameMatch[0], '');
  if (duration) description = description.replace(/(?:for|since|past|last)\s+\d+\s*(days?|weeks?|months?|years?)/i, '');
  if (area) description = description.replace(new RegExp(`\\b${area}\\b`, 'gi'), '');
  if (city) description = description.replace(new RegExp(`\\b${city}\\b`, 'gi'), '');
  description = description.replace(/\b(?:in|at|near|around)\s+[A-Za-z\s,]+/i, '');
  description = description.replace(/\bmy email is\b|\bemail is\b|\bemail\b|\bphone\b|\bnumber\b|\bcontact\b/gi, '');
  description = description.replace(/\b(?:urgent|dangerous|serious|severe|minor|low|high)\b/gi, '');
  description = description.replace(/[,]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/^[,.\s]+|[,.\s]+$/g, '').trim();

  return { issueType, email, phone, name, area, city, duration, description, severity };
};

// ============================================================
// CONSTANTS
// ============================================================
const ISSUE_OPTIONS = [
  { emoji: '🗑️', label: 'Garbage overflow' },
  { emoji: '🕳️', label: 'Pothole' },
  { emoji: '💧', label: 'Water leakage' },
  { emoji: '💡', label: 'Streetlight not working' },
  { emoji: '🚰', label: 'Drainage issue' },
  { emoji: '🛣️', label: 'Broken road' },
  { emoji: '📢', label: 'Noise pollution' },
  { emoji: '🌳', label: 'Fallen tree' },
  { emoji: '🌊', label: 'Flooding' },
  { emoji: '❓', label: 'Others' },
];

const SEVERITY_OPTIONS = [
  { emoji: '🟢', label: 'Low – minor inconvenience', value: 'low' },
  { emoji: '🟡', label: 'Medium – affects daily life', value: 'medium' },
  { emoji: '🔴', label: 'High – dangerous / urgent', value: 'high' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
const LiveChatbot = ({ onAutoFill }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState('welcome');
  const [formData, setFormData] = useState({
    issueType: '', description: '', area: '', city: '',
    severity: 'medium', name: '', phone: '', email: '',
  });
  const [showOptions, setShowOptions] = useState(null);
  const [started, setStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showOptions, isTyping]);

  const botSay = (text, delay = 0, afterFn = null) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text }]);
      if (afterFn) afterFn();
    }, delay + 600);
  };

  const userSay = (text) => {
    setMessages(prev => [...prev, { sender: 'user', text }]);
  };

  // Boot when opened
  useEffect(() => {
    if (isOpen && !started) {
      setStarted(true);
      botSay("👋 Hey! How can I help you today?", 200, () => {
        botSay(
          "I can help you report a civic issue in your area.\n\nChoose how you'd like to proceed:",
          400,
          () => setShowOptions('start')
        );
      });
    }
  }, [isOpen]);

  const goToStep = (nextStep, data) => {
    setStep(nextStep);
    const d = data || formData;
    switch (nextStep) {
      case 'ask_issue':
        botSay("What type of issue are you reporting?", 200, () => setShowOptions('issue'));
        break;
      case 'ask_description':
        botSay("Please describe the problem briefly.", 200);
        break;
      case 'ask_area':
        botSay("Which locality / area is this in?\n(e.g. Koramangala, Andheri, Anna Nagar)", 200);
        break;
      case 'ask_city':
        botSay("Which city? (e.g. Chennai, Mumbai, Delhi)", 200);
        break;
      case 'ask_severity':
        botSay("How serious is this issue?", 200, () => setShowOptions('severity'));
        break;
      case 'ask_name':
        botSay("What's your name? (type 'skip' to skip)", 200);
        break;
      case 'ask_phone':
        botSay("Your 10-digit phone number? (type 'skip' to skip)", 200);
        break;
      case 'ask_email':
        botSay("Your email address? (type 'skip' to skip)", 200);
        break;
      case 'confirm':
        setTimeout(() => showSummary(d), 700);
        break;
      default:
        break;
    }
  };

  const showSummary = (data) => {
    const locationStr = [data.area, data.city].filter(Boolean).join(', ') || 'Not specified';
    const severityLabel = SEVERITY_OPTIONS.find(s => s.value === data.severity)?.label || data.severity;

    const lines = [
      "✅ Here's a summary of your report:\n",
      `📋 Issue: ${data.issueType || 'Not specified'}`,
      `📝 Description: ${data.description || 'Not specified'}`,
      `📍 Location: ${locationStr}`,
      `⚠️ Severity: ${severityLabel}`,
      data.name ? `👤 Name: ${data.name}` : null,
      data.phone ? `📞 Phone: ${data.phone}` : null,
      data.email ? `✉️ Email: ${data.email}` : null,
    ].filter(Boolean).join('\n');

    botSay(lines, 200, () => {
      setTimeout(() => {
        onAutoFill(data);
        botSay("🎉 Form auto-filled! Please review and hit Submit.", 200);
      }, 800);
    });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const val = input.trim();
    setInput('');
    setShowOptions(null);
    userSay(val);

    // One-shot mode
    if (step === 'welcome' || step === 'oneshot') {
      const parsed = parseMessage(val);
      const merged = { ...formData, ...parsed };
      const hasEnough = parsed.issueType !== 'Others' || parsed.area || parsed.city || parsed.phone || parsed.email;
      if (hasEnough) {
        setFormData(merged);
        setStep('confirm');
        setTimeout(() => showSummary(merged), 600);
      } else {
        setFormData(prev => ({ ...prev, description: val }));
        botSay("I couldn't detect enough details automatically. Let me guide you 😊", 200, () => {
          goToStep('ask_issue', { ...formData, description: val });
        });
      }
      return;
    }

    const skip = val.toLowerCase() === 'skip';

    switch (step) {
      case 'ask_description': {
        const d = { ...formData, description: val };
        setFormData(d);
        goToStep('ask_area', d);
        break;
      }
      case 'ask_area': {
        const d = { ...formData, area: skip ? '' : val };
        setFormData(d);
        goToStep('ask_city', d);
        break;
      }
      case 'ask_city': {
        const d = { ...formData, city: skip ? '' : val };
        setFormData(d);
        goToStep('ask_severity', d);
        break;
      }
      case 'ask_name': {
        const d = { ...formData, name: skip ? '' : val };
        setFormData(d);
        goToStep('ask_phone', d);
        break;
      }
      case 'ask_phone': {
        const phoneMatch = val.match(/(?:\+91[-\s]?)?\b[6-9]\d{9}\b/);
        if (!skip && !phoneMatch) {
          botSay("⚠️ Please enter a valid 10-digit Indian phone number, or type 'skip'.", 200);
          return;
        }
        const d = { ...formData, phone: skip ? '' : (phoneMatch ? phoneMatch[0] : '') };
        setFormData(d);
        goToStep('ask_email', d);
        break;
      }
      case 'ask_email': {
        const emailMatch = val.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (!skip && !emailMatch) {
          botSay("⚠️ That doesn't look like a valid email. Try again or type 'skip'.", 200);
          return;
        }
        const d = { ...formData, email: skip ? '' : (emailMatch ? emailMatch[0] : '') };
        setFormData(d);
        goToStep('confirm', d);
        break;
      }
      default:
        break;
    }
  };

  const handleOption = (type, value) => {
    setShowOptions(null);

    if (type === 'start') {
      if (value === 'guided') {
        userSay('Guide me step by step 🪄');
        goToStep('ask_issue');
      } else {
        userSay('I\'ll describe everything at once 💬');
        botSay("Perfect! Describe the issue — include location, phone, email, whatever you have 👇", 200);
        setStep('oneshot');
      }
      return;
    }

    if (type === 'issue') {
      userSay(`${value.emoji} ${value.label}`);
      const d = { ...formData, issueType: value.label };
      setFormData(d);
      goToStep('ask_description', d);
      return;
    }

    if (type === 'severity') {
      userSay(`${value.emoji} ${value.label}`);
      const d = { ...formData, severity: value.value };
      setFormData(d);
      goToStep('ask_name', d);
      return;
    }
  };

  const handleReset = () => {
    setMessages([]);
    setStep('welcome');
    setFormData({ issueType: '', description: '', area: '', city: '', severity: 'medium', name: '', phone: '', email: '' });
    setShowOptions(null);
    setStarted(false);
    setIsTyping(false);
    setTimeout(() => {
      botSay("👋 Hey! How can I help you today?", 200, () => {
        botSay("Choose how you'd like to proceed:", 400, () => setShowOptions('start'));
      });
    }, 200);
  };

  return (
    <div className="chatbot-container">
      {!isOpen ? (
        <button className="chatbot-toggle-btn animate-bounce-soft" onClick={() => setIsOpen(true)}>
          <span style={{ fontSize: '22px', marginRight: '8px' }}>🤖</span>
          <span>CivicFix Assistant</span>
        </button>
      ) : (
        <div className="chatbot-window animate-fade-in-up">

          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span style={{ fontSize: '20px' }}>🤖</span>
              <span>CivicFix Assistant</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button onClick={handleReset} className="chatbot-reset-btn" title="Start over">
                🔄
              </button>
              <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-bubble ${m.sender === 'user' ? 'user' : 'bot'}`}
                style={{ whiteSpace: 'pre-line' }}
              >
                {m.text}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="chat-bubble bot typing-indicator">
                <span /><span /><span />
              </div>
            )}

            {/* Quick Options */}
            {!isTyping && showOptions === 'start' && (
              <div className="quick-options">
                <button className="option-btn wide" onClick={() => handleOption('start', 'oneshot')}>
                  💬 Describe everything at once
                </button>
                <button className="option-btn wide" onClick={() => handleOption('start', 'guided')}>
                  🪄 Guide me step by step
                </button>
              </div>
            )}

            {!isTyping && showOptions === 'issue' && (
              <div className="quick-options grid">
                {ISSUE_OPTIONS.map(opt => (
                  <button key={opt.label} className="option-btn" onClick={() => handleOption('issue', opt)}>
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            )}

            {!isTyping && showOptions === 'severity' && (
              <div className="quick-options">
                {SEVERITY_OPTIONS.map(opt => (
                  <button key={opt.value} className="option-btn wide" onClick={() => handleOption('severity', opt)}>
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
            />
            <button className="chatbot-send-btn" onClick={handleSend} disabled={!input.trim()}>
              <Send size={18} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default LiveChatbot;