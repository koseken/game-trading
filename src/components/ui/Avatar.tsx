import React, { useState } from 'react';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackText?: string;
  rounded?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  fallbackText = '',
  rounded = true,
  className = '',
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeStyles = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
  };

  const roundedStyle = rounded ? 'rounded-full' : 'rounded-lg';

  const getInitials = (text: string): string => {
    if (!text) return '?';
    const words = text.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const getColorFromText = (text: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    const index = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (!src || imageError) {
    const initials = getInitials(fallbackText || alt);
    const bgColor = getColorFromText(fallbackText || alt);

    return (
      <div
        className={`
          ${sizeStyles[size]}
          ${roundedStyle}
          ${bgColor}
          flex items-center justify-center
          font-semibold text-white
          ${className}
        `}
        role="img"
        aria-label={alt || fallbackText}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`
        ${sizeStyles[size]}
        ${roundedStyle}
        object-cover
        ${className}
      `}
      onError={() => setImageError(true)}
      {...props}
    />
  );
};

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 3,
  size = 'md',
  className = '',
}) => {
  const childArray = React.Children.toArray(children);
  const displayChildren = max ? childArray.slice(0, max) : childArray;
  const remaining = max && childArray.length > max ? childArray.length - max : 0;

  const overlapStyles = {
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
    xl: '-ml-5',
  };

  return (
    <div className={`flex items-center ${className}`}>
      {displayChildren.map((child, index) => (
        <div
          key={index}
          className={`${index > 0 ? overlapStyles[size] : ''} border-2 border-white rounded-full`}
          style={{ zIndex: displayChildren.length - index }}
        >
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <Avatar
          size={size}
          fallbackText={`+${remaining}`}
          className={overlapStyles[size]}
        />
      )}
    </div>
  );
};
