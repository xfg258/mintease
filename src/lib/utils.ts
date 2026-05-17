export function shortAddress(addr: string, head = 6, tail = 4): string {
  if (addr.length < head + tail + 2) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function isEthAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

export function normalizePrivateKey(hex: string): string {
  const raw = hex.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]{64}$/.test(raw)) {
    throw new Error("私钥须为 64 位十六进制字符");
  }
  return `0x${raw}`;
}

export async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function formatGasGwei(wei: string): string {
  const gwei = Number(BigInt(wei)) / 1e9;
  return gwei < 0.01 ? gwei.toExponential(2) : gwei.toFixed(2);
}

export function estimateFeeWei(gasLimit: string, gasPrice: string): bigint {
  return BigInt(gasLimit) * BigInt(gasPrice);
}
