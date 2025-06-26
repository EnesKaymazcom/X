import { v2 as cloudinary } from 'cloudinary';

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'duf08jznr',
  api_key: process.env.CLOUDINARY_API_KEY || '826289765873522',
  api_secret: process.env.CLOUDINARY_API_SECRET || 's8qiOWJFj6sPfhqs4FRpYygaMYA',
  secure: true,
});

/**
 * Cloudinary'ye dosya yükler
 * @param file Yüklenecek dosya
 * @param folder Dosyanın yükleneceği klasör
 * @returns Yüklenen dosyanın URL'si ve diğer bilgileri
 */
export async function uploadToCloudinary(file: string, folder: string = 'templates') {
  try {
    console.log(`Cloudinary'ye yükleniyor... Folder: ${folder}`);

    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: 'auto',
      timeout: 60000, // 60 saniye timeout
    });

    console.log('Cloudinary yükleme sonucu:', {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Cloudinary yükleme hatası:', error);
    throw new Error('Dosya yüklenirken bir hata oluştu');
  }
}

/**
 * Cloudinary'den dosya siler
 * @param publicId Silinecek dosyanın public ID'si
 * @returns Silme işleminin sonucu
 */
export async function deleteFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary silme hatası:', error);
    throw new Error('Dosya silinirken bir hata oluştu');
  }
}

export default cloudinary;
