import { ethers } from 'ethers';
import { TOKENS, ERC20_ABI, EXPLORER_URL } from './constants';

// Parse natural language commands into structured actions
export function parseCommand(message) {
  const lower = message.toLowerCase().trim();

  // SEND / TRANSFER patterns
  // "send 1 usdc to 0x..."
  // "transfer 5 eurc to 0x..."
  // "give 2 usdc to 0x..."
  const sendPatterns = [
    /(?:send|transfer|give|pay)\s+([\d.]+)\s+(\w+)\s+to\s+(0x[a-fA-F0-9]{40})/i,
    /(?:send|transfer|give|pay)\s+([\d.]+)\s+(\w+)\s+(0x[a-fA-F0-9]{40})/i,
  ];
  for (const pattern of sendPatterns) {
    const match = message.match(pattern);
    if (match) {
      return { action: 'SEND', amount: match[1], token: match[2].toUpperCase(), to: match[3] };
    }
  }

  // SWAP patterns
  // "swap 1 usdc to eurc"
  // "swap 1 usdc for eurc"
  // "exchange 2 eurc to usdc"
  const swapPatterns = [
    /(?:swap|exchange|convert)\s+([\d.]+)\s+(\w+)\s+(?:to|for)\s+(\w+)/i,
  ];
  for (const pattern of swapPatterns) {
    const match = message.match(pattern);
    if (match) {
      return { action: 'SWAP', amount: match[1], fromToken: match[2].toUpperCase(), toToken: match[3].toUpperCase() };
    }
  }

  // BALANCE patterns
  // "show balance", "what's my balance", "check balance"
  if (/(?:balance|wallet|funds|holdings|how much)/i.test(lower)) {
    return { action: 'BALANCE' };
  }

  // NOT a blockchain command
  return { action: 'CHAT' };
}

// Execute a token send transaction
export async function executeTransfer(signer, token, to, amount, addLog) {
  const tokenConfig = TOKENS[token];
  if (!tokenConfig) throw new Error(`Unknown token: ${token}`);
  if (!ethers.isAddress(to)) throw new Error(`Invalid address: ${to}`);

  addLog({ type: 'info', text: `🔄 Preparing to send ${amount} ${token} to ${to}...` });

  try {
    const contract = new ethers.Contract(tokenConfig.address, ERC20_ABI, signer);
    const decimals = tokenConfig.decimals;
    const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

    addLog({ type: 'info', text: `📝 Requesting signature from wallet...` });

    const tx = await contract.transfer(to, parsedAmount);

    addLog({ type: 'pending', text: `⏳ Transaction submitted! Hash: ${tx.hash}`, hash: tx.hash });

    const receipt = await tx.wait();

    addLog({
      type: 'success',
      text: `✅ Successfully sent ${amount} ${token} to ${to}`,
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
    });

    return receipt;
  } catch (e) {
    const msg = e.reason || e.message || 'Transaction failed';
    addLog({ type: 'error', text: `❌ Transfer failed: ${msg}` });
    throw e;
  }
}

// Execute a swap between tokens (using direct transfer to simulate - real swap would need DEX)
export async function executeSwap(signer, fromToken, toToken, amount, addLog) {
  const fromConfig = TOKENS[fromToken];
  const toConfig = TOKENS[toToken];

  if (!fromConfig) throw new Error(`Unknown token: ${fromToken}`);
  if (!toConfig) throw new Error(`Unknown token: ${toToken}`);

  addLog({ type: 'info', text: `🔄 Preparing to swap ${amount} ${fromToken} → ${toToken}...` });
  addLog({ type: 'info', text: `💱 Using Arc StableFX for stablecoin exchange...` });

  // NOTE: Real swap on Arc uses StableFX RFQ or direct EURC<>USDC exchange
  // For testnet demo, we simulate via the FX precompile at 0x0800...
  // Arc has a built-in FX engine accessible via the precompile

  const ARC_FX_PRECOMPILE = '0x0800000000000000000000000000000000000001';
  const FX_ABI = [
    'function swap(address fromToken, address toToken, uint256 amount, uint256 minOutput, address recipient) payable returns (uint256)',
  ];

  try {
    const fromContract = new ethers.Contract(fromConfig.address, ERC20_ABI, signer);
    const parsedAmount = ethers.parseUnits(amount.toString(), fromConfig.decimals);

    addLog({ type: 'info', text: `📝 Approving ${amount} ${fromToken} for swap...` });
    const approveTx = await fromContract.approve(ARC_FX_PRECOMPILE, parsedAmount);
    addLog({ type: 'pending', text: `⏳ Approval tx: ${approveTx.hash}`, hash: approveTx.hash });
    await approveTx.wait();
    addLog({ type: 'success', text: `✅ Approval confirmed` });

    const fxContract = new ethers.Contract(ARC_FX_PRECOMPILE, FX_ABI, signer);
    const signerAddress = await signer.getAddress();
    const minOutput = ethers.parseUnits('0', toConfig.decimals); // no slippage check for demo

    addLog({ type: 'info', text: `📝 Requesting swap signature from wallet...` });
    const swapTx = await fxContract.swap(
      fromConfig.address,
      toConfig.address,
      parsedAmount,
      minOutput,
      signerAddress
    );

    addLog({ type: 'pending', text: `⏳ Swap submitted! Hash: ${swapTx.hash}`, hash: swapTx.hash });
    const receipt = await swapTx.wait();

    addLog({
      type: 'success',
      text: `✅ Swap complete! ${amount} ${fromToken} → ${toToken}`,
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
    });

    return receipt;
  } catch (e) {
    const msg = e.reason || e.message || 'Swap failed';
    addLog({ type: 'error', text: `❌ Swap failed: ${msg}` });
    throw e;
  }
}

export function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getTxExplorerUrl(hash) {
  return `${EXPLORER_URL}/tx/${hash}`;
}

export function getAddressExplorerUrl(address) {
  return `${EXPLORER_URL}/address/${address}`;
}
