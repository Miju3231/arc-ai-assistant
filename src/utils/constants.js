// Arc Testnet Network Configuration
export const ARC_TESTNET = {
  chainId: '0x4CDCB2', // 5042002 in hex
  chainIdDecimal: 5042002,
  chainName: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.app'],
};

// Token Contracts on Arc Testnet
export const TOKENS = {
  USDC: {
    address: '0x3600000000000000000000000000000000000000',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    color: '#2775CA',
    icon: '💵',
  },
  EURC: {
    address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
    symbol: 'EURC',
    name: 'Euro Coin',
    decimals: 6,
    color: '#0052B4',
    icon: '💶',
  },
  USYC: {
    address: '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C',
    symbol: 'USYC',
    name: 'US Yield Coin',
    decimals: 6,
    color: '#1a7a4a',
    icon: '📈',
  },
};

// StableFX for swapping
export const CONTRACTS = {
  FxEscrow: '0x867650F5e...', // partial from docs
  CCTP_TokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
  CCTP_MessageTransmitter: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275',
};

export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

export const EXPLORER_URL = 'https://testnet.arcscan.app';
export const FAUCET_URL = 'https://faucet.circle.com';
