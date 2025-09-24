// Country name to code mapping for location parsing
const COUNTRY_CODE_MAP: { [key: string]: string } = {
  // Turkish names
  'Türkiye': 'TR',
  'Amerika': 'US',
  'Almanya': 'DE',
  'Fransa': 'FR',
  'İtalya': 'IT',
  'İspanya': 'ES',
  'İngiltere': 'GB',
  'Yunanistan': 'GR',
  'Hollanda': 'NL',
  'Kanada': 'CA',
  'Avustralya': 'AU',
  'Japonya': 'JP',
  'Çin': 'CN',
  'Rusya': 'RU',
  'Brezilya': 'BR',
  'Meksika': 'MX',
  'Arjantin': 'AR',
  'Hindistan': 'IN',
  'Güney Kore': 'KR',
  'Norveç': 'NO',
  'İsveç': 'SE',
  'Finlandiya': 'FI',
  'Danimarka': 'DK',
  'Portekiz': 'PT',
  'Avusturya': 'AT',
  'İsviçre': 'CH',
  'Belçika': 'BE',
  'Polonya': 'PL',
  'Çekya': 'CZ',
  'Macaristan': 'HU',
  'Romanya': 'RO',
  'Bulgaristan': 'BG',
  'Hırvatistan': 'HR',
  'Sırbistan': 'RS',
  'Ukrayna': 'UA',
  'Mısır': 'EG',
  'Güney Afrika': 'ZA',
  'Yeni Zelanda': 'NZ',
  'İrlanda': 'IE',
  'İskoçya': 'GB',
  'Galler': 'GB',
  
  // English names
  'Turkey': 'TR',
  'United States': 'US',
  'USA': 'US',
  'Germany': 'DE',
  'France': 'FR',
  'Italy': 'IT',
  'Spain': 'ES',
  'United Kingdom': 'GB',
  'UK': 'GB',
  'Greece': 'GR',
  'Netherlands': 'NL',
  'Canada': 'CA',
  'Australia': 'AU',
  'Japan': 'JP',
  'China': 'CN',
  'Russia': 'RU',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'Argentina': 'AR',
  'India': 'IN',
  'South Korea': 'KR',
  'Norway': 'NO',
  'Sweden': 'SE',
  'Finland': 'FI',
  'Denmark': 'DK',
  'Portugal': 'PT',
  'Austria': 'AT',
  'Switzerland': 'CH',
  'Belgium': 'BE',
  'Poland': 'PL',
  'Czech Republic': 'CZ',
  'Hungary': 'HU',
  'Romania': 'RO',
  'Bulgaria': 'BG',
  'Croatia': 'HR',
  'Serbia': 'RS',
  'Ukraine': 'UA',
  'Egypt': 'EG',
  'South Africa': 'ZA',
  'New Zealand': 'NZ',
  'Ireland': 'IE',
  'Scotland': 'GB',
  'Wales': 'GB'
};

/**
 * Extract country code from location string
 * @param locationName - Location string like "Istanbul, Turkey" or "New York, USA"
 * @returns Country code (e.g. "TR", "US") or empty string if not found
 */
export function getCountryCodeFromLocation(locationName: string): string {
  if (!locationName) return '';
  
  // Location is usually in "City, Country" format
  const parts = locationName.split(',');
  if (parts.length < 2) return '';
  
  const countryName = parts[parts.length - 1].trim();
  return COUNTRY_CODE_MAP[countryName] || '';
}