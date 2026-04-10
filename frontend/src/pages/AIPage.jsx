import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  HiOutlineChatAlt2, HiOutlinePaperAirplane, HiOutlineSparkles,
  HiOutlineTrash, HiOutlineClock, HiOutlineStatusOnline
} from 'react-icons/hi';

export default function AIPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [aiHealth, setAiHealth] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchSuggestions();
    checkAIHealth();
    if (user) fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSuggestions = async () => {
    try {
      const res = await api.get('/ai/suggestions');
      if (res.data.success) setSuggestions(res.data.data);
    } catch { /* silent */ }
  };

  const checkAIHealth = async () => {
    try {
      const res = await api.get('/ai/health');
      if (res.data.success) setAiHealth(res.data.data);
    } catch {
      setAiHealth({ status: 'offline' });
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/ai/history');
      if (res.data.success) setHistory(res.data.data);
    } catch { /* silent */ }
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg, time: new Date() }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: msg,
        sessionId,
        includeContext: true,
        currentScreen: 'AI',
        userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      if (res.data.success) {
        const { response, sessionId: sid } = res.data.data;
        if (sid) setSessionId(sid);
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: response,
          time: new Date(),
          context: res.data.data.context,
        }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. The AI service might be offline. Please try again later.',
        time: new Date(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    fetchSuggestions();
  };

  const loadSession = async (sid) => {
    setShowHistory(false);
    setSessionId(sid);
    setMessages([]);
    // The history will be loaded server-side for context, but we show a fresh UI with a note
    setMessages([{
      role: 'assistant',
      content: 'Resuming previous session. Feel free to continue our conversation!',
      time: new Date(),
    }]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-6 flex flex-col" style={{ height: 'calc(100vh - 76px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white flex items-center gap-3">
            <HiOutlineSparkles className="w-7 h-7 text-nebula-400" />
            Space AI
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Your intelligent space companion</p>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
            aiHealth?.status === 'online'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-gray-500/10 border border-gray-500/20 text-gray-400'
          }`}>
            <HiOutlineStatusOnline className="w-3.5 h-3.5" />
            {aiHealth?.model || 'AI'} • {aiHealth?.status || '...'}
          </div>
          {user && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-nebula-400 hover:border-nebula-500/30 transition-all"
              title="Chat History"
            >
              <HiOutlineClock className="w-4 h-4" />
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-cosmic-400 hover:border-cosmic-500/30 transition-all"
              title="Clear Chat"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="glass-card p-4 mb-4 shrink-0 max-h-48 overflow-y-auto animate-slide-up">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Recent Sessions</h3>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No chat history yet.</p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <button
                  key={h.sessionId}
                  onClick={() => loadSession(h.sessionId)}
                  className="w-full text-left p-3 rounded-xl bg-space-700/30 border border-white/5 hover:border-nebula-500/30 transition-all"
                >
                  <p className="text-sm font-medium text-white line-clamp-1">{h.title || 'Untitled'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{h.messageCount} messages • {new Date(h.updatedAt).toLocaleDateString()}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl glass-card p-4 sm:p-6 space-y-4 mb-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-nebula-500 to-aurora-500 flex items-center justify-center text-4xl
                            shadow-2xl shadow-nebula-500/30 mb-6 animate-float">
              🤖
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-2">Ask me anything about space!</h2>
            <p className="text-gray-500 max-w-sm mb-8">
              I know about the ISS, astronauts, orbital mechanics, NASA missions, and more.
            </p>

            {/* Suggestion Chips */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s.text)}
                    className="px-4 py-2 rounded-xl bg-space-700/50 border border-white/10 text-sm text-gray-300
                               hover:border-nebula-500/40 hover:bg-nebula-500/10 hover:text-nebula-300 transition-all duration-300"
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} />
          ))
        )}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-nebula-500 to-aurora-500 flex items-center justify-center text-sm shrink-0">
              🤖
            </div>
            <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-md">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-nebula-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-nebula-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-nebula-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="shrink-0 glass-card p-3 flex items-end gap-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about space, the ISS, astronauts..."
          className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none resize-none text-sm py-2 px-2 max-h-32"
          rows={1}
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="p-3 rounded-xl bg-gradient-to-r from-nebula-500 to-nebula-400 text-white
                     disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-nebula-500/30
                     transition-all duration-300 shrink-0"
        >
          <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
        </button>
      </div>
    </div>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
        isUser
          ? 'bg-gradient-to-br from-solar-500 to-cosmic-500'
          : 'bg-gradient-to-br from-nebula-500 to-aurora-500'
      }`}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-nebula-500/20 border border-nebula-500/20 text-white rounded-tr-md'
          : message.isError
            ? 'bg-cosmic-500/10 border border-cosmic-500/20 text-cosmic-300 rounded-tl-md'
            : 'glass-card text-gray-200 rounded-tl-md'
      }`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={`text-[10px] mt-2 ${isUser ? 'text-nebula-400/60' : 'text-gray-600'}`}>
          {message.time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
