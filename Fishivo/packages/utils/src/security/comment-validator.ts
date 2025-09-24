/**
 * Comment Content Validation
 * Prevents spam, personal information, URLs, and inappropriate content
 */

import { containsProfanity } from './banned-words'

export type CommentValidationReason = 'url' | 'personal_info' | 'profanity' | 'spam' | 'too_short' | 'too_long'

export interface CommentValidationResult {
  isValid: boolean
  reason?: CommentValidationReason
  message?: string
}

// URL Detection Patterns - defined as readonly array for immutability
const URL_PATTERNS = [
  // Standard URLs with protocols
  /(?:https?:\/\/|ftp:\/\/|www\.)[^\s]+/gi,
  // Domain patterns (e.g., example.com)
  /(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?/gi,
  // IP addresses
  /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
  // Common URL shorteners
  /(?:bit\.ly|tinyurl\.com|goo\.gl|t\.co|short\.link|tiny\.cc)\/[^\s]+/gi,
  // Encoded URLs
  /(?:http|https)%3A%2F%2F/gi,
] as const

// Personal Information Patterns - defined as readonly array for immutability
const PERSONAL_INFO_PATTERNS = [
  // Turkish phone numbers
  /(?:\+90|0)?[\s-]?(?:5[0-9]{2})[\s-]?(?:[0-9]{3})[\s-]?(?:[0-9]{2})[\s-]?(?:[0-9]{2})/g,
  // TC Kimlik No (11 digits)
  /\b[1-9][0-9]{10}\b/g,
  // Credit card patterns
  /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
  // Email addresses
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // Turkish address patterns
  /(?:sokak|sok\.|mahalle|mah\.|cadde|cad\.|bulvar|blv\.|apartman|apt\.|daire|kat)\s*:?\s*[^\s]+/gi,
  // Social security variations
  /\b(?:sgk|tc|tckn|kimlik)\s*(?:no|numarası)?\s*:?\s*\d+/gi,
] as const

// Spam Detection Patterns - defined as readonly array for immutability
const SPAM_PATTERNS = [
  // Repeated characters (5+ times)
  /(.)\1{4,}/g,
  // All caps messages (with some length)
  /^[A-Z\s!?.,]{20,}$/,
  // Excessive punctuation
  /[!?]{3,}/g,
  // Common spam phrases
  /(?:click here|buy now|limited time|act now|congratulations you won)/gi,
] as const

/**
 * Check if text contains URLs
 */
export function containsURL(text: string): boolean {
  return URL_PATTERNS.some(pattern => {
    pattern.lastIndex = 0 // Reset regex state
    return pattern.test(text)
  })
}

/**
 * Check if text contains personal information
 */
export function containsPersonalInfo(text: string): boolean {
  return PERSONAL_INFO_PATTERNS.some(pattern => {
    pattern.lastIndex = 0 // Reset regex state
    return pattern.test(text)
  })
}

/**
 * Check if text is spam
 */
export function isSpamContent(text: string, previousComments: string[] = []): boolean {
  const cleanText = text.trim().toLowerCase()
  
  // Check if same comment was posted recently
  if (previousComments.length > 0) {
    const recentComments = previousComments.slice(-5) // Check last 5 comments
    if (recentComments.some(comment => comment.toLowerCase() === cleanText)) {
      return true
    }
  }

  // Check spam patterns
  if (SPAM_PATTERNS.some(pattern => {
    pattern.lastIndex = 0
    return pattern.test(text)
  })) {
    return true
  }

  // Check for excessive caps (more than 60% of letters)
  const letters = text.match(/[a-zA-Z]/g) || []
  const upperCaseLetters = text.match(/[A-Z]/g) || []
  if (letters.length > 10 && upperCaseLetters.length / letters.length > 0.6) {
    return true
  }

  // Check for repetitive words
  const words = cleanText.split(/\s+/)
  const wordCounts = words.reduce((acc, word) => {
    if (word.length > 2) { // Ignore short words
      acc[word] = (acc[word] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  
  // If any word appears more than 3 times, it might be spam
  if (Object.values(wordCounts).some(count => count > 3)) {
    return true
  }

  return false
}

/**
 * Validate comment content
 */
export function validateCommentContent(
  text: string, 
  previousComments: string[] = []
): CommentValidationResult {
  if (!text || typeof text !== 'string') {
    return { isValid: false, reason: 'too_short', message: 'COMMENT_EMPTY' }
  }

  const trimmedText = text.trim()

  // Check length
  if (trimmedText.length < 1) {
    return { isValid: false, reason: 'too_short', message: 'COMMENT_TOO_SHORT' }
  }

  if (trimmedText.length > 500) {
    return { isValid: false, reason: 'too_long', message: 'COMMENT_TOO_LONG' }
  }

  // Check for URLs
  if (containsURL(trimmedText)) {
    return { isValid: false, reason: 'url', message: 'COMMENT_CONTAINS_URL' }
  }

  // Check for personal information
  if (containsPersonalInfo(trimmedText)) {
    return { isValid: false, reason: 'personal_info', message: 'COMMENT_CONTAINS_PERSONAL_INFO' }
  }

  // Check for profanity
  if (containsProfanity(trimmedText)) {
    return { isValid: false, reason: 'profanity', message: 'COMMENT_CONTAINS_PROFANITY' }
  }

  // Check for spam
  if (isSpamContent(trimmedText, previousComments)) {
    return { isValid: false, reason: 'spam', message: 'COMMENT_IS_SPAM' }
  }

  return { isValid: true }
}

/**
 * Get user-friendly error message for validation failure
 */
export function getValidationErrorMessage(reason: CommentValidationReason | undefined, locale: 'tr' | 'en' = 'tr'): string {
  const messages = {
    tr: {
      url: 'Yorumlarda link paylaşımı yasaktır',
      personal_info: 'Kişisel bilgi paylaşımı yasaktır',
      profanity: 'Uygunsuz içerik tespit edildi',
      spam: 'Spam içerik tespit edildi',
      too_short: 'Yorum çok kısa',
      too_long: 'Yorum çok uzun (maksimum 500 karakter)',
      default: 'Yorumunuz güvenlik kurallarına aykırı'
    },
    en: {
      url: 'Links are not allowed in comments',
      personal_info: 'Sharing personal information is prohibited',
      profanity: 'Inappropriate content detected',
      spam: 'Spam content detected',
      too_short: 'Comment is too short',
      too_long: 'Comment is too long (maximum 500 characters)',
      default: 'Your comment violates security rules'
    }
  }

  if (!reason || !(reason in messages.tr)) {
    return messages[locale].default
  }

  return messages[locale][reason]
}