# UI Components Library

A comprehensive set of reusable UI components for the game trading MVP, built with React, TypeScript, and Tailwind CSS.

## Components

### Button

A versatile button component with multiple variants, sizes, and loading states.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'danger' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `loading`: boolean (default: false)
- `fullWidth`: boolean (default: false)

**Example:**
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

<Button variant="danger" loading>
  Deleting...
</Button>
```

### Input

Text input component with label, error messages, and icon support.

**Props:**
- `label`: string
- `error`: string
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `helperText`: string

**Example:**
```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  required
/>

<Input
  label="Search"
  leftIcon={<SearchIcon />}
  placeholder="Search games..."
/>
```

### Select

Dropdown select component with label and error support.

**Props:**
- `label`: string
- `error`: string
- `options`: SelectOption[]
- `placeholder`: string
- `helperText`: string

**Example:**
```tsx
import { Select } from '@/components/ui';

<Select
  label="Category"
  options={[
    { value: 'ps5', label: 'PlayStation 5' },
    { value: 'xbox', label: 'Xbox Series X' },
    { value: 'switch', label: 'Nintendo Switch' }
  ]}
  placeholder="Select a category"
/>
```

### Card

Card container with hover effects, perfect for product listings.

**Props:**
- `hoverable`: boolean (default: false)
- `padding`: 'none' | 'sm' | 'md' | 'lg' (default: 'md')
- `shadow`: 'none' | 'sm' | 'md' | 'lg' (default: 'md')

**Sub-components:** CardHeader, CardTitle, CardContent, CardFooter

**Example:**
```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';

<Card hoverable>
  <CardHeader>
    <CardTitle>Game Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Game description...</p>
  </CardContent>
  <CardFooter>
    <Button>Buy Now</Button>
  </CardFooter>
</Card>
```

### Avatar

User avatar component with fallback to initials.

**Props:**
- `src`: string
- `alt`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `fallbackText`: string
- `rounded`: boolean (default: true)

**Example:**
```tsx
import { Avatar, AvatarGroup } from '@/components/ui';

<Avatar src="/path/to/image.jpg" alt="John Doe" size="md" />
<Avatar fallbackText="John Doe" size="lg" />

<AvatarGroup max={3}>
  <Avatar fallbackText="User 1" />
  <Avatar fallbackText="User 2" />
  <Avatar fallbackText="User 3" />
  <Avatar fallbackText="User 4" />
</AvatarGroup>
```

### Rating

Star rating display component (1-5 stars) with count.

**Props:**
- `rating`: number (required)
- `maxRating`: number (default: 5)
- `count`: number
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `showCount`: boolean (default: true)
- `interactive`: boolean (default: false)
- `onChange`: (rating: number) => void

**Example:**
```tsx
import { Rating } from '@/components/ui';

<Rating rating={4.5} count={128} />
<Rating rating={3} size="lg" showCount={false} />

<Rating
  rating={userRating}
  interactive
  onChange={(newRating) => setUserRating(newRating)}
/>
```

### Modal

Modal dialog with overlay and close button.

**Props:**
- `isOpen`: boolean (required)
- `onClose`: () => void (required)
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'md')
- `closeOnOverlayClick`: boolean (default: true)
- `closeOnEsc`: boolean (default: true)
- `showCloseButton`: boolean (default: true)

**Sub-components:** ModalHeader, ModalBody, ModalFooter

**Example:**
```tsx
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '@/components/ui';

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <ModalHeader>Confirm Purchase</ModalHeader>
  <ModalBody>
    Are you sure you want to purchase this game?
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handlePurchase}>
      Confirm
    </Button>
  </ModalFooter>
</Modal>
```

### Loading

Loading spinner component with multiple variants.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `variant`: 'spinner' | 'dots' | 'pulse' (default: 'spinner')
- `color`: 'primary' | 'secondary' | 'white' (default: 'primary')
- `fullScreen`: boolean (default: false)
- `text`: string

**Example:**
```tsx
import { Loading } from '@/components/ui';

<Loading size="md" variant="spinner" />
<Loading variant="dots" color="primary" />
<Loading fullScreen text="Loading games..." />
```

### Toast

Toast notification system with multiple types.

**Usage:**
1. Wrap your app with ToastProvider
2. Use the useToast hook to show notifications

**Example:**
```tsx
// In your App.tsx or root component
import { ToastProvider } from '@/components/ui';

function App() {
  return (
    <ToastProvider position="top-right">
      <YourApp />
    </ToastProvider>
  );
}

// In any component
import { useToast } from '@/components/ui';

function MyComponent() {
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast('success', 'Game added successfully!');
  };

  const handleError = () => {
    addToast('error', 'Failed to add game', 5000);
  };

  return (
    <Button onClick={handleSuccess}>Add Game</Button>
  );
}
```

### Badge

Status badges for various states.

**Props:**
- `variant`: 'active' | 'sold' | 'reserved' | 'pending' | 'cancelled' | 'new' | 'featured' | 'default'
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `rounded`: boolean (default: true)
- `dot`: boolean (default: false)

**Example:**
```tsx
import { Badge, BadgeGroup } from '@/components/ui';

<Badge variant="active">Active</Badge>
<Badge variant="sold">Sold</Badge>
<Badge variant="new" dot>New</Badge>

<BadgeGroup>
  <Badge variant="featured">Featured</Badge>
  <Badge variant="new">New</Badge>
</BadgeGroup>
```

## Design System

### Colors
- **Primary:** blue-500/blue-600
- **Secondary:** gray colors
- **Success:** green-500
- **Error:** red-500
- **Warning:** yellow-500

### Dark Mode
All components support dark mode automatically when the `dark` class is applied to the parent element.

```tsx
<html class="dark">
  {/* All components will use dark mode styles */}
</html>
```

### Accessibility
All components include:
- Proper ARIA labels
- Keyboard navigation support
- Focus indicators
- Screen reader friendly markup

## Setup

1. Install dependencies:
```bash
npm install react react-dom
npm install -D @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer
```

2. Import the components:
```tsx
import { Button, Input, Card, Modal } from '@/components/ui';
```

3. Make sure Tailwind CSS is configured in your project with the provided `tailwind.config.js`.
