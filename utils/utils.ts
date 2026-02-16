export function formatAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

export function getTimeRemaining(targetTime: number): {
  minutes: number;
  seconds: number;
  total: number;
} {
  const total = targetTime - Date.now();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);

  return {
    total,
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
  };
}

export function generateAvatarColor(address: string): string {
  const colors = [
    "#8B5CF6", // purple
    "#EAB308", // yellow
    "#EF4444", // red
    "#3B82F6", // blue
    "#10B981", // green
    "#F97316", // orange
    "#EC4899", // pink
    "#06B6D4", // cyan
  ];

  const hash = address.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
}
