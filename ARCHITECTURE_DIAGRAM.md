# Architecture Diagram - Chat & Transaction System

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐        ┌──────────────────────────┐   │
│  │ Transactions     │        │ Transaction/Chat         │   │
│  │ List Page        │───────▶│ Detail Page              │   │
│  │ /transactions    │        │ /transactions/[id]       │   │
│  └──────────────────┘        └──────────────────────────┘   │
│         │                              │                     │
│         │                              │                     │
│         │ useTransaction               │ useChat             │
│         │ hook                         │ hook                │
│         ↓                              ↓                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React Hooks Layer                       │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  • useTransaction: Manage transaction state          │   │
│  │  • useChat: Manage messages + realtime               │   │
│  │  • Fetch data from Supabase                          │   │
│  │  • Subscribe to realtime updates                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
└──────────────────────────────┼───────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                     API Routes (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  POST   /api/transactions           Create transaction       │
│  GET    /api/transactions/[id]      Get transaction         │
│  PUT    /api/transactions/[id]/complete  Complete           │
│  GET    /api/transactions/[id]/messages  Get messages       │
│  POST   /api/transactions/[id]/messages  Send message       │
│                                                               │
│  • Authentication checks                                     │
│  • Authorization validation                                  │
│  • Business logic                                            │
│  • Data transformation                                       │
│                                                               │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐         ┌─────────────────┐            │
│  │   PostgreSQL    │         │   Realtime      │            │
│  │   Database      │◀───────▶│   Subscriptions │            │
│  ├─────────────────┤         └─────────────────┘            │
│  │                 │                                         │
│  │ • transactions  │         Channels:                      │
│  │ • messages      │         • messages:${transactionId}    │
│  │ • reviews       │         • transaction:${id}            │
│  │ • listings      │                                         │
│  │ • users         │         Events:                        │
│  │                 │         • INSERT on messages           │
│  │ RLS Policies    │         • UPDATE on transactions       │
│  │ ✓ Row Level     │                                         │
│  │   Security      │                                         │
│  └─────────────────┘                                         │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Component Tree

```
TransactionDetailPage (/transactions/[id])
│
├─ TransactionHeader
│  ├─ Back Button
│  ├─ Listing Image
│  ├─ Listing Title & Price
│  └─ Status Badge
│
├─ ChatRoom
│  ├─ Loading State (Loader2 spinner)
│  ├─ Empty State (No messages)
│  └─ Messages List
│     └─ MessageBubble (for each message)
│        ├─ Avatar
│        ├─ Username
│        ├─ Message Content
│        └─ Timestamp
│
├─ Complete Button (seller only, when in_progress)
│
├─ Review Form Modal (after completion)
│  ├─ Star Rating (1-5)
│  ├─ Comment Textarea
│  ├─ Skip Button
│  └─ Submit Button
│
└─ MessageInput
   ├─ Textarea (auto-expanding)
   └─ Send Button
```

## Data Flow

### 1. Create Transaction Flow
```
User clicks "Purchase"
        ↓
POST /api/transactions { listing_id }
        ↓
API validates:
  - User authenticated ✓
  - Listing exists ✓
  - Listing is active ✓
  - User doesn't own listing ✓
  - No existing transaction ✓
        ↓
Create transaction record
  - status: in_progress
  - buyer_id: current user
  - seller_id: listing owner
        ↓
Update listing
  - status: reserved
        ↓
Send initial message
  - "取引を開始しました"
        ↓
Return transaction { id, ... }
        ↓
Redirect to /transactions/[id]
```

### 2. Real-time Message Flow
```
User types message
        ↓
Click send / Press Enter
        ↓
sendMessage(content)
        ↓
POST /api/transactions/[id]/messages
        ↓
API validates:
  - User authenticated ✓
  - User is buyer/seller ✓
  - Content not empty ✓
  - Transaction not cancelled ✓
        ↓
Insert message to database
  - transaction_id
  - sender_id: current user
  - content
  - created_at: now
        ↓
Database INSERT triggers Realtime
        ↓
All subscribed clients receive:
  postgres_changes event
        ↓
useChat hook receives event
        ↓
Fetch full message with sender details
        ↓
Add to messages array (check duplicates)
        ↓
ChatRoom re-renders
        ↓
Auto-scroll to new message
```

### 3. Complete Transaction Flow
```
Seller clicks "取引完了"
        ↓
Confirm dialog
        ↓
completeTransaction()
        ↓
PUT /api/transactions/[id]/complete
        ↓
API validates:
  - User authenticated ✓
  - User is seller ✓
  - Status is in_progress ✓
        ↓
Update transaction
  - status: completed
  - completed_at: now
        ↓
Update listing
  - status: sold
        ↓
Send system message
  - "取引が完了しました"
        ↓
Database UPDATE triggers Realtime
        ↓
All subscribed clients receive update
        ↓
useTransaction hook re-fetches
        ↓
UI updates status badge
        ↓
Show review form modal
```

## Hook State Management

### useChat Hook
```
State:
  ├─ messages: MessageWithSender[]
  ├─ loading: boolean
  ├─ error: Error | null
  └─ sending: boolean

Effects:
  ├─ Fetch initial messages on mount
  └─ Subscribe to realtime updates

Functions:
  └─ sendMessage(content: string)

Cleanup:
  └─ Unsubscribe on unmount
```

### useTransaction Hook
```
State:
  ├─ transaction: TransactionWithDetails | null
  ├─ loading: boolean
  ├─ error: Error | null
  └─ updating: boolean

Effects:
  ├─ Fetch transaction on mount
  └─ Subscribe to status updates

Functions:
  ├─ completeTransaction()
  └─ cancelTransaction()

Cleanup:
  └─ Unsubscribe on unmount
```

## Database Relationships

```
users
  │
  ├─ 1:N ──▶ transactions (as buyer)
  ├─ 1:N ──▶ transactions (as seller)
  ├─ 1:N ──▶ messages (as sender)
  └─ 1:N ──▶ reviews (as reviewer/reviewee)

listings
  │
  └─ 1:N ──▶ transactions

transactions
  │
  ├─ N:1 ──▶ listings
  ├─ N:1 ──▶ users (buyer)
  ├─ N:1 ──▶ users (seller)
  ├─ 1:N ──▶ messages
  └─ 1:1 ──▶ reviews

messages
  │
  ├─ N:1 ──▶ transactions
  └─ N:1 ──▶ users (sender)

reviews
  │
  ├─ 1:1 ──▶ transactions
  ├─ N:1 ──▶ users (reviewer)
  └─ N:1 ──▶ users (reviewee)
```

## Security Layers

```
┌─────────────────────────────────────────┐
│ Layer 1: Next.js Middleware             │
│ • Check authentication                  │
│ • Redirect if not logged in            │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│ Layer 2: API Route Validation          │
│ • Verify user is authenticated         │
│ • Check user authorization             │
│ • Validate request data                │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│ Layer 3: Row Level Security (RLS)      │
│ • Database-level access control        │
│ • Only authorized rows accessible      │
│ • Prevents direct database access      │
└─────────────────────────────────────────┘
```

## User Roles & Permissions

```
Buyer
  ├─ Can create transaction (purchase listing)
  ├─ Can view their transactions
  ├─ Can send messages in their transactions
  ├─ Can view transaction status
  └─ Can submit review after completion

Seller
  ├─ Can view their transactions
  ├─ Can send messages in their transactions
  ├─ Can view transaction status
  ├─ Can complete transaction ★
  └─ Can submit review after completion

Both
  ├─ Cannot access other users' transactions
  ├─ Cannot modify other users' messages
  ├─ Cannot change buyer_id or seller_id
  └─ Cannot revert completed transactions
```

## Status State Machine

```
                    ┌─────────┐
                    │ pending │
                    └────┬────┘
                         │
                         │ Transaction created
                         ↓
                  ┌──────────────┐
                  │ in_progress  │
                  └──┬────────┬──┘
                     │        │
         Seller      │        │  Transaction
         completes   │        │  cancelled
                     │        │
                     ↓        ↓
              ┌──────────┐  ┌──────────┐
              │completed │  │cancelled │
              └──────────┘  └──────────┘
                     │
                     │ Reviews can be submitted
                     ↓
              ┌──────────────┐
              │ Review Form  │
              └──────────────┘
```

## Realtime Architecture

```
Browser (Buyer)                    Supabase                    Browser (Seller)
      │                                │                              │
      │ Subscribe to channel           │                              │
      ├───────────────────────────────▶│                              │
      │                                │◀─────────────────────────────┤
      │                                │     Subscribe to channel     │
      │                                │                              │
      │ WebSocket Connected            │                              │
      │◀───────────────────────────────┤                              │
      │                                ├─────────────────────────────▶│
      │                                │      WebSocket Connected     │
      │                                │                              │
      │                                │                              │
      │ Send message                   │                              │
      ├───────────────────────────────▶│                              │
      │ POST /api/.../messages         │                              │
      │                                │                              │
      │                                │ INSERT into messages         │
      │                                │                              │
      │                                │ Broadcast INSERT event       │
      │◀───────────────────────────────┤─────────────────────────────▶│
      │ New message event              │      New message event       │
      │                                │                              │
      │ Fetch message details          │                              │
      ├───────────────────────────────▶│                              │
      │                                │◀─────────────────────────────┤
      │                                │    Fetch message details     │
      │                                │                              │
      │ Update UI                      │                              │
      │                                │                    Update UI │
      │                                │                              │
```

## File Dependencies

```
page.tsx (/transactions/[id])
  ├─ imports useChat from @/hooks/useChat
  ├─ imports useTransaction from @/hooks/useTransaction
  ├─ imports ChatRoom from @/components/features/chat
  ├─ imports MessageInput from @/components/features/chat
  ├─ imports TransactionHeader from @/components/features/chat
  └─ imports createClient from @/lib/supabase/client

useChat.ts
  ├─ imports createClient from @/lib/supabase/client
  └─ imports MessageWithSender from @/types/database

useTransaction.ts
  ├─ imports createClient from @/lib/supabase/client
  └─ imports TransactionWithDetails from @/types/database

ChatRoom.tsx
  ├─ imports MessageBubble from ./MessageBubble
  └─ imports MessageWithSender from @/types/database

MessageBubble.tsx
  ├─ imports formatDistanceToNow from @/lib/utils/date
  └─ imports MessageWithSender from @/types/database

MessageInput.tsx
  └─ imports Send icon from lucide-react

TransactionHeader.tsx
  ├─ imports TransactionWithDetails from @/types/database
  └─ imports ArrowLeft, Package from lucide-react

API routes
  └─ imports createClient from @/lib/supabase/server
```

## Performance Optimization

```
Frontend
  ├─ Memoized components (prevent re-renders)
  ├─ Debounced auto-scroll
  ├─ Efficient Realtime subscriptions
  ├─ Optimistic UI updates
  └─ Lazy loading (Next.js automatic)

Backend
  ├─ Indexed database queries
  ├─ Efficient RLS policies
  ├─ Connection pooling (Supabase)
  └─ Edge functions (Next.js API routes)

Database
  ├─ Indexes on foreign keys
  ├─ Indexes on frequently queried columns
  ├─ Efficient JOIN queries
  └─ Realtime subscriptions with filters
```

## Error Handling Flow

```
User Action
    ↓
  Try {
    API Call
      ↓
    Response OK?
      ├─ Yes → Update State → Show Success
      └─ No → Throw Error
  }
  Catch {
    Log Error
      ↓
    Set Error State
      ↓
    Show Error Message
      ↓
    Restore UI State (if needed)
  }
```

## Testing Strategy

```
Unit Tests
  ├─ Hooks (useChat, useTransaction)
  ├─ Utility functions (date formatting)
  └─ Component rendering

Integration Tests
  ├─ API routes
  ├─ Database operations
  └─ RLS policies

E2E Tests
  ├─ Create transaction flow
  ├─ Send message flow
  ├─ Complete transaction flow
  └─ Multi-user realtime updates

Manual Tests
  ├─ Browser compatibility
  ├─ Mobile responsiveness
  ├─ Accessibility
  └─ User experience
```

---

This architecture provides:
- ✅ Real-time communication
- ✅ Secure data access
- ✅ Scalable design
- ✅ Type safety
- ✅ Error handling
- ✅ Performance optimization
- ✅ Clean separation of concerns
