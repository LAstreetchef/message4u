import { useState, useEffect } from "react";

interface AnimatedLogoProps {
  size?: number;
  variant?: "light" | "dark";
  className?: string;
}

export function AnimatedLogo({ size = 40, variant = "dark", className = "" }: AnimatedLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const bgColor = variant === "dark" ? "#18181b" : "#fafafa";
  const boxColor = variant === "dark" ? "#fafafa" : "#18181b";
  
  return (
    <div 
      className={`relative cursor-pointer ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background rounded square */}
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="20"
          fill={bgColor}
        />
        
        {/* Animated inner box */}
        <g className="origin-center" style={{ transformOrigin: '50px 50px' }}>
          <rect
            x="30"
            y="30"
            width="40"
            height="40"
            rx="4"
            fill={boxColor}
            className="animate-logo-pulse"
            style={{
              transformOrigin: '50px 50px',
            }}
          />
        </g>
        
        {/* Subtle corner accents that appear on hover */}
        <g 
          className="transition-opacity duration-300"
          style={{ opacity: isHovered ? 1 : 0 }}
        >
          <rect x="22" y="22" width="8" height="8" rx="2" fill={boxColor} fillOpacity="0.3" />
          <rect x="70" y="22" width="8" height="8" rx="2" fill={boxColor} fillOpacity="0.3" />
          <rect x="22" y="70" width="8" height="8" rx="2" fill={boxColor} fillOpacity="0.3" />
          <rect x="70" y="70" width="8" height="8" rx="2" fill={boxColor} fillOpacity="0.3" />
        </g>
      </svg>
      
      <style>{`
        @keyframes logo-pulse {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(0.95) rotate(-2deg);
          }
          50% {
            transform: scale(1.05) rotate(0deg);
          }
          75% {
            transform: scale(0.98) rotate(2deg);
          }
        }
        
        @keyframes logo-breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.9;
          }
        }
        
        .animate-logo-pulse {
          animation: logo-breathe 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Alternative: More dynamic version with multiple boxes
export function AnimatedLogoAlt({ size = 40, variant = "dark", className = "" }: AnimatedLogoProps) {
  const bgColor = variant === "dark" ? "#18181b" : "#fafafa";
  const boxColor = variant === "dark" ? "#fafafa" : "#18181b";
  
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background */}
        <rect x="5" y="5" width="90" height="90" rx="20" fill={bgColor} />
        
        {/* Center box */}
        <rect
          x="35"
          y="35"
          width="30"
          height="30"
          rx="3"
          fill={boxColor}
          className="animate-center-box"
        />
        
        {/* Orbiting mini boxes */}
        <g className="animate-orbit" style={{ transformOrigin: '50px 50px' }}>
          <rect x="20" y="45" width="10" height="10" rx="2" fill={boxColor} fillOpacity="0.6" />
        </g>
        <g className="animate-orbit-reverse" style={{ transformOrigin: '50px 50px' }}>
          <rect x="70" y="45" width="10" height="10" rx="2" fill={boxColor} fillOpacity="0.6" />
        </g>
      </svg>
      
      <style>{`
        @keyframes center-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(0); }
          25% { transform: rotate(5deg) translateX(2px); }
          50% { transform: rotate(0deg) translateX(0); }
          75% { transform: rotate(-5deg) translateX(-2px); }
          100% { transform: rotate(0deg) translateX(0); }
        }
        
        @keyframes orbit-reverse {
          0% { transform: rotate(0deg) translateX(0); }
          25% { transform: rotate(-5deg) translateX(-2px); }
          50% { transform: rotate(0deg) translateX(0); }
          75% { transform: rotate(5deg) translateX(2px); }
          100% { transform: rotate(0deg) translateX(0); }
        }
        
        .animate-center-box {
          animation: center-breathe 3s ease-in-out infinite;
          transform-origin: 50px 50px;
        }
        
        .animate-orbit {
          animation: orbit 4s ease-in-out infinite;
        }
        
        .animate-orbit-reverse {
          animation: orbit-reverse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
