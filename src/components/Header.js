import React from 'react';
import { ARC_TESTNET } from '../utils/constants';
import { formatAddress } from '../utils/transactions';

export default function Header({ account, chainId, isConnecting, isArcNetwork, onConnect, onDisconnect, onSwitchArc }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(13, 21, 41, 0.95)',
      backdropFilter: 'blur(20px)',
      position: 'relative',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36,
          background: 'linear-gradient(135deg, #00c4ff, #3b82f6)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
          boxShadow: 'var(--glow-cyan)',
        }}>⚡</div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: 2,
            color: '#fff',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
            ARC<span style={{ color: 'var(--accent-cyan)' }}>AI</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-tech)',
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: 1,
          }}>AGENT v1.0 · TESTNET</div>
        </div>
      </div>

      {/* Center - Network badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {account && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 12px',
            borderRadius: 20,
            background: isArcNetwork
              ? 'rgba(16, 185, 129, 0.1)'
              : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${isArcNetwork ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: isArcNetwork ? 'var(--accent-green)' : 'var(--accent-yellow)',
              boxShadow: isArcNetwork ? '0 0 8px #10b981' : '0 0 8px #f59e0b',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{
              fontFamily: 'var(--font-tech)', fontSize: 11,
              color: isArcNetwork ? 'var(--accent-green)' : 'var(--accent-yellow)',
            }}>
              {isArcNetwork ? 'ARC TESTNET' : `CHAIN ${chainId}`}
            </span>
            {!isArcNetwork && account && (
              <button
                onClick={onSwitchArc}
                style={{
                  fontFamily: 'var(--font-tech)', fontSize: 10,
                  background: 'var(--accent-yellow)', color: '#000',
                  border: 'none', borderRadius: 4, padding: '2px 6px',
                  cursor: 'pointer', fontWeight: 700,
                }}
              >SWITCH</button>
            )}
          </div>
        )}
      </div>

      {/* Right - Wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {account ? (
          <>
            <div style={{
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(0, 212, 255, 0.08)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              fontFamily: 'var(--font-tech)',
              fontSize: 12,
              color: 'var(--accent-cyan)',
              cursor: 'pointer',
            }}
              onClick={() => window.open(`https://testnet.arcscan.app/address/${account}`, '_blank')}
              title="View on explorer"
            >
              👛 {formatAddress(account)}
            </div>
            <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 11 }} onClick={onDisconnect}>
              DISCONNECT
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary"
            onClick={onConnect}
            disabled={isConnecting}
            style={{ fontSize: 12, padding: '8px 18px' }}
          >
            {isConnecting ? (
              <><span className="spinning" style={{ fontSize: 14 }}>⟳</span> CONNECTING</>
            ) : (
              <><span>🦊</span> CONNECT WALLET</>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
