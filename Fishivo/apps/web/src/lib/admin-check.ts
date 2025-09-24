// Admin email listesi - Production'da bu bilgi veritabanından gelmelidir
const ADMIN_EMAILS = [
  // Admin emailleri buraya eklenebilir
];

export function isUserAdmin(user: any): boolean {
  if (!user) return false;
  
  // user_metadata'da role kontrolü
  if (user.user_metadata?.role === 'admin') {
    return true;
  }
  
  // app_metadata'da role kontrolü (Supabase Admin panel'den ayarlanabilir)
  if (user.app_metadata?.role === 'admin') {
    return true;
  }
  
  // Email listesi kontrolü
  if (user.email && ADMIN_EMAILS.includes(user.email)) {
    return true;
  }
  
  return false;
}