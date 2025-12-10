import React, { useState } from 'react';
import { ToastProvider } from './Toast';
import {
  ProductCard,
  UserForm,
  LoadingStates,
  BadgeVariants,
  AvatarVariants,
  InteractiveRatingExample,
} from './examples';

/**
 * Component Showcase
 * A demo application showing all UI components in action
 *
 * To use this in your app:
 * 1. Import this component
 * 2. Wrap it with ToastProvider
 * 3. Render it in your main App component
 */
export const ComponentShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('cards');

  const tabs = [
    { id: 'cards', label: 'Product Cards' },
    { id: 'forms', label: 'Forms' },
    { id: 'loading', label: 'Loading States' },
    { id: 'badges', label: 'Badges' },
    { id: 'avatars', label: 'Avatars' },
    { id: 'rating', label: 'Ratings' },
  ];

  return (
    <ToastProvider position="top-right">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              UI Component Showcase
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              A comprehensive collection of reusable components for the game trading MVP
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            {activeTab === 'cards' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Product Cards
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ProductCard />
                  <ProductCard />
                  <ProductCard />
                </div>
              </div>
            )}

            {activeTab === 'forms' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Form Components
                </h2>
                <UserForm />
              </div>
            )}

            {activeTab === 'loading' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Loading States
                </h2>
                <LoadingStates />
              </div>
            )}

            {activeTab === 'badges' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Badge Variants
                </h2>
                <BadgeVariants />
              </div>
            )}

            {activeTab === 'avatars' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Avatar Components
                </h2>
                <AvatarVariants />
              </div>
            )}

            {activeTab === 'rating' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Rating Components
                </h2>
                <InteractiveRatingExample />
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => {
                document.documentElement.classList.toggle('dark');
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Toggle Dark Mode
            </button>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
};

export default ComponentShowcase;
