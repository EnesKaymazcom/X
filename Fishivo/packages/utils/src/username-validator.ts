/**
 * Username Validation with Banned Words
 * Prevents inappropriate, reserved, and profanity usernames
 */

import { TURKISH_BANNED_WORDS, ENGLISH_BANNED_WORDS, normalizeLeetSpeak } from './security/banned-words'

// Reserved system usernames
const RESERVED_USERNAMES = [
  'admin', 'administrator', 'root', 'moderator', 'mod',
  'fishivo', 'official', 'support', 'help', 'api',
  'www', 'mail', 'email', 'ftp', 'blog', 'news',
  'system', 'user', 'guest', 'test', 'demo',
  'null', 'undefined', 'true', 'false',
  'login', 'register', 'signup', 'signin', 'logout',
  'profile', 'settings', 'account', 'dashboard'
]

// Common inappropriate patterns
const INAPPROPRIATE_PATTERNS = [
  /\d{4,}/, // Long sequences of numbers (like phone numbers)
  /(.)\1{3,}/, // Repeated characters (aaaa, 1111)
  /(sex|porn|xxx|adult|nude)/i,
  /(admin|root|mod)\d*/i,
  /^(test|demo|guest)\d*$/i,
  /18\+|21\+|adult/i, // Age restriction indicators
  /[0-9]+cm|[0-9]+inch/i, // Size references
  /(hot|sexy|naughty|kinky)/i, // Sexual descriptors
  /(dating|hookup|meet)/i, // Dating references
  /666|420/i, // Problematic numbers
  /(kill|murder|die)/i, // Violence
  /(hack|hacker|crack)/i, // Hacking references
  /[aeiou]{4,}/i, // Too many vowels in sequence
  /[bcdfghjklmnpqrstvwxyz]{5,}/i, // Too many consonants
  /(Trump|Biden|Politics)/i // Political figures (optional)
]

export interface UsernameValidationResult {
  isValid: boolean
  reason?: 'reserved' | 'profanity' | 'inappropriate' | 'pattern'
  message?: string
}


/**
 * Validate username against banned words and patterns
 */
export function validateUsername(username: string): UsernameValidationResult {
  if (!username || typeof username !== 'string') {
    return { isValid: false, reason: 'inappropriate', message: 'USERNAME_INVALID' }
  }

  const cleanUsername = username.toLowerCase().trim()
  const normalizedUsername = normalizeLeetSpeak(cleanUsername)

  // Check reserved usernames
  if (RESERVED_USERNAMES.includes(cleanUsername) || RESERVED_USERNAMES.includes(normalizedUsername)) {
    return { 
      isValid: false, 
      reason: 'reserved', 
      message: 'USERNAME_RESERVED' 
    }
  }

  // Check Turkish banned words (both original and normalized)
  for (const word of TURKISH_BANNED_WORDS) {
    if (cleanUsername.includes(word) || normalizedUsername.includes(word)) {
      return { 
        isValid: false, 
        reason: 'profanity', 
        message: 'USERNAME_INAPPROPRIATE' 
      }
    }
  }

  // Check English banned words (both original and normalized)
  for (const word of ENGLISH_BANNED_WORDS) {
    if (cleanUsername.includes(word) || normalizedUsername.includes(word)) {
      return { 
        isValid: false, 
        reason: 'profanity', 
        message: 'USERNAME_INAPPROPRIATE' 
      }
    }
  }

  // Check inappropriate patterns
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (pattern.test(cleanUsername)) {
      return { 
        isValid: false, 
        reason: 'pattern', 
        message: 'USERNAME_INAPPROPRIATE_PATTERN' 
      }
    }
  }

  return { isValid: true }
}

/**
 * Check if username contains only allowed characters
 */
export function validateUsernameFormat(username: string): boolean {
  if (!username) return false
  
  // Instagram-style validation
  return /^[a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)*$/.test(username)
}

/**
 * Generate suggestion for invalid usernames
 */
export function generateUsernameSuggestion(baseUsername: string): string {
  const clean = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '')
  const randomNum = Math.floor(Math.random() * 999) + 1
  
  // If clean username is too short, use 'user' prefix
  if (clean.length < 3) {
    return `user${randomNum}`
  }
  
  // Take first 10 chars and add random number
  const base = clean.substring(0, 10)
  return `${base}${randomNum}`
}

/**
 * Complete username validation (format + banned words)
 */
export function isUsernameValid(username: string): UsernameValidationResult {
  // First check format
  if (!validateUsernameFormat(username)) {
    return { 
      isValid: false, 
      reason: 'inappropriate', 
      message: 'USERNAME_INVALID_FORMAT' 
    }
  }

  // Then check banned words
  return validateUsername(username)
}