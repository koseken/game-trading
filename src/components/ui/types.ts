/**
 * Common types and interfaces used across UI components
 */

// Size types
export type Size = 'sm' | 'md' | 'lg' | 'xl';
export type SizeWithoutXL = 'sm' | 'md' | 'lg';

// Color types
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';

// Position types
export type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

// Spacing types
export type Spacing = 'none' | 'sm' | 'md' | 'lg';

// Shadow types
export type Shadow = 'none' | 'sm' | 'md' | 'lg' | 'xl';

// Status types for badges
export type StatusType =
  | 'active'
  | 'sold'
  | 'reserved'
  | 'pending'
  | 'cancelled'
  | 'new'
  | 'featured'
  | 'default';

// Toast notification types
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Loading variants
export type LoadingVariant = 'spinner' | 'dots' | 'pulse';

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

/**
 * Common component props
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Props for components that support theming
 */
export interface ThemeableProps {
  variant?: ColorVariant | ButtonVariant;
  size?: Size | SizeWithoutXL;
}

/**
 * Props for form components
 */
export interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Props for components with loading states
 */
export interface LoadingProps {
  loading?: boolean;
  loadingText?: string;
}

/**
 * Props for modal/overlay components
 */
export interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
}

/**
 * Product listing types (for game trading app)
 */
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  images: string[];
  seller: User;
  status: 'active' | 'sold' | 'reserved' | 'pending';
  createdAt: Date;
  updatedAt: Date;
  rating?: number;
  reviewCount?: number;
}

/**
 * User types
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  joinedAt: Date;
}

/**
 * Review/Rating types
 */
export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

/**
 * Order/Transaction types
 */
export interface Order {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
