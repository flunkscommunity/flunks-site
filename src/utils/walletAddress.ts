// Utility helpers for wallet addresses (Flow/EVM style)
// Normalizes casing and ensures 0x prefix for consistent DB queries.
export const normalizeWalletAddress = (addr: string | null | undefined): string => {
  if (!addr) return '';
  let a = addr.trim();
  if (!a) return '';
  a = a.replace(/^0x/i, '');
  return ('0x' + a).toLowerCase();
};

export const maybeNormalize = (addr: string | null | undefined) => {
  const n = normalizeWalletAddress(addr);
  return n || addr || '';
};
