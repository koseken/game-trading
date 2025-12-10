import React from 'react';

export interface RatingProps {
  rating: number;
  maxRating?: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  maxRating = 5,
  count,
  size = 'md',
  showCount = true,
  interactive = false,
  onChange,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFull = displayRating >= starValue;
          const isPartial = displayRating > index && displayRating < starValue;
          const fillPercentage = isPartial ? ((displayRating - index) * 100).toFixed(0) : null;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              className={`
                ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                transition-transform duration-150
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded
              `}
              disabled={!interactive}
              aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
            >
              {isPartial ? (
                <svg
                  className={sizeStyles[size]}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id={`gradient-${index}`}>
                      <stop offset={`${fillPercentage}%`} stopColor="#FBBF24" />
                      <stop offset={`${fillPercentage}%`} stopColor="#D1D5DB" />
                    </linearGradient>
                  </defs>
                  <path
                    fill={`url(#gradient-${index})`}
                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                  />
                </svg>
              ) : (
                <svg
                  className={sizeStyles[size]}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isFull ? '#FBBF24' : '#D1D5DB'}
                  aria-hidden="true"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      {showCount && count !== undefined && (
        <span className={`text-gray-600 ${textSizeStyles[size]} ml-1`}>
          ({count.toLocaleString()})
        </span>
      )}
      {!showCount && (
        <span className={`text-gray-600 ${textSizeStyles[size]} ml-1 font-medium`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
