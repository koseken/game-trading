# UI Components Quick Start Guide

## What's Included

A complete set of 10+ reusable UI components for your game trading MVP, built with React, TypeScript, and Tailwind CSS with a clean, Mercari-like design.

### Components Created

1. **Button.tsx** - Multiple variants (primary, secondary, outline, danger), sizes, and loading states
2. **Input.tsx** - Text input with labels, error messages, and icon support
3. **Select.tsx** - Dropdown select with validation support
4. **Card.tsx** - Flexible card container with hover effects for product listings
5. **Avatar.tsx** - User avatars with automatic fallback to initials
6. **Rating.tsx** - Interactive star rating system (1-5 stars) with review counts
7. **Modal.tsx** - Accessible modal dialogs with overlay
8. **Loading.tsx** - Multiple loading spinner variants
9. **Toast.tsx** - Toast notification system (success, error, info, warning)
10. **Badge.tsx** - Status badges (active, sold, reserved, etc.)

### Additional Files

- **index.ts** - Central export file for all components
- **types.ts** - TypeScript type definitions
- **examples.tsx** - Component usage examples
- **ComponentShowcase.tsx** - Interactive demo of all components
- **README.md** - Detailed component documentation
- **SETUP.md** - Complete setup instructions

## Quick Start

### 1. Install Dependencies

```bash
npm install react react-dom
npm install -D @types/react @types/react-dom typescript
npm install -D tailwindcss postcss autoprefixer
```

### 2. Setup Tailwind CSS

The `tailwind.config.js` file has already been created in the project root with:
- Dark mode support (`class` strategy)
- Custom animations (fadeIn, slideUp, slideInRight)
- Proper content paths

Add Tailwind directives to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Import and Use Components

```tsx
// Import individual components
import { Button, Input, Card, useToast } from '@/components/ui';

// Or import everything
import * as UI from '@/components/ui';

function MyComponent() {
  const { addToast } = useToast();

  return (
    <Card hoverable>
      <Input label="Email" type="email" />
      <Button onClick={() => addToast('success', 'Success!')}>
        Submit
      </Button>
    </Card>
  );
}
```

### 4. Wrap Your App with ToastProvider

```tsx
// src/App.tsx
import { ToastProvider } from '@/components/ui';

function App() {
  return (
    <ToastProvider position="top-right">
      <YourApp />
    </ToastProvider>
  );
}
```

## File Structure

```
/mnt/c/Users/1228k/Github/game-trading/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── Avatar.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── ComponentShowcase.tsx
│   │       ├── Input.tsx
│   │       ├── Loading.tsx
│   │       ├── Modal.tsx
│   │       ├── Rating.tsx
│   │       ├── README.md
│   │       ├── SETUP.md
│   │       ├── Select.tsx
│   │       ├── Toast.tsx
│   │       ├── examples.tsx
│   │       ├── index.ts
│   │       └── types.ts
│   └── index.css
├── tailwind.config.js
└── COMPONENTS_QUICKSTART.md (this file)
```

## Component Examples

### Product Card Example

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter,
         Badge, Rating, Avatar, Button } from '@/components/ui';

function ProductCard() {
  return (
    <Card hoverable>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>Game Title</CardTitle>
          <Badge variant="active">Active</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-2xl font-bold">$45.00</p>
        <Rating rating={4.5} count={128} />

        <div className="flex items-center gap-2 mt-3">
          <Avatar fallbackText="John Doe" size="sm" />
          <span>John Doe</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="primary" fullWidth>
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Form Example

```tsx
import { Input, Select, Button, useToast } from '@/components/ui';

function ListingForm() {
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    addToast('success', 'Listing created!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Game Title"
        placeholder="Enter game title"
        required
      />

      <Select
        label="Platform"
        options={[
          { value: 'ps5', label: 'PlayStation 5' },
          { value: 'xbox', label: 'Xbox Series X' },
          { value: 'switch', label: 'Nintendo Switch' }
        ]}
        placeholder="Select platform"
        required
      />

      <Input
        label="Price"
        type="number"
        placeholder="0.00"
        leftIcon={<DollarIcon />}
      />

      <Button type="submit" variant="primary" fullWidth>
        Create Listing
      </Button>
    </form>
  );
}
```

## Features

### Design
- Clean, modern Mercari-like design
- Mobile-first responsive layout
- Smooth animations and transitions
- Consistent spacing and typography

### Accessibility
- Proper ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly

### Dark Mode
- All components support dark mode
- Toggle with: `document.documentElement.classList.toggle('dark')`
- Automatic color scheme adjustments

### TypeScript
- Fully typed components
- IntelliSense support
- Type-safe props
- Exported type definitions

## Color Scheme

- **Primary:** blue-500 (#3B82F6) / blue-600 (#2563EB)
- **Secondary:** gray-500 (#6B7280) / gray-600 (#4B5563)
- **Success:** green-500 (#10B981)
- **Error:** red-500 (#EF4444)
- **Warning:** yellow-500 (#F59E0B)
- **Info:** blue-500 (#3B82F6)

## Testing Components

To see all components in action:

```tsx
import { ComponentShowcase } from '@/components/ui/ComponentShowcase';

function App() {
  return <ComponentShowcase />;
}
```

This will render an interactive showcase with all components organized in tabs.

## Next Steps

1. **Customize Colors** - Update the color scheme in `tailwind.config.js`
2. **Add Components** - Create new components following the same patterns
3. **Build Pages** - Use components to build product listings, user profiles, etc.
4. **Integrate Backend** - Connect components to your API
5. **Add Features** - Image upload, search, filters, etc.

## Documentation

- **README.md** - Detailed component API documentation
- **SETUP.md** - Complete setup and configuration guide
- **examples.tsx** - Working code examples for each component
- **types.ts** - TypeScript type definitions and interfaces

## Support

For detailed documentation on each component, see:
- `/mnt/c/Users/1228k/Github/game-trading/src/components/ui/README.md`

For setup instructions and troubleshooting:
- `/mnt/c/Users/1228k/Github/game-trading/src/components/ui/SETUP.md`

## Total Code

- **2,500+ lines** of production-ready TypeScript/React code
- **10 core components** + subcomponents
- **100% TypeScript** with full type definitions
- **Dark mode ready** out of the box
- **Mobile responsive** by default

---

Built with React 18+, TypeScript 5+, and Tailwind CSS 3+
