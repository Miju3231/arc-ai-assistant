import React from 'react';
import { getTxExplorerUrl } from '../utils/transactions';

const LOG_STYLES = {
  info: { color: 'var(--text-secondary)', icon: 'ℹ', bg: 'rgba(59,130,246,0.05)', border: 'rgba(59,130,246,0.2)' },
  pending: { color: 'var(--accent-yellow)', icon: '⏳', bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.2)' },
  success: { color: 'var(--accent-green)', icon: '✅', bg: 'rgba(16,185,129,0.05)', border: 'rgba(16,185,129,0.2)' },
  error: { color: 'var(--accent-red)', icon: '❌', bg: 'rgba(239,68,68,0.05)', border: 'rgba(239,68,68,0.2)' },
};

export default function TxLog({ logs, onClear }) {
  const bottomRef = React.useRef(null);

  React.useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          Transaction Log
        </span>
        {logs.length > 0 && (
          <button
            onClick={onClear}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-tech)' }}
          >
            CLEAR
          </button>
        )}
      </div>

      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {logs.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 8, color: 'var(--text-muted)',
          }}>
            <div style={{ fontSize: 24, opacity: 0.4 }}>📋</div>
            <div style={{ fontFamily: 'var(--font-tech)', fontSize: 11 }}>No transactions yet</div>
            <div style={{ fontFamily: 'var(--font-tech)', fontSize: 10, opacity: 0.6 }}>
              Transaction logs will appear here
            </div>
          </div>
        ) : (
          logs.map((log, index) => {
            const style = LOG_STYLES[log.type] || LOG_STYLES.info;
            return (
              <div
                key={index}
                className="fade-in"
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  animation: 'fadeIn 0.3s ease',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-tech)', fontSize: 11,
                  color: style.color,
                  lineHeight: 1.5,
                  wordBreak: 'break-all',
                }}>
                  {log.text}
                </div>
                {log.hash && (
                  <a
                    href={getTxExplorerUrl(log.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block', marginTop: 4,
                      fontFamily: 'var(--font-tech)', fontSize: 10,
                      color: 'var(--accent-cyan)', textDecoration: 'none',
                      opacity: 0.8,
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
                  >
                    🔗 View on Explorer →
                  </a>
                )}
                {log.blockNumber && (
                  <div style={{ fontFamily: 'var(--font-tech)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                    Block #{log.blockNumber}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
