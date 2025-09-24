export interface QRCodeData {
  app: 'fishivo';
  version: '1.0';
  type: 'profile';
  userId: string;
  username: string;
  qrId: string;
  createdAt: string;
}

export interface QRCodeGenerateOptions {
  userId: string;
  username: string;
  avatarUrl?: string;
}

export interface QRCodeResponse {
  qrCodeId: string;
  qrCodeImageUrl: string;
  qrCodeData: QRCodeData;
}

export interface QRCodeSaveOptions {
  userId: string;
  qrCodeId: string;
  imageUrl: string;
}