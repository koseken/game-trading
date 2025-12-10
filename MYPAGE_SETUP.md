# Mypage & Review Features - Setup Guide

## Prerequisites

1. Next.js 14 with App Router
2. Supabase project configured
3. TypeScript and Tailwind CSS setup
4. All database tables created (users, listings, transactions, messages, reviews)

## Database Setup

### 1. Create Supabase Storage Bucket for Avatars

Go to your Supabase Dashboard > Storage and create a new bucket:

```
Bucket name: avatars
Public: Yes
```

Or using SQL:

```sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);
```

### 2. Set Storage Policies

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to all avatars
CREATE POLICY "Public access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### 3. Add Database Indexes (Performance Optimization)

```sql
-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_transaction_id ON reviews(transaction_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Listings indexes
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_transaction_id ON messages(transaction_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
```

### 4. Add Row Level Security (RLS) Policies

```sql
-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users can view all reviews
CREATE POLICY "Reviews are viewable by everyone"
ON reviews FOR SELECT
TO authenticated
USING (true);

-- Users can only create reviews for their own transactions
CREATE POLICY "Users can create reviews for their transactions"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (
  reviewer_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM transactions
    WHERE transactions.id = transaction_id
    AND (transactions.buyer_id = auth.uid() OR transactions.seller_id = auth.uid())
    AND transactions.status = 'completed'
  )
);

-- Users cannot update or delete reviews (immutable)
-- If you want to allow updates/deletes, add policies here

-- Ensure users table has proper RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view all user profiles
CREATE POLICY "User profiles are viewable by everyone"
ON users FOR SELECT
TO authenticated
USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
```

### 5. Create Database Function for Auto-updating Rating

Optional: Create a trigger to automatically update user ratings when a review is added:

```sql
-- Function to update user rating
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate new average rating for the reviewee
  UPDATE users
  SET
    rating_avg = (
      SELECT AVG(rating)::numeric(3,2)
      FROM reviews
      WHERE reviewee_id = NEW.reviewee_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewee_id = NEW.reviewee_id
    ),
    updated_at = NOW()
  WHERE id = NEW.reviewee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_review_created ON reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();
```

## Environment Variables

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

All files are already created. No additional npm packages needed beyond what's in `package.json`:

- `@supabase/supabase-js`
- `@supabase/ssr`
- `zod`
- `react-hook-form`
- `@hookform/resolvers`
- `lucide-react`

## File Structure

```
src/
├── app/
│   ├── (main)/
│   │   ├── mypage/
│   │   │   ├── layout.tsx                    # Sidebar layout
│   │   │   ├── page.tsx                      # Dashboard
│   │   │   ├── listings/
│   │   │   │   ├── page.tsx                  # Listings management
│   │   │   │   └── ListingCard.tsx           # Listing card component
│   │   │   ├── purchases/
│   │   │   │   ├── page.tsx                  # Purchase history
│   │   │   │   └── PurchaseCard.tsx          # Purchase card component
│   │   │   ├── messages/
│   │   │   │   ├── page.tsx                  # Messages list
│   │   │   │   └── MessageCard.tsx           # Message card component
│   │   │   └── settings/
│   │   │       ├── page.tsx                  # Settings page
│   │   │       ├── ProfileSettingsForm.tsx   # Profile form
│   │   │       └── PasswordChangeForm.tsx    # Password form
│   │   └── reviews/
│   │       └── new/
│   │           └── page.tsx                  # Create review page
│   └── api/
│       ├── reviews/
│       │   └── route.ts                      # POST /api/reviews
│       ├── users/
│       │   ├── [id]/
│       │   │   └── reviews/
│       │   │       └── route.ts              # GET /api/users/:id/reviews
│       │   └── me/
│       │       ├── route.ts                  # GET/PUT /api/users/me
│       │       └── password/
│       │           └── route.ts              # PUT /api/users/me/password
│       └── upload/
│           └── avatar/
│               └── route.ts                  # POST /api/upload/avatar
├── components/
│   └── features/
│       └── reviews/
│           ├── StarRating.tsx                # Star rating component
│           ├── ReviewForm.tsx                # Review form
│           └── ReviewList.tsx                # Review list
├── lib/
│   └── validations/
│       └── user.ts                           # Zod schemas
└── types/
    └── database.ts                           # Type definitions (updated)
```

## Testing the Features

### 1. Test Mypage Dashboard
- Navigate to `/mypage`
- Should see user profile with avatar and rating
- Should see statistics (listings, transactions, reviews)
- Should see quick links

### 2. Test Listings Management
- Navigate to `/mypage/listings`
- Should see all your listings
- Try editing a listing
- Try deleting a listing (with confirmation)

### 3. Test Purchase History
- Navigate to `/mypage/purchases`
- Should see all purchases grouped by status
- Click "チャット" to go to chat room
- Click "評価する" for completed transactions

### 4. Test Messages
- Navigate to `/mypage/messages`
- Should see all conversations
- Should show last message preview
- Should show unread count

### 5. Test Settings
- Navigate to `/mypage/settings`
- Upload an avatar image
- Change username
- Change password
- Verify email is read-only

### 6. Test Reviews
- Complete a transaction
- Navigate to `/mypage/purchases`
- Click "評価する" on completed transaction
- Submit a review with rating and comment
- Verify review appears on reviewee's profile
- Verify you can't review the same transaction twice

## Common Issues & Solutions

### Issue: Avatar upload fails
**Solution:** Make sure the `avatars` bucket exists in Supabase Storage and is public.

### Issue: 401 Unauthorized on API calls
**Solution:** Make sure user is logged in. Check Supabase auth session is valid.

### Issue: Can't submit review
**Solution:**
- Check transaction status is 'completed'
- Verify you haven't already reviewed this transaction
- Ensure you're part of the transaction (buyer or seller)

### Issue: Images not loading
**Solution:** Check Supabase Storage URL and public access policies.

### Issue: Stats showing 0
**Solution:** Make sure you have actual data in the database (listings, transactions, reviews).

## Next Steps

1. Test all features thoroughly
2. Add pagination for large lists
3. Implement real-time updates for messages
4. Add notification system
5. Implement search and filtering
6. Add analytics and reporting

## Additional Features to Implement Later

- Email notifications for new reviews
- Review moderation system
- User blocking/reporting
- Advanced search and filters
- Export transaction history
- Two-factor authentication
- Social login integration
