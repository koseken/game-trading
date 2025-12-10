import React, { useState } from 'react';
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Avatar,
  AvatarGroup,
  Rating,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Loading,
  useToast,
  Badge,
  BadgeGroup,
} from './index';

/**
 * Example: Product Card Component
 * Demonstrates Card, Badge, Rating, Avatar, and Button components
 */
export const ProductCard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const handlePurchase = () => {
    setIsModalOpen(false);
    addToast('success', 'Game added to cart successfully!');
  };

  return (
    <>
      <Card hoverable shadow="md">
        <div className="relative">
          <img
            src="https://via.placeholder.com/400x300"
            alt="Game Cover"
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-2 right-2">
            <BadgeGroup>
              <Badge variant="new" dot>New</Badge>
              <Badge variant="featured">Featured</Badge>
            </BadgeGroup>
          </div>
        </div>

        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>The Legend of Zelda: Tears of the Kingdom</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Nintendo Switch
              </p>
            </div>
            <Badge variant="active">Active</Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                $45.00
              </span>
              <Rating rating={4.8} count={256} size="sm" />
            </div>

            <div className="flex items-center gap-2">
              <Avatar
                src="https://via.placeholder.com/40"
                fallbackText="John Doe"
                size="sm"
              />
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white">John Doe</p>
                <p className="text-gray-500 dark:text-gray-400">5.0 seller rating</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              Excellent condition, barely used. Includes original case and cartridge.
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex gap-2 w-full">
            <Button variant="outline" size="md" className="flex-1">
              Message
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={() => setIsModalOpen(true)}
            >
              Buy Now
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="md"
      >
        <ModalHeader>Confirm Purchase</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p>Are you sure you want to purchase this game for $45.00?</p>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Item Price</span>
                  <span>$45.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>$3.99</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>$48.99</span>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePurchase}>
            Confirm Purchase
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

/**
 * Example: User Form Component
 * Demonstrates Input, Select, and Button components
 */
export const UserForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    price: '',
  });
  const [errors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      addToast('success', 'Listing created successfully!');
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <Input
        label="Game Title"
        type="text"
        placeholder="Enter game title"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
      />

      <Select
        label="Category"
        options={[
          { value: 'ps5', label: 'PlayStation 5' },
          { value: 'ps4', label: 'PlayStation 4' },
          { value: 'xbox-series', label: 'Xbox Series X/S' },
          { value: 'xbox-one', label: 'Xbox One' },
          { value: 'switch', label: 'Nintendo Switch' },
          { value: 'pc', label: 'PC' },
        ]}
        placeholder="Select a category"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        error={errors.category}
        required
      />

      <Input
        label="Price"
        type="number"
        placeholder="0.00"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        error={errors.price}
        leftIcon={
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
        }
        helperText="Enter the price you want to sell for"
        required
      />

      <Input
        label="Description"
        type="text"
        placeholder="Describe the condition and details"
        helperText="Be specific about the condition, what's included, etc."
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
      >
        {loading ? 'Creating Listing...' : 'Create Listing'}
      </Button>
    </form>
  );
};

/**
 * Example: Loading States Component
 * Demonstrates different Loading variants
 */
export const LoadingStates: React.FC = () => {
  const [showFullScreen, setShowFullScreen] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Spinner Variants</h3>
        <div className="flex gap-8 items-center">
          <Loading size="sm" variant="spinner" />
          <Loading size="md" variant="spinner" />
          <Loading size="lg" variant="spinner" />
          <Loading size="xl" variant="spinner" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Dots Variants</h3>
        <div className="flex gap-8 items-center">
          <Loading size="sm" variant="dots" />
          <Loading size="md" variant="dots" />
          <Loading size="lg" variant="dots" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Text</h3>
        <Loading size="md" variant="spinner" text="Loading games..." />
      </div>

      <div>
        <Button onClick={() => setShowFullScreen(true)}>
          Show Full Screen Loading
        </Button>
      </div>

      {showFullScreen && (
        <Loading
          fullScreen
          size="lg"
          variant="spinner"
          text="Loading your content..."
        />
      )}
    </div>
  );
};

/**
 * Example: Badge Variants Component
 * Demonstrates all Badge variants
 */
export const BadgeVariants: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Status Badges</h3>
        <BadgeGroup>
          <Badge variant="active">Active</Badge>
          <Badge variant="sold">Sold</Badge>
          <Badge variant="reserved">Reserved</Badge>
          <Badge variant="pending">Pending</Badge>
          <Badge variant="cancelled">Cancelled</Badge>
          <Badge variant="new">New</Badge>
          <Badge variant="featured">Featured</Badge>
        </BadgeGroup>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Dots</h3>
        <BadgeGroup>
          <Badge variant="active" dot>Active</Badge>
          <Badge variant="sold" dot>Sold</Badge>
          <Badge variant="new" dot>New</Badge>
        </BadgeGroup>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Sizes</h3>
        <BadgeGroup>
          <Badge variant="active" size="sm">Small</Badge>
          <Badge variant="active" size="md">Medium</Badge>
          <Badge variant="active" size="lg">Large</Badge>
        </BadgeGroup>
      </div>
    </div>
  );
};

/**
 * Example: Avatar Variants Component
 * Demonstrates Avatar and AvatarGroup
 */
export const AvatarVariants: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Sizes</h3>
        <div className="flex items-center gap-4">
          <Avatar fallbackText="John Doe" size="sm" />
          <Avatar fallbackText="Jane Smith" size="md" />
          <Avatar fallbackText="Bob Wilson" size="lg" />
          <Avatar fallbackText="Alice Brown" size="xl" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Avatar Group</h3>
        <AvatarGroup max={4} size="md">
          <Avatar fallbackText="User 1" />
          <Avatar fallbackText="User 2" />
          <Avatar fallbackText="User 3" />
          <Avatar fallbackText="User 4" />
          <Avatar fallbackText="User 5" />
          <Avatar fallbackText="User 6" />
        </AvatarGroup>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Square Avatars</h3>
        <div className="flex items-center gap-4">
          <Avatar fallbackText="Game 1" size="md" rounded={false} />
          <Avatar fallbackText="Game 2" size="md" rounded={false} />
          <Avatar fallbackText="Game 3" size="md" rounded={false} />
        </div>
      </div>
    </div>
  );
};

/**
 * Example: Interactive Rating Component
 * Demonstrates interactive rating functionality
 */
export const InteractiveRatingExample: React.FC = () => {
  const [rating, setRating] = useState(3);
  const { addToast } = useToast();

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    addToast('info', `You rated ${newRating} stars`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Display Rating</h3>
        <Rating rating={4.5} count={1234} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Interactive Rating</h3>
        <Rating
          rating={rating}
          interactive
          onChange={handleRatingChange}
          showCount={false}
        />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Current rating: {rating} stars
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Sizes</h3>
        <div className="space-y-3">
          <Rating rating={4} size="sm" count={100} />
          <Rating rating={4} size="md" count={100} />
          <Rating rating={4} size="lg" count={100} />
        </div>
      </div>
    </div>
  );
};
