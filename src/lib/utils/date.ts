export function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) {
    return 'たった今'
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}分前`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}時間前`
  }

  const days = Math.floor(hours / 24)
  if (days < 7) {
    return `${days}日前`
  }

  const weeks = Math.floor(days / 7)
  if (weeks < 4) {
    return `${weeks}週間前`
  }

  const months = Math.floor(days / 30)
  if (months < 12) {
    return `${months}ヶ月前`
  }

  const years = Math.floor(days / 365)
  return `${years}年前`
}

export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
}

export function formatDateTime(date: Date): string {
  const dateStr = formatDate(date)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${dateStr} ${hours}:${minutes}`
}
