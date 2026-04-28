import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { ARC_TESTNET, TOKENS, ERC20_ABI } from '../utils/constants';

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balances, setBalances] = useState({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [error, setError] = useState(null);

  const isArcNetwork = chainId === ARC_TESTNET.chainIdDecimal;

  const fetchBalances = useCallback(async (address, web3Provider) => {
    if (!address || !web3Provider) return;
    setIsLoadingBalances(true);
    try {
      const newBalances = {};
      // Native USDC balance (18 decimals)
      const nativeBalance = await web3Provider.getBalance(address);
      newBalances['USDC_NATIVE'] = ethers.formatEther(nativeBalance);

      // ERC20 balances for each token
      for (const [symbol, token] of Object.entries(TOKENS)) {
        try {
          const contract = new ethers.Contract(token.address, ERC20_ABI, web3Provider);
          const balance = await contract.balanceOf(address);
          newBalances[symbol] = ethers.formatUnits(balance, token.decimals);
        } catch (e) {
          newBalances[symbol] = '0.00';
        }
      }
      setBalances(newBalances);
    } catch (e) {
      console.error('Balance fetch error:', e);
    } finally {
      setIsLoadingBalances(false);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not found. Please install MetaMask.');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      setAccount(accounts[0]);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setChainId(Number(network.chainId));

      // Auto-add Arc network if not present
      if (Number(network.chainId) !== ARC_TESTNET.chainIdDecimal) {
        await switchToArc(web3Provider);
      } else {
        await fetchBalances(accounts[0], web3Provider);
      }
    } catch (e) {
      setError(e.message || 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalances]);

  const switchToArc = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_TESTNET.chainId }],
      });
    } catch (switchError) {
      // Chain not added yet, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: ARC_TESTNET.chainId,
              chainName: ARC_TESTNET.chainName,
              nativeCurrency: ARC_TESTNET.nativeCurrency,
              rpcUrls: ARC_TESTNET.rpcUrls,
              blockExplorerUrls: ARC_TESTNET.blockExplorerUrls,
            }],
          });
        } catch (addError) {
          setError('Failed to add Arc Testnet: ' + addError.message);
        }
      } else {
        setError('Failed to switch network: ' + switchError.message);
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalances({});

    // Revoke permissions
    if (window.ethereum) {
      window.ethereum.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }],
      }).catch(() => {});
    }
  }, []);

  const refreshBalances = useCallback(() => {
    if (account && provider) {
      fetchBalances(account, provider);
    }
  }, [account, provider, fetchBalances]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
        if (provider) fetchBalances(accounts[0], provider);
      }
    };

    const handleChainChanged = (chainIdHex) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      if (account && provider) fetchBalances(account, provider);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Check if already connected
    window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts) => {
      if (accounts.length > 0) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const web3Signer = await web3Provider.getSigner();
        const network = await web3Provider.getNetwork();
        setAccount(accounts[0]);
        setProvider(web3Provider);
        setSigner(web3Signer);
        setChainId(Number(network.chainId));
        fetchBalances(accounts[0], web3Provider);
      }
    });

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  return {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    isArcNetwork,
    balances,
    isLoadingBalances,
    error,
    connect,
    disconnect,
    switchToArc,
    refreshBalances,
  };
}
