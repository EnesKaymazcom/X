import os
import shutil
import zipfile

def zip_dosyaları(src_dir, max_zip_boyutu_mb):
    toplam_boyut = 0
    zip_sayacı = 1
    zip_dosyası = None

    for filename in sorted(os.listdir(src_dir)):
        if not filename.lower().endswith('.png'):
            continue  # PNG dosyaları dışında olanları atla

        file_path = os.path.join(src_dir, filename)
        dosya_boyutu = os.path.getsize(file_path)

        if zip_dosyası is None or toplam_boyut + dosya_boyutu > max_zip_boyutu_mb * 1024 * 1024:
            if zip_dosyası:
                zip_dosyası.close()

            zip_dosya_adı = os.path.join(src_dir, f'ClipArts-{zip_sayacı:02}.zip')
            zip_dosyası = zipfile.ZipFile(zip_dosya_adı, 'w', zipfile.ZIP_DEFLATED)
            zip_sayacı += 1
            toplam_boyut = 0

        zip_dosyası.write(file_path, arcname=filename)
        toplam_boyut += dosya_boyutu

    if zip_dosyası:
        zip_dosyası.close()

def taşı_ve_yerleştir(src_dirs, dst_dir, base_dir):
    if not os.path.exists(dst_dir):
        os.makedirs(dst_dir)

    counter = 1
    while True:
        new_dst_dir_name = f'ClipArt-{str(counter).zfill(2)}'
        new_dst_dir_path = os.path.join(dst_dir, new_dst_dir_name)

        if not os.path.exists(new_dst_dir_path):
            os.makedirs(new_dst_dir_path)
            for src_dir_name in src_dirs:
                src_dir_path = os.path.join(base_dir, src_dir_name)
                
                # Eğer kaynak klasör 'Main Preview' ise, dosyaları direkt olarak 'WATERMARK' klasörüne taşı
                if src_dir_name == 'Main Preview':
                    watermark_path = os.path.join(new_dst_dir_path, 'WATERMARK')
                    for file in os.listdir(src_dir_path):
                        if file.lower().endswith(('.jpg', '.jpeg')):
                            shutil.move(os.path.join(src_dir_path, file), os.path.join(watermark_path, file))
                else:
                    dst_sub_dir_path = os.path.join(new_dst_dir_path, src_dir_name)
                    shutil.move(src_dir_path, dst_sub_dir_path)
                
                if src_dir_name == 'Upscaled':
                    zip_dosyaları(dst_sub_dir_path, 20)
            break
        else:
            counter += 1

    for src_dir_name in src_dirs:
        os.makedirs(os.path.join(base_dir, src_dir_name), exist_ok=True)

src_klasörler = ['Upscaled', 'WATERMARK', 'Main Preview']
hedef_klasör = '/Users/macox/Library/CloudStorage/GoogleDrive-enes.arji@gmail.com/Drive\'ım/ThistleClipart/Clip Arts'
base_klasör = '/Users/macox/Desktop/Etsy Helper/Upscaler'

taşı_ve_yerleştir(src_klasörler, hedef_klasör, base_klasör)
