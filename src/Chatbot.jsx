// File: src/Chatbot.jsx
import { useState, useRef, useEffect } from "react";
import './index.css';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! Ask me about groundwater levels 🌊", timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };
      
      recognitionInstance.onend = () => setIsListening(false);
      setRecognition(recognitionInstance);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Save conversation to history
  useEffect(() => {
    if (messages.length > 1 && messages[messages.length - 1].sender === "bot") {
      const lastUserMessage = messages.slice().reverse().find(msg => msg.sender === "user");
      if (lastUserMessage) {
        const title = lastUserMessage.text.length > 30 ? lastUserMessage.text.substring(0, 30) + "..." : lastUserMessage.text;
        setConversationHistory(prev => {
          const exists = prev.find(conv => conv.messages[0]?.text === lastUserMessage.text);
          if (!exists) {
            return [{ id: Date.now(), title, messages: [...messages], timestamp: new Date() }, ...prev.slice(0, 9)];
          }
          return prev;
        });
      }
    }
  }, [messages]);

  const loadConversation = (conv) => {
    setSelectedConversation(conv);
    setMessages(conv.messages);
  };

  const startNewConversation = () => {
    setSelectedConversation(null);
    setMessages([{ sender: "bot", text: "Hello! Ask me about groundwater levels 🌊", timestamp: new Date() }]);
    setInput("");
  };

  const handleSend = (text = input) => {
    if (!text.trim()) return;
    const newMessage = { sender: "user", text, timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = "";
      const lowerText = text.toLowerCase();
      if (lowerText.includes("water level") || lowerText.includes("groundwater")) {
        botResponse = `Based on the latest data, groundwater levels in "${text}" show seasonal variations with an average depth of 15.3 meters. Would you like more specific data?`;
      } else if (lowerText.includes("thank")) {
        botResponse = "You're welcome! Feel free to ask about any other groundwater-related topics. 💧";
      } else if (lowerText.includes("help")) {
        botResponse = "I can help you with groundwater level data, trends, seasonal variations, and regional comparisons. What would you like to know?";
      } else {
        botResponse = `I found some information related to "${text}". Groundwater monitoring shows that levels vary based on seasonal rainfall, human usage, and geological factors. Would you like me to elaborate?`;
      }
      setMessages(prev => [...prev, { sender: "bot", text: botResponse, timestamp: new Date() }]);
      setIsTyping(false);
    }, 1500);
  };

  const toggleVoiceRecognition = () => {
    if (!recognition) return;
    if (isListening) recognition.stop();
    else recognition.start();
    setIsListening(!isListening);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Conversations</h2>
          <button className="new-chat-btn" onClick={startNewConversation}>New Chat</button>
        </div>
        <div className="conversation-list">
          {conversationHistory.length === 0 ? (
            <p className="no-conversations">No conversation history yet</p>
          ) : conversationHistory.map(conv => (
            <div key={conv.id} className={`conversation-item ${selectedConversation?.id === conv.id ? "selected" : ""}`} onClick={() => loadConversation(conv)}>
              <div className="conversation-title">{conv.title}</div>
              <div className="conversation-timestamp">{conv.timestamp.toLocaleDateString()} {conv.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="main-area">
        <div className="chat-header">
          <h1 className="chat-title">HydroIntel Chatbot</h1>
          <div className="header-actions">
            {recognition && (
              <button className={`voice-btn ${isListening ? "listening" : ""}`} onClick={toggleVoiceRecognition}>
                {isListening ? "Stop" : "Voice"}
              </button>
            )}
            <button className="new-chat-btn" onClick={startNewConversation}>New Conversation</button>
          </div>
        </div>

        <div className="messages-container">
          <div className="messages-wrapper">
            {messages.map((msg, index) => (
              <div key={index} className={`message-row ${msg.sender}`}>
                <div className={`avatar ${msg.sender}`}>{msg.sender === "bot" ? "B" : "Y"}</div>
                <div className={`message-bubble ${msg.sender}`}>
                  <div className="message-text">{msg.text}</div>
                  <div className={`message-time ${msg.sender}`}>{msg.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                </div>
              </div>
            ))}
            {isTyping && <div className="typing-indicator"><div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div></div>}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="input-area">
  <div className="input-wrapper">
    {recognition && (
      <button 
        className={`voice-btn-input ${isListening ? "listening" : ""}`} 
        onClick={toggleVoiceRecognition}
      >
        🎤
      </button>
    )}
    <input
      ref={inputRef}
      type="text"
      className="message-input"
      value={input}
      onChange={e => setInput(e.target.value)}
      placeholder="Type a message about groundwater levels..."
      onKeyDown={e => e.key === "Enter" && handleSend()}
    />
    <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>Send</button>
  </div>
</div>


        {isListening && (
          <div className="listening-indicator">
            <span className="listening-badge"><span className="listening-pulse"></span>Listening...</span>
          </div>
        )}
      </div>
    </div>
  );
}
