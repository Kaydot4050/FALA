import type { NetworkId } from "@/pages/buy";

interface NetworkLogoProps {
  network: NetworkId;
  size?: number;
  className?: string;
}

export function NetworkLogo({ network, size = 56, className = "" }: NetworkLogoProps) {
  if (network === "YELLO") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="100" height="100" rx="20" fill="#FFCC00" />
        <ellipse cx="50" cy="50" rx="35" ry="18" stroke="black" strokeWidth="3" fill="none" />
        <text x="50" y="56" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="20" fill="black">MTN</text>
      </svg>
    );
  }

  if (network === "TELECEL") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="100" height="100" rx="20" fill="#E60000" />
        <circle cx="50" cy="35" r="18" fill="white" />
        <text x="50" y="44" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="26" fill="#E60000">t</text>
        <text x="50" y="70" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="18" fill="white">telecel</text>
        <text x="50" y="82" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="500" fontSize="6" fill="white" opacity="0.8">Connecting Energies</text>
      </svg>
    );
  }

  if (network === "AT_PREMIUM" || network === "at") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <clipPath id="logo-clip">
            <rect width="100" height="100" rx="20" />
          </clipPath>
        </defs>
        <g clipPath="url(#logo-clip)">
          <rect width="100" height="100" fill="#1B365D" />
          <path d="M0 65 Q 25 55, 50 65 T 100 65 V 100 H 0 Z" fill="#E60000" />
        </g>
        <text x="50" y="55" textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight="900" fontSize="38" fill="white" style={{ letterSpacing: '-2px' }}>at</text>
      </svg>
    );
  }

  return null;
}
