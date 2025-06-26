import os
import glob
from PIL import Image

# Ana klasör yolu
base_dir = "/Users/macox/Library/CloudStorage/GoogleDrive-enes.arji@gmail.com/Drive'ım/NeSvg"

# Ana klasördeki tüm klasörleri listele ve sırala
all_folders = sorted([f for f in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, f)) and f.split(' ')[0].isdigit()])

# Tüm klasörleri dolaş
for folder_name in all_folders:
    try:
        folder_path = os.path.join(base_dir, folder_name)

        # "DesignBundles" klasörü kontrol et ve oluştur
        design_bundles_path = os.path.join(folder_path, "DesignBundles")
        if not os.path.exists(design_bundles_path):
            os.makedirs(design_bundles_path)

            # JPG, JPEG ve PNG görsellerini okuma
            images = [img for img in glob.glob(f"{folder_path}/*.jpg")]
            images.extend([img for img in glob.glob(f"{folder_path}/*.jpeg")])
            images.extend([img for img in glob.glob(f"{folder_path}/*.png")])

            if not images:
                print(f"Klasörde uygun dosya bulunamadı: {folder_name}")
                continue  # Eğer görsel yoksa, bir sonraki klasöre geç

            # Görselleri dolaş ve işle
            for image_path in images:
                img = Image.open(image_path)
                image_name = os.path.basename(image_path)
                ext = os.path.splitext(image_name)[1].lower()

                # 3:2 en boy oranını hesapla ve kes
                width, height = img.size
                new_height = width * 2 // 3

                # Görseli ortalayarak kes
                top = (height - new_height) // 2
                bottom = top + new_height

                cropped_img = img.crop((0, top, width, bottom))

                # Kesilmiş görseli "DesignBundles" klasörüne kaydet
                if ext == '.png':
                    cropped_img.save(os.path.join(design_bundles_path, image_name), format='PNG')
                else:
                    cropped_img.save(os.path.join(design_bundles_path, image_name))

            print(f"İşlem tamamlandı: {folder_name}")
    

    except Exception as e:
        print(f"{folder_name} işlenirken bir hata oluştu: {e}")
