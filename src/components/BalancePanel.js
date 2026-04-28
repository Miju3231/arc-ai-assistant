import React from 'react';
import { TOKENS, FAUCET_URL } from '../utils/constants';

export default function BalancePanel({ account, balances, isLoadingBalances, onRefresh }) {
  if (!account) {
    return (
      <div className="card" style={{ padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔌</div>
        <div style={{ fontFamily: 'var(--font-tech)', fontSize: 12, color: 'var(--text-muted)' }}>
          Connect wallet to view balances
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          Wallet Balances
        </span>
        <button
          onClick={onRefresh}
          disabled={isLoadingBalances}
          style={{
            background: 'none', border: 'none',
            color: 'var(--accent-cyan)', cursor: 'pointer',
            fontSize: 16, padding: 2,
            opacity: isLoadingBalances ? 0.5 : 1,
            transition: 'transform 0.3s',
            transform: isLoadingBalances ? 'rotate(360deg)' : 'rotate(0)',
          }}
          title="Refresh balances"
        >
          ⟳
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(TOKENS).map(([symbol, token]) => {
          const balance = parseFloat(balances[symbol] || '0');
          return (
            <div key={symbol} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 8,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: `${token.color}22`,
                  border: `1px solid ${token.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>{token.icon}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>{symbol}</div>
                  <div style={{ fontFamily: 'var(--font-tech)', fontSize: 10, color: 'var(--text-muted)' }}>{token.name}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {isLoadingBalances ? (
                  <div style={{ fontFamily: 'var(--font-tech)', fontSize: 13, color: 'var(--text-muted)', animation: 'pulse 1s infinite' }}>
                    Loading...
                  </div>
                ) : (
                  <div style={{ fontFamily: 'var(--font-tech)', fontSize: 14, color: balance > 0 ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 700 }}>
                    {balance.toFixed(4)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <a
        href={FAUCET_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block', marginTop: 12,
          textAlign: 'center',
          padding: '8px',
          borderRadius: 6,
          background: 'rgba(0, 212, 255, 0.05)',
          border: '1px dashed rgba(0, 212, 255, 0.2)',
          color: 'var(--accent-cyan)',
          fontFamily: 'var(--font-tech)', fontSize: 11,
          textDecoration: 'none',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,212,255,0.05)'}
      >
        🚰 Get test tokens from Circle Faucet
      </a>
    </div>
  );
}
