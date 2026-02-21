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
        
        {/* Top box - bounces up */}
        <rect
          x="42"
          y="15"
          width="16"
          height="16"
          rx="1"
          fill={boxColor}
          className="animate-box-top"
        />
        
        {/* Bottom box - bounces down */}
        <rect
          x="42"
          y="69"
          width="16"
          height="16"
          rx="1"
          fill={boxColor}
          className="animate-box-bottom"
        />
        
        {/* Left box - bounces left */}
        <rect
          x="15"
          y="42"
          width="16"
          height="16"
          rx="1"
          fill={boxColor}
          className="animate-box-left"
        />
        
        {/* Right box - bounces right */}
        <rect
          x="69"
          y="42"
          width="16"
          height="16"
          rx="1"
          fill={boxColor}
          className="animate-box-right"
        />
        
        {/* Corner boxes - diagonal movement */}
        <rect
          x="18"
          y="18"
          width="12"
          height="12"
          rx="1"
          fill={boxColor}
          fillOpacity="0.7"
          className="animate-corner-tl"
        />
        <rect
          x="70"
          y="18"
          width="12"
          height="12"
          rx="1"
          fill={boxColor}
          fillOpacity="0.7"
          className="animate-corner-tr"
        />
        <rect
          x="18"
          y="70"
          width="12"
          height="12"
          rx="1"
          fill={boxColor}
          fillOpacity="0.7"
          className="animate-corner-bl"
        />
        <rect
          x="70"
          y="70"
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
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(90deg) scale(0.85);
          }
          50% {
            transform: rotate(180deg) scale(1);
          }
          75% {
            transform: rotate(270deg) scale(0.85);
          }
        }
        
        @keyframes bounce-top {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        
        @keyframes bounce-bottom {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        
        @keyframes bounce-left {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-6px); }
        }
        
        @keyframes bounce-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }
        
        @keyframes corner-tl {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          50% { transform: translate(-4px, -4px) scale(1.2); opacity: 1; }
        }
        
        @keyframes corner-tr {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          50% { transform: translate(4px, -4px) scale(1.2); opacity: 1; }
        }
        
        @keyframes corner-bl {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          50% { transform: translate(-4px, 4px) scale(1.2); opacity: 1; }
        }
        
        @keyframes corner-br {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          50% { transform: translate(4px, 4px) scale(1.2); opacity: 1; }
        }
        
        .animate-main-box {
          animation: main-box 4s ease-in-out infinite;
          transform-origin: 50px 50px;
        }
        
        .animate-box-top {
          animation: bounce-top 1.5s ease-in-out infinite;
          transform-origin: 50px 23px;
        }
        
        .animate-box-bottom {
          animation: bounce-bottom 1.5s ease-in-out infinite 0.2s;
          transform-origin: 50px 77px;
        }
        
        .animate-box-left {
          animation: bounce-left 1.5s ease-in-out infinite 0.4s;
          transform-origin: 23px 50px;
        }
        
        .animate-box-right {
          animation: bounce-right 1.5s ease-in-out infinite 0.6s;
          transform-origin: 77px 50px;
        }
        
        .animate-corner-tl {
          animation: corner-tl 2s ease-in-out infinite;
          transform-origin: 24px 24px;
        }
        
        .animate-corner-tr {
          animation: corner-tr 2s ease-in-out infinite 0.25s;
          transform-origin: 76px 24px;
        }
        
        .animate-corner-bl {
          animation: corner-bl 2s ease-in-out infinite 0.5s;
          transform-origin: 24px 76px;
        }
        
        .animate-corner-br {
          animation: corner-br 2s ease-in-out infinite 0.75s;
          transform-origin: 76px 76px;
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
        
        {/* Cardinals */}
        <rect x="42" y="10" width="16" height="16" rx="1" fill={color} className="animate-box-top" />
        <rect x="42" y="74" width="16" height="16" rx="1" fill={color} className="animate-box-bottom" />
        <rect x="10" y="42" width="16" height="16" rx="1" fill={color} className="animate-box-left" />
        <rect x="74" y="42" width="16" height="16" rx="1" fill={color} className="animate-box-right" />
        
        {/* Corners */}
        <rect x="15" y="15" width="12" height="12" rx="1" fill={color} fillOpacity="0.6" className="animate-corner-tl" />
        <rect x="73" y="15" width="12" height="12" rx="1" fill={color} fillOpacity="0.6" className="animate-corner-tr" />
        <rect x="15" y="73" width="12" height="12" rx="1" fill={color} fillOpacity="0.6" className="animate-corner-bl" />
        <rect x="73" y="73" width="12" height="12" rx="1" fill={color} fillOpacity="0.6" className="animate-corner-br" />
      </svg>
      
      <style>{`
        @keyframes main-box {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(0.85); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(0.85); }
        }
        
        @keyframes bounce-top {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes bounce-bottom {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        
        @keyframes bounce-left {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-8px); }
        }
        
        @keyframes bounce-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(8px); }
        }
        
        @keyframes corner-tl {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          50% { transform: translate(-5px, -5px) scale(1.3); opacity: 1; }
        }
        
        @keyframes corner-tr {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          50% { transform: translate(5px, -5px) scale(1.3); opacity: 1; }
        }
        
        @keyframes corner-bl {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          50% { transform: translate(-5px, 5px) scale(1.3); opacity: 1; }
        }
        
        @keyframes corner-br {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          50% { transform: translate(5px, 5px) scale(1.3); opacity: 1; }
        }
        
        .animate-main-box { animation: main-box 4s ease-in-out infinite; transform-origin: 50px 50px; }
        .animate-box-top { animation: bounce-top 1.5s ease-in-out infinite; transform-origin: 50px 18px; }
        .animate-box-bottom { animation: bounce-bottom 1.5s ease-in-out infinite 0.2s; transform-origin: 50px 82px; }
        .animate-box-left { animation: bounce-left 1.5s ease-in-out infinite 0.4s; transform-origin: 18px 50px; }
        .animate-box-right { animation: bounce-right 1.5s ease-in-out infinite 0.6s; transform-origin: 82px 50px; }
        .animate-corner-tl { animation: corner-tl 2s ease-in-out infinite; transform-origin: 21px 21px; }
        .animate-corner-tr { animation: corner-tr 2s ease-in-out infinite 0.25s; transform-origin: 79px 21px; }
        .animate-corner-bl { animation: corner-bl 2s ease-in-out infinite 0.5s; transform-origin: 21px 79px; }
        .animate-corner-br { animation: corner-br 2s ease-in-out infinite 0.75s; transform-origin: 79px 79px; }
      `}</style>
    </div>
  );
}
