# UI Components Setup Guide

## Installation

### 1. Install Dependencies

Make sure you have the following dependencies installed:

```bash
# Core dependencies
npm install react react-dom

# TypeScript types
npm install -D @types/react @types/react-dom typescript

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
```

### 2. Initialize Tailwind CSS

If you haven't already set up Tailwind CSS, run:

```bash
npx tailwindcss init -p
```

This will create `tailwind.config.js` and `postcss.config.js` files.

### 3. Configure Tailwind CSS

The `tailwind.config.js` file has already been created in the root directory with the necessary configuration:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
        slideUp: 'slideUp 0.3s ease-out',
        slideInRight: 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
```

### 4. Add Tailwind Directives

Create or update your main CSS file (e.g., `src/index.css` or `src/styles/globals.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. Import CSS in Your App

In your main entry file (e.g., `src/index.tsx` or `src/main.tsx`):

```tsx
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 6. Set Up Toast Provider

Wrap your app with the `ToastProvider` to enable toast notifications:

```tsx
// src/App.tsx
import React from 'react';
import { ToastProvider } from './components/ui';

function App() {
  return (
    <ToastProvider position="top-right">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Your app content */}
      </div>
    </ToastProvider>
  );
}

export default App;
```

## Usage Examples

### Basic Component Import

```tsx
import { Button, Input, Card, Modal } from '@/components/ui';

function MyComponent() {
  return (
    <div>
      <Button variant="primary">Click Me</Button>
      <Input label="Email" type="email" />
      <Card>
        <p>Card content</p>
      </Card>
    </div>
  );
}
```

### Using Toast Notifications

```tsx
import { useToast, Button } from '@/components/ui';

function MyComponent() {
  const { addToast } = useToast();

  const handleClick = () => {
    addToast('success', 'Operation completed successfully!');
  };

  return <Button onClick={handleClick}>Show Toast</Button>;
}
```

### Dark Mode Setup

Add this to your HTML file or root component:

```html
<!DOCTYPE html>
<html lang="en" class="dark">
  <!-- The 'dark' class enables dark mode -->
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Game Trading MVP</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

Toggle dark mode programmatically:

```tsx
// Toggle dark mode
document.documentElement.classList.toggle('dark');

// Enable dark mode
document.documentElement.classList.add('dark');

// Disable dark mode
document.documentElement.classList.remove('dark');
```

## TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Path Aliases (Optional)

If using path aliases like `@/components/ui`, configure your bundler:

### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};
```

## Testing the Components

To see all components in action, import and render the `ComponentShowcase`:

```tsx
// src/App.tsx
import React from 'react';
import { ComponentShowcase } from './components/ui/ComponentShowcase';

function App() {
  return <ComponentShowcase />;
}

export default App;
```

## Troubleshooting

### Tailwind styles not applying

1. Make sure you've imported the CSS file with Tailwind directives
2. Check that the `content` paths in `tailwind.config.js` match your project structure
3. Restart your dev server after changing Tailwind config

### TypeScript errors

1. Run `npm install -D @types/react @types/react-dom`
2. Check that your `tsconfig.json` includes the `src` directory
3. Ensure `jsx` is set to `"react-jsx"` in `tsconfig.json`

### Dark mode not working

1. Add the `dark` class to your `<html>` element
2. Ensure `darkMode: 'class'` is set in `tailwind.config.js`
3. Toggle the class using JavaScript: `document.documentElement.classList.toggle('dark')`

## File Structure

```
src/
├── components/
│   └── ui/
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── ComponentShowcase.tsx
│       ├── Input.tsx
│       ├── Loading.tsx
│       ├── Modal.tsx
│       ├── Rating.tsx
│       ├── README.md
│       ├── Select.tsx
│       ├── SETUP.md
│       ├── Toast.tsx
│       ├── examples.tsx
│       └── index.ts
├── index.css
└── App.tsx
```

## Next Steps

1. Customize the color scheme in `tailwind.config.js` to match your brand
2. Add more components as needed
3. Create composite components using these base components
4. Add animations and transitions as desired
5. Implement responsive breakpoints for mobile-first design

For more examples and detailed component documentation, see `README.md` and `examples.tsx`.
