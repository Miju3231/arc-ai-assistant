import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import BalancePanel from './components/BalancePanel';
import TxLog from './components/TxLog';
import { useWallet } from './hooks/useWallet';
import { useAIAgent } from './hooks/useAIAgent';
import { parseCommand, executeTransfer, executeSwap } from './utils/transactions';
import { TOKENS } from './utils/constants';

export default function App() {
  const wallet = useWallet();
  const ai = useAIAgent();
  const [txLogs, setTxLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'logs'

  const addLog = useCallback((log) => {
    setTxLogs(prev => [...prev, { ...log, timestamp: Date.now() }]);
  }, []);

  const handleUserMessage = useCallback(async (message) => {
    const parsed = parseCommand(message);

    if (parsed.action === 'CHAT' || parsed.action === 'BALANCE') {
      // Pure AI chat or balance check
      await ai.sendMessage(message, {
        account: wallet.account,
        balances: wallet.balances,
        isArcNetwork: wallet.isArcNetwork,
      });

      if (parsed.action === 'BALANCE') {
        wallet.refreshBalances();
      }
      return;
    }

    // Blockchain actions — first get AI confirmation, then execute
    await ai.sendMessage(message, {
      account: wallet.account,
      balances: wallet.balances,
      isArcNetwork: wallet.isArcNetwork,
    });

    if (!wallet.account) {
      addLog({ type: 'error', text: '❌ Wallet not connected. Please connect your wallet first.' });
      return;
    }

    if (!wallet.isArcNetwork) {
      addLog({ type: 'error', text: '❌ Wrong network. Please switch to Arc Testnet.' });
      await wallet.switchToArc();
      return;
    }

    // Switch to logs tab to show tx progress
    setActiveTab('logs');

    if (parsed.action === 'SEND') {
      const { token, amount, to } = parsed;
      if (!TOKENS[token]) {
        addLog({ type: 'error', text: `❌ Unknown token: ${token}. Supported: ${Object.keys(TOKENS).join(', ')}` });
        return;
      }
      try {
        await executeTransfer(wallet.signer, token, to, amount, addLog);
        wallet.refreshBalances();
      } catch (e) {
        console.error('Transfer error:', e);
      }
    } else if (parsed.action === 'SWAP') {
      const { fromToken, toToken, amount } = parsed;
      if (!TOKENS[fromToken]) {
        addLog({ type: 'error', text: `❌ Unknown token: ${fromToken}` });
        return;
      }
      if (!TOKENS[toToken]) {
        addLog({ type: 'error', text: `❌ Unknown token: ${toToken}` });
        return;
      }
      try {
        await executeSwap(wallet.signer, fromToken, toToken, amount, addLog);
        wallet.refreshBalances();
      } catch (e) {
        console.error('Swap error:', e);
      }
    }
  }, [wallet, ai, addLog]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div className="grid-bg" />
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      {/* Header */}
      <Header
        account={wallet.account}
        chainId={wallet.chainId}
        isConnecting={wallet.isConnecting}
        isArcNetwork={wallet.isArcNetwork}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
        onSwitchArc={wallet.switchToArc}
      />

      {/* Error banner */}
      {wallet.error && (
        <div style={{
          padding: '8px 24px',
          background: 'rgba(239,68,68,0.1)',
          borderBottom: '1px solid rgba(239,68,68,0.3)',
          fontFamily: 'var(--font-tech)', fontSize: 12,
          color: 'var(--accent-red)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 10, position: 'relative',
        }}>
          ⚠️ {wallet.error}
        </div>
      )}

      {/* Main layout */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '280px 1fr 300px',
        gap: 0,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Left panel - Balances */}
        <div style={{
          borderRight: '1px solid var(--border)',
          padding: 16,
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 16,
          background: 'rgba(10,15,30,0.6)',
        }}>
          <BalancePanel
            account={wallet.account}
            balances={wallet.balances}
            isLoadingBalances={wallet.isLoadingBalances}
            onRefresh={wallet.refreshBalances}
          />

          {/* Network info card */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
              Network Info
            </div>
            {[
              ['Chain ID', '5042002'],
              ['Gas Token', 'USDC'],
              ['Finality', '< 1 second'],
              ['Explorer', 'testnet.arcscan.app'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-secondary)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Signature */}
          <div style={{
            marginTop: 'auto',
            textAlign: 'center',
            padding: '12px',
            borderTop: '1px solid var(--border)',
          }}>
            <div style={{
              fontFamily: 'var(--font-tech)', fontSize: 10,
              color: 'var(--text-muted)', lineHeight: 1.6,
            }}>
              Built by
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
              letterSpacing: 1,
              background: 'linear-gradient(135deg, #00c4ff, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              0xJuiceee
            </div>
            <div style={{ fontFamily: 'var(--font-tech)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
              ARC AI AGENT · 2025
            </div>
          </div>
        </div>

        {/* Center - Chat */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          background: 'rgba(3, 7, 18, 0.7)',
        }}>
          {/* Tab bar */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--border)',
            background: 'rgba(10,15,30,0.5)',
          }}>
            {[
              { id: 'chat', label: '💬 AI Chat', count: null },
              { id: 'logs', label: '📋 TX Logs', count: txLogs.length || null },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 20px',
                  background: 'none', border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {tab.label}
                {tab.count !== null && (
                  <span style={{
                    background: 'var(--accent-cyan)', color: '#000',
                    borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700,
                  }}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'chat' ? (
              <ChatInterface
                messages={ai.messages}
                isThinking={ai.isThinking}
                onSend={handleUserMessage}
                account={wallet.account}
                onClear={ai.clearMessages}
              />
            ) : (
              <div style={{ flex: 1, padding: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <TxLog logs={txLogs} onClear={() => setTxLogs([])} />
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Quick actions + info */}
        <div style={{
          borderLeft: '1px solid var(--border)',
          padding: 16,
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 16,
          background: 'rgba(10,15,30,0.6)',
        }}>
          {/* Quick actions */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
              Command Examples
            </div>
            {[
              { icon: '💸', cmd: 'Send 1 USDC to 0x...', desc: 'Transfer tokens' },
              { icon: '💱', cmd: 'Swap 1 USDC to EURC', desc: 'Stablecoin swap' },
              { icon: '💰', cmd: 'Show my balance', desc: 'Check wallet' },
              { icon: '🌐', cmd: 'What is Arc Network?', desc: 'General chat' },
              { icon: '⛽', cmd: 'How do gas fees work?', desc: 'Learn about Arc' },
            ].map(({ icon, cmd, desc }) => (
              <div key={cmd} style={{
                padding: '8px 10px', marginBottom: 6, borderRadius: 6,
                background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
                onClick={() => {
                  setActiveTab('chat');
                  // Inject command into chat
                  handleUserMessage(cmd.includes('0x...') ? cmd.replace('0x...', '') : cmd);
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-tech)', fontSize: 10, color: 'var(--accent-cyan)' }}>{cmd}</div>
                    <div style={{ fontFamily: 'var(--font-tech)', fontSize: 9, color: 'var(--text-muted)' }}>{desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Token contracts */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
              Token Contracts
            </div>
            {[
              { symbol: 'USDC', addr: '0x3600...0000', icon: '💵', color: '#2775CA' },
              { symbol: 'EURC', addr: '0x89B5...972a', icon: '💶', color: '#0052B4' },
              { symbol: 'USYC', addr: '0xe918...b86C', icon: '📈', color: '#1a7a4a' },
            ].map(({ symbol, addr, icon, color }) => (
              <div key={symbol} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color }}>{symbol}</div>
                  <div style={{ fontFamily: 'var(--font-tech)', fontSize: 9, color: 'var(--text-muted)' }}>{addr}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Arc links */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
              Quick Links
            </div>
            {[
              { label: '🔍 Explorer', url: 'https://testnet.arcscan.app' },
              { label: '🚰 Faucet', url: 'https://faucet.circle.com' },
              { label: '📚 Docs', url: 'https://docs.arc.network' },
              { label: '💬 Discord', url: 'https://discord.gg/arc' },
            ].map(({ label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', padding: '6px 8px', marginBottom: 4, borderRadius: 6,
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontFamily: 'var(--font-tech)', fontSize: 11,
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-cyan)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
