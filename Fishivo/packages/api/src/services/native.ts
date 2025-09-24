
import { userServiceNative } from './user/user.native';
import { postsServiceNative } from './posts/posts.native';
import { spotsServiceNative } from './spots/spots.native';
import { speciesServiceNative } from './species/species.native';
import { createNativeEquipmentService } from './equipment/equipment.native';
import { createNativeFishingTechniquesService } from './fishing-techniques/fishing-techniques.native';
import { weatherServiceNative } from './weather/weather.native';
import { nativeContactsService } from './contacts/contacts.native';
import { QRCodeServiceNative } from './qr-code';
import type { QRCodeGenerateOptions, QRCodeSaveOptions } from './qr-code';
import { ReferralServiceNative } from './referral/referral.native';
import type { ClaimReferralRequest } from './referral';
import { commentsServiceNative } from './comments/comments.native';
import { reportsService } from './reports/reports.native';
import { notificationsServiceNative } from './notifications/notifications.native';
import { fetchNearbyPOIs, clearPOICache, searchPOIs } from './poi/poi.native';
import { getNativeGeocodingService } from './geocoding/geocoding.native';
import { followService } from './follow/follow.native';
import { likesServiceNative } from './likes/likes.native';

// Export types
export type { NativeUserProfile } from './user/user.native';
export type { OverpassPOI } from './poi/types';

// Export individual services for direct access
export { postsServiceNative } from './posts/posts.native';
export { userServiceNative } from './user/user.native';
export { spotsServiceNative } from './spots/spots.native';
export { speciesServiceNative } from './species/species.native';
export { weatherServiceNative } from './weather/weather.native';
export { nativeContactsService } from './contacts/contacts.native';
export { commentsServiceNative } from './comments/comments.native';
export { reportsService } from './reports/reports.native';
export { notificationsServiceNative } from './notifications/notifications.native';
export { followService } from './follow/follow.native';
export { likesServiceNative } from './likes/likes.native';

export function createNativeApiService() {
  return {
    user: userServiceNative,
    posts: postsServiceNative,
    spots: spotsServiceNative,
    species: speciesServiceNative,
    equipment: createNativeEquipmentService(),
    fishingTechniques: createNativeFishingTechniquesService(),
    weather: weatherServiceNative,
    contacts: nativeContactsService,
    comments: commentsServiceNative,
    reports: reportsService,
    notifications: notificationsServiceNative,
    follow: followService,
    likes: likesServiceNative,
    poi: {
      fetchNearbyPOIs,
      clearPOICache,
      searchPOIs,
    },
    qrCode: {
      generate: (options: QRCodeGenerateOptions) => QRCodeServiceNative.generateQRCode(options),
      save: (options: QRCodeSaveOptions) => QRCodeServiceNative.saveQRCode(options),
      getUserQRCode: (userId: string) => QRCodeServiceNative.getUserQRCode(userId),
      regenerate: (userId: string, username: string) => QRCodeServiceNative.regenerateQRCode(userId, username),
    },
    referral: {
      claimReferral: (userId: string, request: ClaimReferralRequest) => ReferralServiceNative.claimReferral(userId, request),
      getReferralStats: (userId: string) => ReferralServiceNative.getReferralStats(userId),
      getUserByReferralCode: (code: string) => ReferralServiceNative.getUserByReferralCode(code),
      generateNewReferralCode: (userId: string) => ReferralServiceNative.generateNewReferralCode(userId),
      validateReferralCode: (code: string) => ReferralServiceNative.validateReferralCode(code),
      getReferralLeaderboard: (limit?: number) => ReferralServiceNative.getReferralLeaderboard(limit),
      generateReferralLink: (username: string, referralCode: string) => ReferralServiceNative.generateReferralLink(username, referralCode),
      generateReferralMessage: (username: string, referralCode: string, language?: 'en' | 'tr') => ReferralServiceNative.generateReferralMessage(username, referralCode, language),
    },
    geocoding: getNativeGeocodingService(),
    getCurrentWeather: weatherServiceNative.getCurrentWeather,
    getWeatherForecast: weatherServiceNative.getWeatherForecast,
    getLocationName: weatherServiceNative.getLocationName,
  };
}

export type NativeApiService = ReturnType<typeof createNativeApiService>;