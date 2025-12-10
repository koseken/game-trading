# Testing Checklist for Chat & Transaction System

## Pre-Testing Setup

- [ ] Supabase project is configured
- [ ] Environment variables are set in `.env.local`
- [ ] Database tables are created (users, listings, transactions, messages, reviews)
- [ ] Realtime is enabled for `messages` and `transactions` tables
- [ ] RLS policies are created and enabled
- [ ] Development server is running (`npm run dev`)

## User Authentication Tests

- [ ] User can log in successfully
- [ ] User cannot access transactions without authentication
- [ ] Unauthenticated users are redirected to login page
- [ ] User session persists across page reloads

## Transaction Creation Tests

### From Listing Page
- [ ] Buyer can click "購入する" or contact button
- [ ] Transaction is created successfully
- [ ] Buyer is redirected to `/transactions/[id]`
- [ ] Initial system message is sent
- [ ] Listing status changes to "reserved"
- [ ] Transaction status is "in_progress"

### Edge Cases
- [ ] User cannot buy their own listing (error message shown)
- [ ] User cannot create duplicate transaction for same listing
- [ ] If transaction exists, user is redirected to existing transaction
- [ ] Cannot create transaction for inactive/sold listing
- [ ] Transaction requires authentication

## Chat Functionality Tests

### Message Sending
- [ ] Buyer can send messages
- [ ] Seller can send messages
- [ ] Messages appear instantly for both users
- [ ] Message content is trimmed (no leading/trailing whitespace)
- [ ] Empty messages cannot be sent
- [ ] Send button is disabled when message is empty
- [ ] Message input clears after sending

### Message Display
- [ ] Messages show sender avatar (or initials if no avatar)
- [ ] Messages show sender username (for received messages)
- [ ] Messages show timestamp in Japanese format
- [ ] Sent messages appear on the right (blue)
- [ ] Received messages appear on the left (gray)
- [ ] Messages are ordered by creation time (oldest first)
- [ ] Long messages wrap correctly
- [ ] Line breaks are preserved

### Real-time Updates
- [ ] New messages appear instantly without page refresh
- [ ] Messages appear for both buyer and seller in real-time
- [ ] Auto-scroll works when new messages arrive
- [ ] No duplicate messages appear
- [ ] Realtime subscription is established on page load
- [ ] Realtime subscription is cleaned up on page leave

### Loading States
- [ ] Loading spinner shows while fetching messages
- [ ] Empty state shows when no messages exist
- [ ] Loading text is in Japanese
- [ ] Error states are handled gracefully

## Transaction Management Tests

### Transaction Details
- [ ] Transaction page shows listing image
- [ ] Transaction page shows listing title
- [ ] Transaction page shows listing price
- [ ] Transaction page shows current status
- [ ] Transaction page shows buyer and seller info
- [ ] Back button navigates to transactions list

### Status Updates
- [ ] Transaction status badge shows correct color
- [ ] Status badge text is in Japanese
- [ ] Status updates in real-time when changed
- [ ] Seller sees "取引完了" button when status is in_progress
- [ ] Buyer does not see "取引完了" button

### Complete Transaction
- [ ] Only seller can complete transaction
- [ ] Confirmation dialog appears before completion
- [ ] Transaction status changes to "completed"
- [ ] Listing status changes to "sold"
- [ ] Completed timestamp is set
- [ ] System message is sent on completion
- [ ] Review form appears after completion

### Transaction Restrictions
- [ ] Only buyer and seller can access transaction
- [ ] Other users get 403 error
- [ ] Cannot send messages to cancelled transaction
- [ ] Cannot complete already completed transaction
- [ ] Cannot complete cancelled transaction

## Transactions List Tests

### Page Display
- [ ] Transactions list page loads correctly
- [ ] Page shows "購入中" (buying) tab
- [ ] Page shows "出品中" (selling) tab
- [ ] Active tab is highlighted
- [ ] Switching tabs updates the list

### Buying Tab
- [ ] Shows transactions where current user is buyer
- [ ] Shows correct other party (seller)
- [ ] Empty state shows when no transactions
- [ ] Empty state has "商品を探す" link
- [ ] Transactions are sorted by date (newest first)

### Selling Tab
- [ ] Shows transactions where current user is seller
- [ ] Shows correct other party (buyer)
- [ ] Empty state shows when no transactions
- [ ] Transactions are sorted by date (newest first)

### Transaction Items
- [ ] Each item shows listing image
- [ ] Each item shows listing title (truncated if long)
- [ ] Each item shows listing price
- [ ] Each item shows status badge
- [ ] Each item shows other party avatar/name
- [ ] Each item shows time since creation
- [ ] Clicking item navigates to transaction page

## Review System Tests

### Review Form
- [ ] Review form appears after transaction completion
- [ ] Form shows 5-star rating selector
- [ ] Stars are clickable and update rating
- [ ] Selected stars are highlighted (yellow)
- [ ] Comment field is optional
- [ ] "スキップ" button closes form without submitting
- [ ] "投稿する" button submits review

### Review Submission
- [ ] Review is saved to database
- [ ] Review includes correct reviewer_id
- [ ] Review includes correct reviewee_id
- [ ] Review includes transaction_id
- [ ] Review includes rating (1-5)
- [ ] Review includes comment if provided
- [ ] Success message is shown after submission
- [ ] User is redirected to transactions list
- [ ] Cannot submit review for incomplete transaction

## API Endpoint Tests

### POST /api/transactions
- [ ] Creates transaction with valid listing_id
- [ ] Returns 401 if not authenticated
- [ ] Returns 400 if listing_id missing
- [ ] Returns 404 if listing not found
- [ ] Returns 400 if listing not active
- [ ] Returns 400 if user owns listing
- [ ] Returns 409 if transaction exists
- [ ] Sets status to "in_progress"
- [ ] Updates listing to "reserved"

### GET /api/transactions/[id]
- [ ] Returns transaction with full details
- [ ] Returns 401 if not authenticated
- [ ] Returns 404 if transaction not found
- [ ] Returns 403 if user is not buyer/seller
- [ ] Includes listing details
- [ ] Includes buyer details
- [ ] Includes seller details

### PUT /api/transactions/[id]/complete
- [ ] Completes transaction
- [ ] Returns 401 if not authenticated
- [ ] Returns 404 if transaction not found
- [ ] Returns 403 if user is not seller
- [ ] Returns 400 if status is not in_progress
- [ ] Sets status to "completed"
- [ ] Sets completed_at timestamp
- [ ] Updates listing to "sold"
- [ ] Sends system message

### GET /api/transactions/[id]/messages
- [ ] Returns all messages for transaction
- [ ] Messages include sender details
- [ ] Messages are sorted by created_at
- [ ] Returns 401 if not authenticated
- [ ] Returns 404 if transaction not found
- [ ] Returns 403 if user is not buyer/seller

### POST /api/transactions/[id]/messages
- [ ] Creates message
- [ ] Returns 401 if not authenticated
- [ ] Returns 400 if content is empty
- [ ] Returns 404 if transaction not found
- [ ] Returns 403 if user is not buyer/seller
- [ ] Returns 400 if transaction is cancelled
- [ ] Trims message content
- [ ] Returns message with sender details

## UI/UX Tests

### Responsive Design
- [ ] Chat interface works on mobile (< 768px)
- [ ] Chat interface works on tablet (768px - 1024px)
- [ ] Chat interface works on desktop (> 1024px)
- [ ] Message bubbles are max 70% width
- [ ] Images scale correctly on all devices
- [ ] Text is readable on all screen sizes

### Accessibility
- [ ] All buttons have proper hover states
- [ ] Disabled states are clearly visible
- [ ] Focus states are visible for keyboard navigation
- [ ] Loading states provide feedback
- [ ] Error messages are clear and helpful
- [ ] All text is in Japanese as expected

### Performance
- [ ] Initial page load is fast (< 2s)
- [ ] Messages load quickly
- [ ] Real-time updates are near-instant (< 100ms)
- [ ] No memory leaks from subscriptions
- [ ] Smooth scrolling animation
- [ ] No layout shifts on load

## Error Handling Tests

### Network Errors
- [ ] Handles API errors gracefully
- [ ] Shows error message on failed transaction creation
- [ ] Shows error message on failed message send
- [ ] Retains unsent message on error
- [ ] Shows error message on failed transaction completion

### Real-time Errors
- [ ] Handles subscription failures
- [ ] Reconnects if connection is lost
- [ ] Shows error state if messages fail to load
- [ ] Logs errors to console for debugging

### Data Validation
- [ ] Empty messages are not sent
- [ ] Whitespace-only messages are not sent
- [ ] Invalid transaction IDs show error page
- [ ] Missing data shows appropriate error

## Security Tests

### Authentication
- [ ] Unauthenticated users cannot access transaction pages
- [ ] Unauthenticated users cannot send messages
- [ ] Unauthenticated users cannot create transactions
- [ ] Unauthenticated API calls return 401

### Authorization
- [ ] Users cannot access other users' transactions
- [ ] Only seller can complete transaction
- [ ] Only transaction participants can send messages
- [ ] RLS policies prevent unauthorized data access

### Data Integrity
- [ ] Users cannot modify other users' messages
- [ ] Users cannot modify transaction seller_id
- [ ] Users cannot forge sender_id in messages
- [ ] Completed transactions cannot be reverted

## Browser Compatibility

- [ ] Works in Chrome (latest)
- [ ] Works in Firefox (latest)
- [ ] Works in Safari (latest)
- [ ] Works in Edge (latest)
- [ ] Works in Chrome Mobile
- [ ] Works in Safari Mobile

## Multi-User Tests

### Concurrent Users
- [ ] Two users can chat simultaneously
- [ ] Messages don't cross between different transactions
- [ ] Each user sees their own messages on the right
- [ ] Each user sees other's messages on the left
- [ ] Status updates appear for both users

### Race Conditions
- [ ] Multiple messages sent quickly all appear
- [ ] Transaction completion works correctly under load
- [ ] No duplicate messages from rapid clicking
- [ ] Subscription handles rapid updates

## Integration Tests

### With Listings
- [ ] Transaction links back to listing
- [ ] Listing status updates correctly
- [ ] Sold listings cannot start new transactions
- [ ] Reserved listings show correct status

### With User Profiles
- [ ] User avatars display correctly
- [ ] Usernames display correctly
- [ ] User ratings could be shown (if implemented)

### With Reviews
- [ ] Review is linked to transaction
- [ ] Review is linked to correct users
- [ ] Review updates user rating (if implemented)

## Edge Cases

- [ ] Very long messages display correctly
- [ ] Messages with special characters work
- [ ] Messages with emojis work
- [ ] Messages with URLs display correctly
- [ ] Very long usernames are truncated
- [ ] No avatar users show initials
- [ ] Rapid page navigation doesn't cause errors
- [ ] Multiple browser tabs work correctly
- [ ] Page refresh preserves state

## Final Checks

- [ ] No console errors in browser
- [ ] No warnings in browser console
- [ ] No errors in server logs
- [ ] All Japanese text is correct
- [ ] All links work correctly
- [ ] All buttons work correctly
- [ ] All forms submit correctly
- [ ] Database is updated correctly
- [ ] Realtime updates work consistently
- [ ] User experience is smooth and intuitive

## Test Scenarios

### Scenario 1: Complete Transaction Flow
1. Buyer browses listings
2. Buyer clicks purchase on a listing
3. Transaction is created
4. Buyer sends first message
5. Seller receives message and replies
6. Conversation continues
7. Seller marks transaction as complete
8. Both users see completion
9. Both users can submit reviews

### Scenario 2: Multiple Concurrent Transactions
1. User A creates transaction with User B (Listing 1)
2. User A creates transaction with User C (Listing 2)
3. User A can see both in transactions list
4. Messages don't mix between transactions
5. Each transaction has correct participants

### Scenario 3: Error Recovery
1. User sends message
2. Network fails
3. User sees error
4. Message is retained in input
5. User fixes network
6. User resends message
7. Message appears correctly

## Performance Benchmarks

- [ ] Transaction page loads in < 2 seconds
- [ ] Messages appear in real-time (< 100ms delay)
- [ ] Auto-scroll is smooth (60fps)
- [ ] List page loads 50+ transactions without lag
- [ ] No memory leaks after 10+ minutes of use
- [ ] Realtime subscription uses minimal bandwidth

## Post-Testing

- [ ] All critical tests pass
- [ ] Known issues are documented
- [ ] Performance is acceptable
- [ ] User experience is smooth
- [ ] Ready for production deployment
