# Mypage & Review Features

Complete implementation of user dashboard and review system for the game trading MVP.

## Created Files

### Validation Schemas
- `/src/lib/validations/user.ts` - Zod schemas for user profile, password, review, and avatar validation

### Review Components
- `/src/components/features/reviews/StarRating.tsx` - Interactive 5-star rating component
- `/src/components/features/reviews/ReviewForm.tsx` - Review submission form with validation
- `/src/components/features/reviews/ReviewList.tsx` - Display user reviews with pagination

### API Routes
- `/src/app/api/reviews/route.ts` - POST: Create new review
- `/src/app/api/users/[id]/reviews/route.ts` - GET: Fetch user reviews
- `/src/app/api/users/me/route.ts` - GET/PUT: Current user profile
- `/src/app/api/users/me/password/route.ts` - PUT: Change password
- `/src/app/api/upload/avatar/route.ts` - POST: Upload avatar to Supabase Storage

### Mypage Layout
- `/src/app/(main)/mypage/layout.tsx` - Sidebar navigation layout

### Mypage Pages
1. `/src/app/(main)/mypage/page.tsx` - Dashboard with stats and quick links
2. `/src/app/(main)/mypage/listings/page.tsx` - Listings management
3. `/src/app/(main)/mypage/listings/ListingCard.tsx` - Listing card component
4. `/src/app/(main)/mypage/purchases/page.tsx` - Purchase history
5. `/src/app/(main)/mypage/purchases/PurchaseCard.tsx` - Purchase card component
6. `/src/app/(main)/mypage/messages/page.tsx` - Messages list
7. `/src/app/(main)/mypage/messages/MessageCard.tsx` - Message preview card
8. `/src/app/(main)/mypage/settings/page.tsx` - Settings page
9. `/src/app/(main)/mypage/settings/ProfileSettingsForm.tsx` - Profile edit form
10. `/src/app/(main)/mypage/settings/PasswordChangeForm.tsx` - Password change form

### Review Pages
- `/src/app/(main)/reviews/new/page.tsx` - Create review page

### Type Definitions
- Updated `/src/types/database.ts` with `ReviewWithReviewer` type

## Features Implemented

### Mypage Dashboard
- User profile card with avatar, username, and rating
- Statistics display:
  - Number of listings (出品数)
  - Completed transactions (取引完了数)
  - Review count (評価数)
- Quick links to all sub-pages
- Clean card-based UI

### Listings Management
- View all user's listings
- Filter by status:
  - Active (出品中)
  - Reserved (取引中)
  - Sold (売却済)
- Edit/Delete actions
- Status indicators with color coding
- Delete confirmation modal

### Purchase History
- List of all purchases
- Transaction status tracking
- Grouped by status (pending, in_progress, completed)
- Link to chat room
- Review button for completed transactions
- Shows if already reviewed

### Messages List
- All active conversations
- Last message preview
- Unread count indicator (simplified implementation)
- Transaction status badges
- Time formatting (relative time)
- Links to chat rooms

### Settings
- Avatar upload to Supabase Storage
  - File size validation (max 5MB)
  - File type validation (JPEG, PNG, WebP, GIF)
  - Preview before save
- Username change
  - Uniqueness validation
  - Pattern validation (alphanumeric, hyphen, underscore)
  - Length validation (3-20 characters)
- Password change
  - Current password verification
  - New password validation
  - Confirmation matching
- Display email (read-only)
- Account creation date
- Last updated date

### Review System
- Interactive 5-star rating selector
- Comment textarea (optional, max 500 characters)
- Validation:
  - Only after transaction completed
  - One review per transaction per user
  - Must be part of the transaction
- Auto-update user's average rating
- Display reviews on user profile
- Reviewer information display
- Date formatting

## Security Features

### Authentication
- All API routes require authentication
- User verification for all actions
- Transaction ownership verification

### Authorization
- Users can only edit their own data
- Review restrictions:
  - Must be part of the transaction
  - Transaction must be completed
  - Cannot review twice
  - Must review the correct party

### Validation
- Server-side Zod validation
- Client-side form validation
- File upload validation
- Username uniqueness check
- Password strength requirements

### Data Protection
- No exposure of sensitive user data
- Proper error messages (no data leakage)
- Secure file uploads to Supabase Storage

## UI/UX Features

### Design
- Clean, modern card-based layout
- Consistent color scheme
- Status badges with semantic colors
- Responsive grid layouts
- Mobile-friendly design

### Interactivity
- Hover effects on cards and buttons
- Loading states during async operations
- Error and success messages
- Confirmation modals for destructive actions
- Form validation feedback

### Navigation
- Sidebar navigation with active state
- Breadcrumb-style page structure
- Quick links on dashboard
- Back navigation support

## Database Integration

### Tables Used
- `users` - User profiles
- `listings` - Product listings
- `transactions` - Purchase/sale records
- `messages` - Chat messages
- `reviews` - User reviews

### Queries Optimized
- JOIN operations for related data
- Count queries for statistics
- Filtered queries by status
- Ordered results by date
- Single queries for detail pages

## Next Steps / Additional Features to Consider

1. **Avatar Management**
   - Delete old avatars when uploading new ones
   - Image optimization/resizing
   - Multiple avatar formats support

2. **Review Enhancements**
   - Edit/delete own reviews
   - Report inappropriate reviews
   - Review response feature
   - Review images

3. **Messaging Enhancements**
   - Real-time message updates
   - Read/unread tracking in database
   - Message search
   - Message notifications

4. **Listings Enhancements**
   - Bulk actions
   - Listing analytics
   - Saved drafts
   - Duplicate listing

5. **Settings Enhancements**
   - Email change with verification
   - Two-factor authentication
   - Privacy settings
   - Notification preferences

6. **Performance**
   - Pagination for large lists
   - Virtual scrolling
   - Image lazy loading
   - Cache management

## Required Supabase Setup

### Storage Bucket
Create an `avatars` bucket in Supabase Storage:
```sql
-- Create avatars bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow public read access
CREATE POLICY "Public access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### Database Indexes (Recommended)
```sql
-- Improve review queries
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_transaction ON reviews(transaction_id);

-- Improve transaction queries
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Improve message queries
CREATE INDEX idx_messages_transaction ON messages(transaction_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

## Japanese Language Support

All UI text and validation messages are in Japanese:
- Form labels and placeholders
- Error messages
- Success messages
- Status labels
- Navigation menu items

## Testing Checklist

- [ ] User can view dashboard with correct stats
- [ ] User can view and filter listings
- [ ] User can edit/delete listings
- [ ] User can view purchase history
- [ ] User can navigate to chat rooms
- [ ] User can view messages list
- [ ] User can upload avatar
- [ ] User can change username
- [ ] User can change password
- [ ] User can submit review
- [ ] Review validation works correctly
- [ ] Average rating updates after review
- [ ] Cannot review same transaction twice
- [ ] Cannot review before transaction complete
- [ ] All links work correctly
- [ ] Mobile responsive design works
- [ ] Error handling displays properly
- [ ] Loading states show correctly
