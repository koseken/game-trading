export * from './date'

// Utility to format currency in Japanese Yen
export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`
}

// Utility to truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Utility to get initials from username
export function getInitials(username: string): string {
  return username.charAt(0).toUpperCase()
}

// Utility to check if user is online (based on last seen)
export function isUserOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false
  const lastSeen = new Date(lastSeenAt)
  const now = new Date()
  const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
  return diffMinutes < 5 // Online if seen in last 5 minutes
}
