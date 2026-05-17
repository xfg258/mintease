export type NetworkId = "eth" | "bsc" | "base" | "arbitrum" | "sepolia";

export interface NetworkConfig {
  id: NetworkId;
  label: string;
  shortLabel: string;
  chainId: string;
  tcxNetwork: "MAINNET" | "TESTNET";
  rpcUrl: string;
  explorer: string;
  nativeSymbol: string;
  tcxChain: "ETHEREUM";
  color: string;
}

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  eth: {
    id: "eth",
    label: "Ethereum",
    shortLabel: "ETH",
    chainId: "1",
    tcxNetwork: "MAINNET",
    rpcUrl: "https://ethereum-rpc.publicnode.com",
    explorer: "https://etherscan.io",
    nativeSymbol: "ETH",
    tcxChain: "ETHEREUM",
    color: "#627eea",
  },
  bsc: {
    id: "bsc",
    label: "BNB Smart Chain",
    shortLabel: "BSC",
    chainId: "56",
    tcxNetwork: "MAINNET",
    rpcUrl: "https://bsc-dataseed.binance.org",
    explorer: "https://bscscan.com",
    nativeSymbol: "BNB",
    tcxChain: "ETHEREUM",
    color: "#f0b90b",
  },
  base: {
    id: "base",
    label: "Base",
    shortLabel: "Base",
    chainId: "8453",
    tcxNetwork: "MAINNET",
    rpcUrl: "https://mainnet.base.org",
    explorer: "https://basescan.org",
    nativeSymbol: "ETH",
    tcxChain: "ETHEREUM",
    color: "#0052ff",
  },
  arbitrum: {
    id: "arbitrum",
    label: "Arbitrum One",
    shortLabel: "ARB",
    chainId: "42161",
    tcxNetwork: "MAINNET",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorer: "https://arbiscan.io",
    nativeSymbol: "ETH",
    tcxChain: "ETHEREUM",
    color: "#28a0f0",
  },
  sepolia: {
    id: "sepolia",
    label: "Sepolia 测试网",
    shortLabel: "测试",
    chainId: "11155111",
    tcxNetwork: "TESTNET",
    rpcUrl: "https://rpc.sepolia.org",
    explorer: "https://sepolia.etherscan.io",
    nativeSymbol: "ETH",
    tcxChain: "ETHEREUM",
    color: "#8b9dc3",
  },
};

export const DEFAULT_NETWORK: NetworkId = "sepolia";

export function getNetwork(id: NetworkId): NetworkConfig {
  return NETWORKS[id];
}

export const NETWORK_LIST = Object.values(NETWORKS);
