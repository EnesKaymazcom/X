/**
 * Banned Words Lists for Content Filtering
 * Used by both username validation and comment validation
 */

// Turkish profanity/inappropriate words
export const TURKISH_BANNED_WORDS = [
  // Küfürler
  'amk', 'amq', 'amcık', 'amcik', 'amına', 'amina', 'aminakoyim', 'aminakoyum',
  'sik', 'sikik', 'sikim', 'sikeyim', 'siktir', 'sikerim', 'sikişi', 'sikis',
  'got', 'göt', 'götü', 'götu', 'götünü', 'gotunu', 'götüne', 'gotune',
  'orospu', 'orospusu', 'orospuyu', 'orusbu', 'orsbu',
  'kahpe', 'kahpelik', 'kaşar', 'kasar',
  'ibne', 'ibnelik', 'ibnesi', 'homo',
  'pezevenk', 'pezevengi', 'pezeveng',
  'piç', 'pic', 'piçi', 'pici', 'piçlik', 'piclik',
  'döl', 'dol', 'sperm', 
  'yarrak', 'yarrağı', 'yarragi', 'yarragım', 'yarragim',
  'taşak', 'tasak', 'taşşak', 'tassak',
  'meme', 'memesi', 'göğüs', 'gogus',
  'amcuklu', 'amcuksu', 'sikişken', 'sikerken',
  'ananı', 'anani', 'ananın', 'ananin', 'anasını', 'anasini',
  'bacını', 'bacini', 'bacısını', 'bacisini',
  'oğlum', 'evladım', 'evladim',
  'götlek', 'gotlek', 'sikişmek', 'sikismek',
  'boşalmak', 'bosalmak', 'boşalma', 'bosalma',
  'mastürbasyon', 'masturbasyon', '31',
  'porno', 'pornografi', 'pornosu',
  'fahişe', 'fahise', 'sürtük', 'surtuk',
  'kaltak', 'kaltağı', 'kaltagi',
  'şerefsiz', 'serefsiz', 'namussuz', 'namus',
  'puşt', 'pust', 'götveren', 'gotveren',
  'salak', 'gerizekalı', 'gerizekalı', 'mal', 'geri zekali'
]

// English profanity/inappropriate words  
export const ENGLISH_BANNED_WORDS = [
  // F-word variations
  'fuck', 'fucking', 'fucked', 'fucker', 'fucks', 'fuk', 'fck', 'f*ck',
  'motherfucker', 'motherf*cker', 'mf', 'mofo',
  
  // S-word variations
  'shit', 'shitting', 'shitted', 'shits', 'sh*t', 'sht',
  'bullshit', 'horseshit', 'dogshit',
  
  // Sexual/Genital terms
  'pussy', 'pussies', 'cunt', 'cunts', 'c*nt',
  'dick', 'dicks', 'dickhead', 'penis', 'cock', 'cocks',
  'vagina', 'tits', 'boobs', 'boobies', 'nipple', 'nipples',
  'ass', 'asses', 'asshole', 'assholes', 'butthole',
  'anal', 'anus', 'rectum',
  
  // Derogatory terms for women
  'bitch', 'bitches', 'b*tch', 'whore', 'whores', 'slut', 'sluts',
  'skank', 'skanks', 'ho', 'hoe', 'hoes', 'thot',
  
  // Derogatory general terms
  'bastard', 'bastards', 'dumbass', 'jackass', 'smartass',
  'retard', 'retarded', 'idiot', 'moron', 'stupid',
  
  // Racial/Ethnic slurs (partial list - being careful)
  'nigger', 'nigga', 'n*gger', 'n*gga', 'negro',
  'chink', 'gook', 'spic', 'wetback', 'kike',
  
  // Religious/Political offensive
  'nazi', 'hitler', 'terrorist', 'jihad',
  'jesus', 'christ', 'god', 'allah', 'buddha', 'satan', 'devil',
  
  // Bodily functions
  'piss', 'pissed', 'pee', 'poop', 'crap', 'turd',
  'fart', 'farting', 'vomit', 'puke',
  
  // Sexual acts
  'sex', 'sexy', 'porn', 'porno', 'pornography', 'xxx',
  'blowjob', 'handjob', 'orgasm', 'masturbate', 'masturbation',
  'rape', 'raping', 'molest', 'pedophile', 'pedo',
  
  // Drugs
  'weed', 'marijuana', 'cannabis', 'cocaine', 'heroin',
  'meth', 'crack', 'drug', 'drugs',
  
  // Internet slang profanity
  'wtf', 'stfu', 'gtfo', 'omfg', 'lmfao',
  'damn', 'dammit', 'hell', 'hellish',
  
  // Mild but inappropriate
  'suck', 'sucks', 'sucking', 'gay', 'lesbian', 'homo',
  'kill', 'murder', 'die', 'death', 'suicide'
]

/**
 * Convert leet speak to normal characters for better detection
 */
export function normalizeLeetSpeak(text: string): string {
  return text
    .replace(/[0]/g, 'o')
    .replace(/[3]/g, 'e')
    .replace(/[1]/g, 'i')
    .replace(/[4]/g, 'a')
    .replace(/[5]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[@]/g, 'a')
    .replace(/[!]/g, 'i')
    .replace(/[\$]/g, 's')
}

/**
 * Check if text contains profanity
 */
export function containsProfanity(text: string): boolean {
  const cleanText = text.toLowerCase().trim()
  const normalizedText = normalizeLeetSpeak(cleanText)

  // Check Turkish banned words
  for (const word of TURKISH_BANNED_WORDS) {
    if (cleanText.includes(word) || normalizedText.includes(word)) {
      return true
    }
  }

  // Check English banned words
  for (const word of ENGLISH_BANNED_WORDS) {
    if (cleanText.includes(word) || normalizedText.includes(word)) {
      return true
    }
  }

  return false
}