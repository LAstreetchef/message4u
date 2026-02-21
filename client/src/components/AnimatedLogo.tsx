import { useState } from "react";

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
        {/* Background - sharp corners */}
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="8"
          fill={bgColor}
        />
        
        {/* Center box - rotates and pulses */}
        <rect
          x="35"
          y="35"
          width="30"
          height="30"
          rx="2"
          fill={boxColor}
          className="animate-main-box"
        />
        
        {/* Top box */}
        <rect
          x="42"
          y="42"
          width="16"
          height="16"
          rx="1"
          fill={boxColor}
          className="animate-box-top"
        />
        
        {/* Bottom box */}
        <rect
          x="42"
          y="42"
          width="16"
          height="16"
          rx="1"
          fill={boxColor}
          className="animate-box-bottom"
        />
        
        {/* Left box */}
        <rect
          x="42"
          y="42"
          width="16"
          height="16"
          rx="1"
          fill={boxColor}
          className="animate-box-left"
        />
        
        {/* Right box */}
        <rect
          x="42"
          y="42"
          width="16"
          height="16"
          rx="1"
          fill={boxColor}
          className="animate-box-right"
        />
        
        {/* Corner boxes - start from center */}
        <rect
          x="44"
          y="44"
          width="12"
          height="12"
          rx="1"
          fill={boxColor}
          fillOpacity="0.7"
          className="animate-corner-tl"
        />
        <rect
          x="44"
          y="44"
          width="12"
          height="12"
          rx="1"
          fill={boxColor}
          fillOpacity="0.7"
          className="animate-corner-tr"
        />
        <rect
          x="44"
          y="44"
          width="12"
          height="12"
          rx="1"
          fill={boxColor}
          fillOpacity="0.7"
          className="animate-corner-bl"
        />
        <rect
          x="44"
          y="44"
          width="12"
          height="12"
          rx="1"
          fill={boxColor}
          fillOpacity="0.7"
          className="animate-corner-br"
        />
      </svg>
      
      <style>{`
        @keyframes main-box {
          0%, 5% {
            transform: rotate(0deg) scale(1);
          }
          20% {
            transform: rotate(0deg) scale(0);
          }
          25% {
            transform: rotate(180deg) scale(0);
          }
          45%, 100% {
            transform: rotate(180deg) scale(1);
          }
        }
        
        @keyframes expand-top {
          0%, 5% {
            transform: translateY(-27px);
          }
          20%, 30% {
            transform: translateY(0);
          }
          50%, 100% {
            transform: translateY(-27px);
          }
        }
        
        @keyframes expand-bottom {
          0%, 5% {
            transform: translateY(27px);
          }
          20%, 30% {
            transform: translateY(0);
          }
          50%, 100% {
            transform: translateY(27px);
          }
        }
        
        @keyframes expand-left {
          0%, 5% {
            transform: translateX(-27px);
          }
          20%, 30% {
            transform: translateX(0);
          }
          50%, 100% {
            transform: translateX(-27px);
          }
        }
        
        @keyframes expand-right {
          0%, 5% {
            transform: translateX(27px);
          }
          20%, 30% {
            transform: translateX(0);
          }
          50%, 100% {
            transform: translateX(27px);
          }
        }
        
        @keyframes corner-tl-expand {
          0%, 5% {
            transform: translate(-26px, -26px) scale(1);
            opacity: 0.7;
          }
          20%, 30% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0;
          }
          50%, 100% {
            transform: translate(-26px, -26px) scale(1);
            opacity: 0.7;
          }
        }
        
        @keyframes corner-tr-expand {
          0%, 5% {
            transform: translate(26px, -26px) scale(1);
            opacity: 0.7;
          }
          20%, 30% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0;
          }
          50%, 100% {
            transform: translate(26px, -26px) scale(1);
            opacity: 0.7;
          }
        }
        
        @keyframes corner-bl-expand {
          0%, 5% {
            transform: translate(-26px, 26px) scale(1);
            opacity: 0.7;
          }
          20%, 30% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0;
          }
          50%, 100% {
            transform: translate(-26px, 26px) scale(1);
            opacity: 0.7;
          }
        }
        
        @keyframes corner-br-expand {
          0%, 5% {
            transform: translate(26px, 26px) scale(1);
            opacity: 0.7;
          }
          20%, 30% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0;
          }
          50%, 100% {
            transform: translate(26px, 26px) scale(1);
            opacity: 0.7;
          }
        }
        
        .animate-main-box {
          animation: main-box 3s ease-in-out infinite;
          transform-origin: 50px 50px;
        }
        
        .animate-box-top {
          animation: expand-top 3s ease-in-out infinite;
          transform-origin: 50px 50px;
        }
        
        .animate-box-bottom {
          animation: expand-bottom 3s ease-in-out infinite;
          transform-origin: 50px 50px;
        }
        
        .animate-box-left {
          animation: expand-left 3s ease-in-out infinite;
          transform-origin: 50px 50px;
        }
        
        .animate-box-right {
          animation: expand-right 3s ease-in-out infinite;
          transform-origin: 50px 50px;
        }
        
        .animate-corner-tl {
          animation: corner-tl-expand 3s ease-in-out infinite;
          transform-origin: 50px 50px;
        }
        
        .animate-corner-tr {
          animation: corner-tr-expand 3s ease-in-out infinite;
          transform-origin: 50px 50px;
        }
        
        .animate-corner-bl {
          animation: corner-bl-expand 3s ease-in-out infinite;
          transform-origin: 50px 50px;
        }
        
        .animate-corner-br {
          animation: corner-br-expand 3s ease-in-out infinite;
          transform-origin: 50px 50px;
        }
      `}</style>
    </div>
  );
}

// Simpler version - just the icon without background
export function AnimatedLogoIcon({ size = 40, color = "#18181b", className = "" }: { size?: number; color?: string; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Center */}
        <rect x="35" y="35" width="30" height="30" rx="2" fill={color} className="animate-main-box" />
        
        {/* Cardinals - start from center */}
        <rect x="42" y="42" width="16" height="16" rx="1" fill={color} className="animate-box-top" />
        <rect x="42" y="42" width="16" height="16" rx="1" fill={color} className="animate-box-bottom" />
        <rect x="42" y="42" width="16" height="16" rx="1" fill={color} className="animate-box-left" />
        <rect x="42" y="42" width="16" height="16" rx="1" fill={color} className="animate-box-right" />
        
        {/* Corners - start from center */}
        <rect x="44" y="44" width="12" height="12" rx="1" fill={color} fillOpacity="0.6" className="animate-corner-tl" />
        <rect x="44" y="44" width="12" height="12" rx="1" fill={color} fillOpacity="0.6" className="animate-corner-tr" />
        <rect x="44" y="44" width="12" height="12" rx="1" fill={color} fillOpacity="0.6" className="animate-corner-bl" />
        <rect x="44" y="44" width="12" height="12" rx="1" fill={color} fillOpacity="0.6" className="animate-corner-br" />
      </svg>
      
      <style>{`
        @keyframes main-box {
          0%, 5% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(0deg) scale(0); }
          25% { transform: rotate(180deg) scale(0); }
          45%, 100% { transform: rotate(180deg) scale(1); }
        }
        
        @keyframes expand-top {
          0%, 5% { transform: translateY(-32px); }
          20%, 30% { transform: translateY(0); }
          50%, 100% { transform: translateY(-32px); }
        }
        
        @keyframes expand-bottom {
          0%, 5% { transform: translateY(32px); }
          20%, 30% { transform: translateY(0); }
          50%, 100% { transform: translateY(32px); }
        }
        
        @keyframes expand-left {
          0%, 5% { transform: translateX(-32px); }
          20%, 30% { transform: translateX(0); }
          50%, 100% { transform: translateX(-32px); }
        }
        
        @keyframes expand-right {
          0%, 5% { transform: translateX(32px); }
          20%, 30% { transform: translateX(0); }
          50%, 100% { transform: translateX(32px); }
        }
        
        @keyframes corner-tl-expand {
          0%, 5% { transform: translate(-29px, -29px) scale(1); opacity: 0.6; }
          20%, 30% { transform: translate(0, 0) scale(0.5); opacity: 0; }
          50%, 100% { transform: translate(-29px, -29px) scale(1); opacity: 0.6; }
        }
        
        @keyframes corner-tr-expand {
          0%, 5% { transform: translate(29px, -29px) scale(1); opacity: 0.6; }
          20%, 30% { transform: translate(0, 0) scale(0.5); opacity: 0; }
          50%, 100% { transform: translate(29px, -29px) scale(1); opacity: 0.6; }
        }
        
        @keyframes corner-bl-expand {
          0%, 5% { transform: translate(-29px, 29px) scale(1); opacity: 0.6; }
          20%, 30% { transform: translate(0, 0) scale(0.5); opacity: 0; }
          50%, 100% { transform: translate(-29px, 29px) scale(1); opacity: 0.6; }
        }
        
        @keyframes corner-br-expand {
          0%, 5% { transform: translate(29px, 29px) scale(1); opacity: 0.6; }
          20%, 30% { transform: translate(0, 0) scale(0.5); opacity: 0; }
          50%, 100% { transform: translate(29px, 29px) scale(1); opacity: 0.6; }
        }
        
        .animate-main-box { animation: main-box 3s ease-in-out infinite; transform-origin: 50px 50px; }
        .animate-box-top { animation: expand-top 3s ease-in-out infinite; transform-origin: 50px 50px; }
        .animate-box-bottom { animation: expand-bottom 3s ease-in-out infinite; transform-origin: 50px 50px; }
        .animate-box-left { animation: expand-left 3s ease-in-out infinite; transform-origin: 50px 50px; }
        .animate-box-right { animation: expand-right 3s ease-in-out infinite; transform-origin: 50px 50px; }
        .animate-corner-tl { animation: corner-tl-expand 3s ease-in-out infinite; transform-origin: 50px 50px; }
        .animate-corner-tr { animation: corner-tr-expand 3s ease-in-out infinite; transform-origin: 50px 50px; }
        .animate-corner-bl { animation: corner-bl-expand 3s ease-in-out infinite; transform-origin: 50px 50px; }
        .animate-corner-br { animation: corner-br-expand 3s ease-in-out infinite; transform-origin: 50px 50px; }
      `}</style>
    </div>
  );
}
