interface AnimatedLogoProps {
  size?: number;
  variant?: "light" | "dark";
  className?: string;
}

export function AnimatedLogo({ size = 40, variant = "dark", className = "" }: AnimatedLogoProps) {
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
        {/* Background - sharp corners */}
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="8"
          fill={bgColor}
        />
        
        {/* Single white box - animated */}
        <rect
          x="30"
          y="30"
          width="40"
          height="40"
          rx="2"
          fill={boxColor}
          className="animate-box"
        />
      </svg>
      
      <style>{`
        @keyframes box-animate {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          15% {
            transform: scale(1.15) rotate(5deg);
            opacity: 1;
          }
          30% {
            transform: scale(0.9) rotate(-3deg);
            opacity: 0.9;
          }
          45% {
            transform: scale(0) rotate(45deg);
            opacity: 0;
          }
          50% {
            transform: scale(0) rotate(-45deg);
            opacity: 0;
          }
          65% {
            transform: scale(0.9) rotate(3deg);
            opacity: 0.9;
          }
          80% {
            transform: scale(1.1) rotate(-2deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        .animate-box {
          animation: box-animate 3s ease-in-out infinite;
          transform-origin: 50px 50px;
        }
      `}</style>
    </div>
  );
}

// Icon version without background
export function AnimatedLogoIcon({ size = 40, color = "#18181b", className = "" }: { size?: number; color?: string; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect
          x="20"
          y="20"
          width="60"
          height="60"
          rx="3"
          fill={color}
          className="animate-box"
        />
      </svg>
      
      <style>{`
        @keyframes box-animate {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          15% {
            transform: scale(1.15) rotate(5deg);
            opacity: 1;
          }
          30% {
            transform: scale(0.9) rotate(-3deg);
            opacity: 0.9;
          }
          45% {
            transform: scale(0) rotate(45deg);
            opacity: 0;
          }
          50% {
            transform: scale(0) rotate(-45deg);
            opacity: 0;
          }
          65% {
            transform: scale(0.9) rotate(3deg);
            opacity: 0.9;
          }
          80% {
            transform: scale(1.1) rotate(-2deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        .animate-box {
          animation: box-animate 3s ease-in-out infinite;
          transform-origin: 50px 50px;
        }
      `}</style>
    </div>
  );
}
