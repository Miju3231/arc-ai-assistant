# ⚡ Arc AI Agent

> **AI-powered personal wallet assistant on Arc Testnet**  
> Built by **0xJuiceee**

A full-featured AI agent that lets you control your crypto wallet using natural language — send tokens, swap stablecoins, check balances, and chat with an AI assistant, all in one sleek dark-mode interface.

---

## 🚀 Features

- 🤖 **AI Chat** — Powered by Claude (Anthropic). Ask anything, get intelligent responses
- 💸 **Token Transfers** — Say "send 1 USDC to 0x..." and it executes the transaction
- 💱 **Token Swaps** — Say "swap 1 USDC to EURC" and it swaps using Arc's built-in FX engine
- 💰 **Balance Viewer** — Live wallet balances for USDC, EURC, USYC
- 🦊 **Wallet Connect** — MetaMask and any EVM-compatible wallet
- 🌐 **Auto Network** — Automatically adds and switches to Arc Testnet (Chain ID: 5042002)
- 🔌 **Wallet Revoke** — Full permission revocation on disconnect
- 📋 **TX Log UI** — Real-time transaction logs with explorer links
- 🎨 **Dark Cyberpunk UI** — Stunning dark interface designed to impress

---

## 🧠 Natural Language Commands

| You say... | What happens |
|---|---|
| `send 1 USDC to 0x123...` | Transfers 1 USDC to that address |
| `transfer 5 EURC to 0xabc...` | Transfers 5 EURC |
| `swap 1 USDC to EURC` | Swaps via Arc StableFX |
| `swap 2 EURC for USDC` | Reverse swap |
| `show my balance` | Refreshes and shows wallet balances |
| `what is Arc Network?` | AI explains it |
| `how do gas fees work here?` | AI answers |
| *Any question* | Claude answers intelligently |

---

## 🌐 Arc Testnet Details

| Parameter | Value |
|---|---|
| Chain ID | `5042002` |
| RPC URL | `https://rpc.testnet.arc.network` |
| Currency | USDC (gas token) |
| Explorer | https://testnet.arcscan.app |
| Faucet | https://faucet.circle.com |

### Token Contracts
| Token | Address |
|---|---|
| USDC | `0x3600000000000000000000000000000000000000` |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |
| USYC | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` |

---

## 🛠 Tech Stack

- **React 18** — Frontend framework
- **ethers.js v6** — Ethereum/EVM interaction
- **Anthropic Claude API** — AI assistant (claude-sonnet-4)
- **MetaMask** — Wallet connection
- **Vercel** — Deployment

---

## 📦 Installation

```bash
git clone https://github.com/YOUR_USERNAME/arc-ai-agent.git
cd arc-ai-agent
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deploy to Vercel

1. Push to GitHub
2. Connect repo on [vercel.com](https://vercel.com)
3. Deploy — no env vars needed (API key is in-app for demo)

> ⚠️ **Production note**: Move the API key to a Vercel environment variable (`REACT_APP_ANTHROPIC_KEY`) for security.

---

## 🔐 Security Notes

- This is a **testnet demo** — do not use with real funds
- The Anthropic API key is included for demo purposes. For production, use environment variables
- Wallet signing always requires user confirmation in MetaMask

---

## 🎮 How to Use

1. **Connect Wallet** — Click "Connect Wallet" (MetaMask required)
2. **Auto-switch** — App automatically adds/switches to Arc Testnet
3. **Get test tokens** — Click "Get test tokens from Circle Faucet"
4. **Start chatting** — Type commands or questions in the chat
5. **Watch TX logs** — Switch to "TX Logs" tab to see transaction progress

---

## 📝 License

MIT — Built by **0xJuiceee**

---

*This Project built By 0xJuiceee*
