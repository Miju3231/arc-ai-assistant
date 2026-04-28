import { useState, useCallback } from 'react';

const ANTHROPIC_API_KEY = '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';

const SYSTEM_PROMPT = `You are ArcAI, an intelligent personal assistant specialized in the Arc blockchain network — Circle's Layer-1 stablecoin-native blockchain (Chain ID: 5042002).

You can help users with:
1. **Blockchain operations** (detected by keywords): sending tokens, swapping stablecoins, checking balances
2. **General questions**: anything the user asks — crypto, DeFi, coding, life advice, etc.

Arc Testnet Details:
- Chain ID: 5042002
- RPC: https://rpc.testnet.arc.network
- Native gas token: USDC (18 decimals for native, 6 decimals for ERC-20)
- USDC contract: 0x3600000000000000000000000000000000000000
- EURC contract: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
- Explorer: https://testnet.arcscan.app
- Faucet: https://faucet.circle.com

For blockchain commands (send/transfer/swap), keep your response SHORT (1-2 sentences) confirming you're executing the operation. The UI will show the actual transaction logs.

For general conversation, be helpful, friendly, and informative. You can answer any topic.

Always be concise and useful. Respond in a clean, modern way. You are built on Arc Testnet.`;

export function useAIAgent() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey! I'm **ArcAI** 👋 — your personal AI agent on Arc Testnet.\n\nI can help you:\n- 💸 **Send tokens**: `send 1 USDC to 0x...`\n- 💱 **Swap tokens**: `swap 1 USDC to EURC`\n- 💰 **Check balance**: `show my balance`\n- 🤖 **Chat**: Ask me anything!\n\nConnect your wallet to get started.",
      id: Date.now(),
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const sendMessage = useCallback(async (userMessage, contextData = {}) => {
    const userMsg = {
      role: 'user',
      content: userMessage,
      id: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    try {
      // Build context-aware system prompt
      let contextPrompt = SYSTEM_PROMPT;
      if (contextData.account) {
        contextPrompt += `\n\nUser's wallet: ${contextData.account}`;
      }
      if (contextData.balances && Object.keys(contextData.balances).length > 0) {
        const balStr = Object.entries(contextData.balances)
          .filter(([k]) => k !== 'USDC_NATIVE')
          .map(([k, v]) => `${k}: ${parseFloat(v).toFixed(4)}`)
          .join(', ');
        contextPrompt += `\nCurrent balances: ${balStr}`;
      }
      if (!contextData.account) {
        contextPrompt += '\n\nNote: User wallet is NOT connected.';
      }
      if (contextData.isArcNetwork === false) {
        contextPrompt += '\n\nNote: User is NOT on Arc Testnet. Remind them to switch.';
      }

      // Build conversation history for API
      const apiMessages = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-10) // last 10 for context window
        .map(m => ({ role: m.role, content: m.content }));

      apiMessages.push({ role: 'user', content: userMessage });

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: contextPrompt,
          messages: apiMessages,
        }),
      });

      const data = await response.json();
      const aiContent = data.content?.[0]?.text || 'I had trouble responding. Please try again.';

      const aiMsg = {
        role: 'assistant',
        content: aiContent,
        id: Date.now() + 1,
      };
      setMessages(prev => [...prev, aiMsg]);
      return aiContent;
    } catch (error) {
      console.error('AI error:', error);
      const errMsg = {
        role: 'assistant',
        content: `⚠️ Connection error: ${error.message}. Please check your setup.`,
        id: Date.now() + 1,
      };
      setMessages(prev => [...prev, errMsg]);
      return null;
    } finally {
      setIsThinking(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! I'm **ArcAI** — your Arc Testnet AI agent. How can I help?",
      id: Date.now(),
    }]);
  }, []);

  return { messages, isThinking, sendMessage, clearMessages };
}
