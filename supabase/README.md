# Supabase Database Setup

This directory contains the database schema and configuration for the Game Trading platform.

## Files

- `config.toml` - Supabase local development configuration
- `migrations/001_initial_schema.sql` - Initial database schema migration

## Database Schema

### Tables

1. **users** - User profiles extending Supabase auth.users
   - Stores username, avatar, rating information
   - Auto-created via trigger when auth user signs up
   - Ratings are automatically updated when reviews are created

2. **game_categories** - Game categories (20 popular games seeded)
   - Genshin Impact, Pokemon, Final Fantasy XIV, etc.
   - Used to categorize listings

3. **listings** - Product listings from sellers
   - Title, description, price (100-1,000,000 cents)
   - Status: active, reserved, sold, cancelled
   - Multiple images support (array field)

4. **transactions** - Transactions between buyers and sellers
   - Links listing with buyer and seller
   - Status: pending, in_progress, completed, cancelled
   - Tracks when transaction is completed

5. **messages** - Chat messages within transactions
   - Allows buyer and seller to communicate
   - Timestamped for conversation history

6. **reviews** - User reviews after transaction
   - 1-5 star rating system
   - Optional comment
   - One review per user per transaction

### Security

- **Row Level Security (RLS)** enabled on all tables
- Policies ensure users can only:
  - View their own data and public information
  - Modify their own listings and profiles
  - Send messages in their own transactions
  - Review completed transactions they participated in

### Triggers

1. **Auto-create user profile** - When a user signs up via auth, automatically creates profile in users table
2. **Update rating** - When a review is created/updated/deleted, automatically recalculates user's average rating
3. **Update timestamps** - Automatically updates `updated_at` field on users and listings

### Views

- `listings_with_seller` - Listings with joined seller information
- `user_transactions` - Transaction history with user details

### Functions

- `get_user_active_listings_count(user_id)` - Get count of user's active listings
- `get_user_completed_transactions_count(user_id)` - Get count of user's completed transactions

## Setup Instructions

### Option 1: Local Development with Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Initialize Supabase (if not already done):
```bash
supabase init
```

3. Start local Supabase:
```bash
supabase start
```

4. Apply migrations:
```bash
supabase db reset
```

5. Access Studio at http://localhost:54323

### Option 2: Deploy to Supabase Cloud

1. Create a new project at https://app.supabase.com

2. Link your project:
```bash
supabase link --project-ref your-project-ref
```

3. Push migrations:
```bash
supabase db push
```

### Option 3: Manual SQL Execution

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Click "Run" to execute

## Environment Variables

Add these to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

For local development:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
```

## Testing the Schema

After applying the migration, you can test with these queries:

```sql
-- View all tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check seeded categories
SELECT * FROM game_categories;

-- View RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

## Common Operations

### Create a listing
```sql
INSERT INTO listings (seller_id, category_id, title, description, price, images)
VALUES (
  'user-uuid',
  (SELECT id FROM game_categories WHERE slug = 'genshin-impact'),
  'Genshin Impact Account AR 60',
  'High-level account with all 5-star characters',
  50000,
  ARRAY['image1.jpg', 'image2.jpg']
);
```

### Start a transaction
```sql
INSERT INTO transactions (listing_id, buyer_id, seller_id)
VALUES ('listing-uuid', 'buyer-uuid', 'seller-uuid');
```

### Send a message
```sql
INSERT INTO messages (transaction_id, sender_id, content)
VALUES ('transaction-uuid', 'sender-uuid', 'Hello! Is this still available?');
```

### Leave a review
```sql
INSERT INTO reviews (transaction_id, reviewer_id, reviewee_id, rating, comment)
VALUES (
  'transaction-uuid',
  'reviewer-uuid',
  'reviewee-uuid',
  5,
  'Great seller! Fast delivery and good communication.'
);
```

## Notes

- All IDs are UUIDs for security and scalability
- Prices are stored in cents (INTEGER) to avoid decimal precision issues
- Images are stored as URLs in a TEXT array
- Timestamps use TIMESTAMPTZ for timezone awareness
- RLS policies are strict but can be adjusted based on requirements
- The schema supports future features like escrow, dispute resolution, etc.
