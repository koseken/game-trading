# Chat & Transaction Features Documentation

## Overview

This implementation provides a complete real-time chat and transaction management system for the game trading MVP. The system uses Supabase Realtime for instant message updates and follows a clean transaction lifecycle.

## Features

### 1. Real-time Chat
- Instant message delivery using Supabase Realtime subscriptions
- LINE/Messenger-style UI with sender avatars
- Auto-scroll to latest messages
- Loading and empty states
- Message timestamps in Japanese format

### 2. Transaction Management
- Transaction status flow: `pending` → `in_progress` → `completed`
- Only buyer and seller can access their transactions
- Seller can mark transaction as complete
- Real-time status updates

### 3. Review System
- After transaction completion, users can leave reviews
- 5-star rating system
- Optional comment field
- Reviews linked to specific transactions

## File Structure

```
src/
├── app/
│   ├── (main)/
│   │   └── transactions/
│   │       ├── page.tsx                    # Transactions list page
│   │       └── [id]/
│   │           └── page.tsx                # Transaction/chat page
│   └── api/
│       └── transactions/
│           ├── route.ts                    # POST - Create transaction
│           └── [id]/
│               ├── route.ts                # GET - Get transaction
│               ├── complete/
│               │   └── route.ts            # PUT - Complete transaction
│               └── messages/
│                   └── route.ts            # GET/POST - Messages
├── components/
│   └── features/
│       └── chat/
│           ├── ChatRoom.tsx                # Message list container
│           ├── MessageBubble.tsx           # Individual message component
│           ├── MessageInput.tsx            # Message input form
│           ├── TransactionHeader.tsx       # Header with listing info
│           └── index.ts                    # Exports
├── hooks/
│   ├── useChat.ts                          # Real-time chat hook
│   └── useTransaction.ts                   # Transaction management hook
└── lib/
    └── utils/
        └── date.ts                         # Date formatting utilities
```

## Database Schema

The implementation expects the following Supabase tables (already defined in `src/types/database.ts`):

### transactions
- `id`: UUID (primary key)
- `listing_id`: UUID (foreign key → listings)
- `buyer_id`: UUID (foreign key → users)
- `seller_id`: UUID (foreign key → users)
- `status`: enum ('pending', 'in_progress', 'completed', 'cancelled')
- `created_at`: timestamp
- `completed_at`: timestamp (nullable)

### messages
- `id`: UUID (primary key)
- `transaction_id`: UUID (foreign key → transactions)
- `sender_id`: UUID (foreign key → users)
- `content`: text
- `created_at`: timestamp

### reviews
- `id`: UUID (primary key)
- `transaction_id`: UUID (foreign key → transactions)
- `reviewer_id`: UUID (foreign key → users)
- `reviewee_id`: UUID (foreign key → users)
- `rating`: integer (1-5)
- `comment`: text (nullable)
- `created_at`: timestamp

## Real-time Configuration

### Supabase Realtime Setup

The chat uses Supabase's real-time subscriptions. Ensure Realtime is enabled for the `messages` and `transactions` tables:

1. In Supabase Dashboard → Database → Replication
2. Enable replication for:
   - `messages` table
   - `transactions` table

### Row Level Security (RLS)

Recommended RLS policies:

```sql
-- Messages: Users can read messages for their transactions
CREATE POLICY "Users can read their transaction messages"
ON messages FOR SELECT
USING (
  transaction_id IN (
    SELECT id FROM transactions
    WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
  )
);

-- Messages: Users can insert messages to their transactions
CREATE POLICY "Users can send messages to their transactions"
ON messages FOR INSERT
WITH CHECK (
  transaction_id IN (
    SELECT id FROM transactions
    WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
  )
  AND sender_id = auth.uid()
);

-- Transactions: Users can read their own transactions
CREATE POLICY "Users can read their transactions"
ON transactions FOR SELECT
USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Transactions: Sellers can update their transactions
CREATE POLICY "Sellers can update their transactions"
ON transactions FOR UPDATE
USING (seller_id = auth.uid());

-- Reviews: Users can read all reviews
CREATE POLICY "Anyone can read reviews"
ON reviews FOR SELECT
USING (true);

-- Reviews: Users can create reviews for their transactions
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

## API Routes

### POST /api/transactions
Create a new transaction and start a chat.

**Request:**
```json
{
  "listing_id": "uuid"
}
```

**Response:**
```json
{
  "transaction": {
    "id": "uuid",
    "listing_id": "uuid",
    "buyer_id": "uuid",
    "seller_id": "uuid",
    "status": "in_progress",
    "created_at": "timestamp",
    "completed_at": null
  }
}
```

### GET /api/transactions/[id]
Get transaction details with full listing, buyer, and seller info.

**Response:**
```json
{
  "transaction": {
    "id": "uuid",
    "status": "in_progress",
    "listing": {...},
    "buyer": {...},
    "seller": {...}
  }
}
```

### PUT /api/transactions/[id]/complete
Complete a transaction (seller only).

**Response:**
```json
{
  "transaction": {
    "id": "uuid",
    "status": "completed",
    "completed_at": "timestamp"
  }
}
```

### GET /api/transactions/[id]/messages
Get all messages for a transaction.

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "transaction_id": "uuid",
      "sender_id": "uuid",
      "content": "string",
      "created_at": "timestamp",
      "sender": {
        "id": "uuid",
        "username": "string",
        "avatar_url": "string"
      }
    }
  ]
}
```

### POST /api/transactions/[id]/messages
Send a message to a transaction.

**Request:**
```json
{
  "content": "string"
}
```

**Response:**
```json
{
  "message": {
    "id": "uuid",
    "transaction_id": "uuid",
    "sender_id": "uuid",
    "content": "string",
    "created_at": "timestamp",
    "sender": {...}
  }
}
```

## Hooks

### useChat
Manages real-time chat functionality.

```typescript
const {
  messages,        // MessageWithSender[]
  loading,         // boolean
  error,           // Error | null
  sendMessage,     // (content: string) => Promise<void>
  sending,         // boolean
} = useChat({
  transactionId: 'uuid',
  enabled: true,   // optional, default: true
})
```

**Features:**
- Fetches initial messages on mount
- Subscribes to real-time updates
- Prevents duplicate messages
- Auto-fetches sender details for new messages
- Cleans up subscription on unmount

### useTransaction
Manages transaction state and operations.

```typescript
const {
  transaction,           // TransactionWithDetails | null
  loading,               // boolean
  error,                 // Error | null
  completeTransaction,   // () => Promise<void>
  cancelTransaction,     // () => Promise<void>
  updating,              // boolean
} = useTransaction({
  transactionId: 'uuid',
  enabled: true,         // optional, default: true
})
```

**Features:**
- Fetches transaction with full details
- Subscribes to real-time status updates
- Complete transaction (seller only)
- Cancel transaction
- Updates listing status accordingly

## Components

### ChatRoom
Displays the list of messages with auto-scroll.

```tsx
<ChatRoom
  messages={messages}
  currentUserId={userId}
  loading={false}
/>
```

### MessageBubble
Individual message with sender info and timestamp.

```tsx
<MessageBubble
  message={message}
  isOwnMessage={message.sender_id === currentUserId}
/>
```

### MessageInput
Text input with send button. Supports Enter to send (Shift+Enter for new line).

```tsx
<MessageInput
  onSend={sendMessage}
  disabled={false}
  sending={false}
/>
```

### TransactionHeader
Shows listing info and transaction status.

```tsx
<TransactionHeader transaction={transaction} />
```

## Usage Example

### Starting a Transaction from a Listing

```typescript
// In your listing detail page
const handleStartChat = async (listingId: string) => {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listing_id: listingId }),
  })

  const { transaction } = await response.json()
  router.push(`/transactions/${transaction.id}`)
}
```

### Transaction Page Flow

1. **User visits** `/transactions/[id]`
2. **Page loads** transaction details and messages
3. **Real-time subscriptions** established for messages and transaction updates
4. **User sends messages** via MessageInput
5. **Messages appear instantly** via Realtime
6. **Seller completes transaction** (if in_progress)
7. **Review form appears** for both users
8. **Users submit reviews** (optional)

## Status Flow

```
Listing is Active
       ↓
User clicks "購入する" / Start Chat
       ↓
POST /api/transactions
       ↓
Transaction: in_progress
Listing: reserved
       ↓
Seller clicks "取引完了"
       ↓
PUT /api/transactions/[id]/complete
       ↓
Transaction: completed
Listing: sold
       ↓
Review Form appears
       ↓
Users can submit reviews
```

## Styling

The UI uses Tailwind CSS with:
- **Chat bubbles:** Blue for sent messages, gray for received
- **Status badges:** Color-coded (yellow=pending, blue=in_progress, green=completed, gray=cancelled)
- **Responsive design:** Works on mobile and desktop
- **Japanese text:** All UI text in Japanese

## Error Handling

All hooks and API routes include error handling:
- Authentication errors redirect to login
- Not found errors show friendly messages
- Permission errors show 403 responses
- Real-time subscription errors are logged
- Failed message sends restore the input

## Performance Optimizations

1. **Debounced auto-scroll** on new messages
2. **Memoized message rendering** to prevent unnecessary re-renders
3. **Optimistic UI updates** for sent messages
4. **Efficient Realtime subscriptions** (single channel per transaction)
5. **Cleanup on unmount** to prevent memory leaks

## Testing Checklist

- [ ] Create transaction from listing
- [ ] Send messages between buyer and seller
- [ ] Verify real-time message delivery
- [ ] Complete transaction (seller)
- [ ] Submit review after completion
- [ ] View transaction list (buying/selling tabs)
- [ ] Check status updates in real-time
- [ ] Test unauthorized access
- [ ] Verify RLS policies
- [ ] Test with multiple concurrent users

## Future Enhancements

Potential features to add:
- Image/file attachments in messages
- Read receipts
- Typing indicators
- Push notifications
- Transaction dispute system
- Escrow payment integration
- Auto-complete after payment confirmation
- Message search
- Block/report users
- Transaction history export
