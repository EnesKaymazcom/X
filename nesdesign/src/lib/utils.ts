/**
 * Metni URL dostu bir slug'a dönüştürür
 * @param text Dönüştürülecek metin
 * @returns URL dostu slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Unicode karakterleri normalize et
    .replace(/[\u0300-\u036f]/g, '') // Aksanlı karakterleri kaldır
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/[^\w-]+/g, '') // Alfanümerik olmayan karakterleri kaldır
    .replace(/--+/g, '-'); // Çift tireleri tek tire ile değiştir
}

/**
 * Fiyatı formatlar
 * @param price Formatlanacak fiyat
 * @returns Formatlanmış fiyat (örn: "₺99,99")
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(price);
}

/**
 * Tarihi formatlar
 * @param date Formatlanacak tarih
 * @returns Formatlanmış tarih (örn: "01.01.2023")
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Metni belirli bir uzunlukta keser
 * @param text Kesilecek metin
 * @param length Maksimum uzunluk
 * @returns Kesilmiş metin
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Dosya boyutunu formatlar
 * @param bytes Bayt cinsinden dosya boyutu
 * @returns Formatlanmış dosya boyutu (örn: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Rastgele bir ID oluşturur
 * @param length ID uzunluğu
 * @returns Rastgele ID
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
