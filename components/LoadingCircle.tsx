import React from 'react';

interface LoadingCircleProps {
  size?: number;
  color?: string;
  className?: string;
  progress?: number; // 0 to 100
}

export const LoadingCircle: React.FC<LoadingCircleProps> = ({ 
  size = 16, 
  color = '#2563eb',
  className = '',
  progress = 0
}) => {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  // Ensure progress starts completely hidden when at 0%
  const strokeDashoffset = progress === 0 ? circumference : circumference - (progress / 100) * circumference;
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
        style={{ overflow: 'hidden' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Progress circle */}
        {progress > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.3s ease-in-out'
            }}
          />
        )}
      </svg>
      
      <style jsx>{`
        @keyframes arrow-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingCircle;
