# Chat & Transaction System Setup Guide

## Prerequisites

- Supabase project set up with database tables (users, listings, transactions, messages, reviews)
- Next.js 14 with App Router
- Environment variables configured

## Quick Start

### 1. Environment Variables

Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

#### Enable Realtime

In your Supabase Dashboard:

1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - `messages`
   - `transactions`

#### Create RLS Policies

Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can read their transaction messages"
ON messages FOR SELECT
USING (
  transaction_id IN (
    SELECT id FROM transactions
    WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their transactions"
ON messages FOR INSERT
WITH CHECK (
  transaction_id IN (
    SELECT id FROM transactions
    WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
  )
  AND sender_id = auth.uid()
);

-- Transactions policies
CREATE POLICY "Users can read their transactions"
ON transactions FOR SELECT
USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Sellers can update their transactions"
ON transactions FOR UPDATE
USING (seller_id = auth.uid());

-- Reviews policies
CREATE POLICY "Anyone can read reviews"
ON reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create reviews for their transactions"
ON reviews FOR INSERT
WITH CHECK (
  transaction_id IN (
    SELECT id FROM transactions
    WHERE (buyer_id = auth.uid() OR seller_id = auth.uid())
    AND status = 'completed'
  )
  AND reviewer_id = auth.uid()
);
```

### 3. Install Dependencies

All required dependencies are already in your package.json:
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Server-side Supabase
- `lucide-react` - Icons
- `next`, `react`, `react-dom` - Next.js

### 4. Test the Setup

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Create a test listing** (if you haven't already)

3. **Test transaction creation:**
   - Navigate to a listing
   - Click purchase/contact button
   - Should redirect to `/transactions/[id]`

4. **Test real-time chat:**
   - Open transaction in two different browsers/incognito windows
   - Log in as buyer in one, seller in another
   - Send messages - they should appear instantly

5. **Test transaction completion:**
   - As seller, click "取引完了" button
   - Verify status updates to "completed"
   - Review form should appear

## File Structure Overview

```
src/
├── app/
│   ├── (main)/transactions/
│   │   ├── page.tsx              # List of all transactions
│   │   └── [id]/page.tsx         # Chat/transaction detail page
│   └── api/transactions/
│       ├── route.ts              # Create transaction
│       └── [id]/
│           ├── route.ts          # Get transaction
│           ├── complete/route.ts # Complete transaction
│           └── messages/route.ts # Get/send messages
├── components/features/chat/
│   ├── ChatRoom.tsx
│   ├── MessageBubble.tsx
│   ├── MessageInput.tsx
│   └── TransactionHeader.tsx
├── hooks/
│   ├── useChat.ts                # Real-time chat hook
│   └── useTransaction.ts         # Transaction management
└── lib/utils/
    └── date.ts                   # Date formatting
```

## Integration with Existing Code

### From a Listing Page

To start a transaction/chat from a listing detail page:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ListingDetailPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStartChat = async (listingId: string) => {
    try {
      setLoading(true)

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 409) {
          // Transaction already exists
          router.push(`/transactions/${error.transaction_id}`)
          return
        }
        throw new Error(error.error)
      }

      const { transaction } = await response.json()
      router.push(`/transactions/${transaction.id}`)
    } catch (error) {
      console.error('Error starting transaction:', error)
      alert('取引の開始に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Your listing details */}
      <button
        onClick={() => handleStartChat(listingId)}
        disabled={loading}
      >
        {loading ? '処理中...' : '購入する'}
      </button>
    </div>
  )
}
```

### Add Link to Navigation

Add a link to transactions in your navigation:

```tsx
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

<Link href="/transactions">
  <MessageSquare className="w-5 h-5" />
  <span>取引</span>
</Link>
```

## Troubleshooting

### Messages Not Appearing in Real-time

1. Check Supabase Dashboard → Database → Replication
2. Ensure `messages` table is enabled for replication
3. Check browser console for WebSocket errors
4. Verify RLS policies allow reading messages

### Cannot Create Transaction

1. Check if user is authenticated
2. Verify listing exists and is active
3. Check if user is trying to buy their own listing
4. Review server logs for errors

### Cannot Complete Transaction

1. Verify user is the seller
2. Check transaction status is `in_progress`
3. Ensure RLS policy allows seller to update

### Real-time Updates Not Working

1. Check browser console for subscription errors
2. Verify Supabase Realtime is enabled in project settings
3. Check if channel subscription is successful
4. Test with Supabase Dashboard → API → Realtime

## Common Issues

### Issue: "Unauthorized" error
**Solution:** User not logged in. Redirect to login page.

### Issue: Transaction already exists (409)
**Solution:** Use the existing transaction_id from error response.

### Issue: Messages appear duplicated
**Solution:** The useChat hook already handles this. Check if you're rendering messages multiple times.

### Issue: Auto-scroll not working
**Solution:** Ensure the messagesEndRef is attached to a div at the end of the message list.

## Next Steps

1. **Add notifications** when new messages arrive
2. **Implement read receipts** to show message status
3. **Add typing indicators** for better UX
4. **Create admin dashboard** to monitor transactions
5. **Add image upload** for messages
6. **Implement escrow payment** for secure transactions

## Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- Main Documentation: `CHAT_TRANSACTIONS_README.md`

## Support

If you encounter any issues:
1. Check browser console for errors
2. Review Supabase logs
3. Verify RLS policies
4. Check environment variables
5. Ensure all dependencies are installed
