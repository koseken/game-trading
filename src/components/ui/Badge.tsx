import React from 'react';

export type BadgeVariant =
  | 'active'
  | 'sold'
  | 'reserved'
  | 'pending'
  | 'cancelled'
  | 'new'
  | 'featured'
  | 'default';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = true,
  dot = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    active: 'bg-green-100 text-green-800 border-green-200',
    sold: 'bg-gray-100 text-gray-800 border-gray-200',
    reserved: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    pending: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    new: 'bg-purple-100 text-purple-800 border-purple-200',
    featured: 'bg-orange-100 text-orange-800 border-orange-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const roundedStyle = rounded ? 'rounded-full' : 'rounded';

  const dotColorMap = {
    active: 'bg-green-500',
    sold: 'bg-gray-500',
    reserved: 'bg-yellow-500',
    pending: 'bg-blue-500',
    cancelled: 'bg-red-500',
    new: 'bg-purple-500',
    featured: 'bg-orange-500',
    default: 'bg-gray-500',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${roundedStyle}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColorMap[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

export interface BadgeGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {children}
    </div>
  );
};
