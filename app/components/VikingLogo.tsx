interface VikingLogoProps {
  className?: string
  size?: number
}

export default function VikingLogo({ className = "", size = 120 }: VikingLogoProps) {
  return (
    <div className={`inline-block ${className}`}>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Definitions for gradients */}
        <defs>
          <linearGradient id="skyGradient" x1="100" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#a8e6cf" />
            <stop offset="100%" stopColor="#55b3d9" />
          </linearGradient>
          <linearGradient id="mountainGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="treeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient id="houseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
        </defs>
        {/* White circular border */}
        <circle cx="100" cy="100" r="95" fill="white" />
        <circle cx="100" cy="100" r="90" fill="#1e293b" />
        {/* Sun/Moon with rays */}
        <circle cx="100" cy="60" r="25" fill="white" />
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="100"
            y1="35"
            x2="100"
            y2="25"
            stroke="white"
            strokeWidth="2"
            transform={`rotate(${i * 30} 100 60)`}
          />
        ))}
        {/* Mountains */}
        <path d="M30 120L70 70L110 120L150 80L170 120" fill="url(#mountainGradient)" stroke="white" strokeWidth="2" />
        {/* Trees */}
        {[40, 60, 140, 160].map((x, i) => (
          <path key={i} d={`M${x} 130L${x - 10} 150L${x + 10} 150Z`} fill="url(#treeGradient)" />
        ))}
        {/* Main House */}
        <path d="M70 90h60v40H70z" fill="url(#houseGradient)" stroke="white" strokeWidth="2" />
        <path d="M65 90l35-25 35 25" fill="url(#houseGradient)" stroke="white" strokeWidth="2" />
        {/* House Details */}
        <rect x="90" y="100" width="20" height="30" fill="#292524" /> {/* Door */}
        <rect x="75" y="95" width="10" height="10" fill="#292524" /> {/* Window */}
        <rect x="115" y="95" width="10" height="10" fill="#292524" /> {/* Window */}
        {/* Dragon head ornament */}
        <path d="M98 65l2-5 2 5" stroke="#92400e" strokeWidth="2" fill="none" />
        {/* Waterfall/River */}
        <path
          d="M90 130c0 0 -10 10 -10 20c0 10 40 10 40 0c0 -10 -10 -20 -10 -20"
          fill="url(#waterGradient)"
          stroke="white"
          strokeWidth="1"
        />
        {/* Water ripples */}
        {[135, 145, 155].map((y, i) => (
          <path key={i} d={`M85 ${y}q15 -5 30 0`} fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
        ))}
      </svg>
    </div>
  )
}

