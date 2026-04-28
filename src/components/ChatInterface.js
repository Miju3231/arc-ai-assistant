import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '12px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--accent-cyan)',
          animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <span style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
        ArcAI is thinking...
      </span>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className="fade-in" style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 12,
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'linear-gradient(135deg, #00c4ff, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0, marginRight: 8, marginTop: 2,
          boxShadow: '0 0 12px rgba(0,212,255,0.3)',
        }}>⚡</div>
      )}
      <div style={{
        maxWidth: '80%',
        padding: '10px 14px',
        borderRadius: isUser ? '12px 12px 2px 12px' : '2px 12px 12px 12px',
        background: isUser
          ? 'linear-gradient(135deg, rgba(0,196,255,0.15), rgba(59,130,246,0.15))'
          : 'rgba(13, 21, 41, 0.8)',
        border: isUser
          ? '1px solid rgba(0,212,255,0.3)'
          : '1px solid var(--border)',
        fontFamily: 'var(--font-display)',
        fontSize: 14,
        lineHeight: 1.6,
        color: 'var(--text-primary)',
      }}>
        <div className="markdown-content">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
      </div>
      {isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'rgba(139,92,246,0.2)',
          border: '1px solid rgba(139,92,246,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0, marginLeft: 8, marginTop: 2,
        }}>👤</div>
      )}
    </div>
  );
}

const QUICK_COMMANDS = [
  { label: '💰 Balance', cmd: 'Show my wallet balance' },
  { label: '💸 Send USDC', cmd: 'Send 1 USDC to ' },
  { label: '💱 Swap', cmd: 'Swap 1 USDC to EURC' },
  { label: '❓ Help', cmd: 'What can you do?' },
];

export default function ChatInterface({ messages, isThinking, onSend, account, onClear }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuick = (cmd) => {
    setInput(cmd);
    inputRef.current?.focus();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column',
      }}>
        {messages.map(msg => <Message key={msg.id} msg={msg} />)}
        {isThinking && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Quick commands */}
      <div style={{
        padding: '8px 16px',
        display: 'flex', gap: 6, flexWrap: 'wrap',
        borderTop: '1px solid var(--border)',
      }}>
        {QUICK_COMMANDS.map(({ label, cmd }) => (
          <button
            key={label}
            onClick={() => handleQuick(cmd)}
            style={{
              padding: '4px 10px',
              borderRadius: 20,
              background: 'rgba(0,212,255,0.06)',
              border: '1px solid rgba(0,212,255,0.15)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-display)', fontSize: 12,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'; e.currentTarget.style.color = 'var(--accent-cyan)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={onClear}
          style={{
            padding: '4px 10px', borderRadius: 20,
            background: 'transparent',
            border: '1px solid rgba(239,68,68,0.2)',
            color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: 12,
            cursor: 'pointer', marginLeft: 'auto',
          }}
        >
          🗑 Clear
        </button>
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: 10,
        background: 'rgba(13,21,41,0.8)',
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={account
              ? "Ask anything or type: send 1 USDC to 0x... / swap 1 USDC to EURC"
              : "Connect your wallet to start..."}
            rows={1}
            disabled={isThinking}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '10px 14px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)', fontSize: 14,
              resize: 'none', outline: 'none',
              transition: 'border-color 0.2s',
              lineHeight: 1.5,
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-cyan)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim() || isThinking}
          className="btn btn-primary"
          style={{ padding: '10px 16px', fontSize: 16, flexShrink: 0 }}
        >
          {isThinking ? <span className="spinning">⟳</span> : '↑'}
        </button>
      </div>
    </div>
  );
}
