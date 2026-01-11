import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatUnits, parseUnits } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTokenAmount(
  amount: bigint,
  decimals: number = 18
): string {
  return formatUnits(amount, decimals);
}

export function parseTokenAmount(
  amount: string,
  decimals: number = 18
): bigint {
  try {
    return parseUnits(amount, decimals);
  } catch {
    return 0n;
  }
}

export function formatUSDC(amount: bigint): string {
  return formatUnits(amount, 6);
}

export function parseUSDC(amount: string): bigint {
  try {
    return parseUnits(amount, 6);
  } catch {
    return 0n;
  }
}

export function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(num: number | string): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(num));
}

export function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function timeUntil(timestamp: bigint): string {
  const now = Date.now() / 1000;
  const target = Number(timestamp);
  const diff = target - now;

  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
