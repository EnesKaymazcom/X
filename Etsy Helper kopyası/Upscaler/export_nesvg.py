import os
import shutil
import zipfile
import glob
import re
import cv2
import sys
import os

opencv_path = '/usr/local/lib/python3.7.9/site-packages'  # Replace with the correct path

if opencv_path not in sys.path:
    sys.path.insert(0, opencv_path)  # Add path to the beginning


def get_next_folder_number(target_folder):
    max_number = 0
    for folder_name in os.listdir(target_folder):
        match = re.match(r"(\d+) - .*", folder_name)
        if match:
            number = int(match.group(1))
            max_number = max(max_number, number)
    return max_number + 1

def move_and_zip_files(source_folder, target_folder, base_name, zip_name):
    # Hedef klasörde yeni bir alt klasör oluştur
    new_folder = os.path.join(target_folder, base_name)
    os.makedirs(new_folder, exist_ok=True)

    # Kaynak klasördeki tüm dosyaları yeni klasöre taşı
    for file in os.listdir(source_folder):
        shutil.move(os.path.join(source_folder, file), new_folder)

    # Belirli dosya türlerini yeni klasörde zipleyerek arşivle
    zip_file = os.path.join(new_folder, f"{zip_name}.zip")
    with zipfile.ZipFile(zip_file, 'w') as zipf:
        for file_type in ['*.png', '*.eps', '*.pdf', '*.dxf', '*.svg']:
            for file in glob.glob(os.path.join(new_folder, file_type)):
                zipf.write(file, os.path.basename(file))

def resize_and_crop_image(image, resize_size=(3000, 2400), crop_size=(2300, 2300)):
    # Görseli yeniden boyutlandır
    resized_image = cv2.resize(image, resize_size, interpolation=cv2.INTER_AREA)

    # Görseli merkezden kırp
    start_x = int((resize_size[0] - crop_size[0]) / 2)
    start_y = int((resize_size[1] - crop_size[1]) / 2)
    cropped_image = resized_image[start_y:start_y + crop_size[1], start_x:start_x + crop_size[0]]

    return cropped_image

def create_video_from_images(folder_path, loop_duration, total_duration):
    output_video = os.path.join(folder_path, "preview_video.mp4")

    try:
        # JPG ve JPEG görsellerini okuma
        images = [img for img in glob.glob(f"{folder_path}/*.jpg")]
        images.extend([img for img in glob.glob(f"{folder_path}/*.jpeg")])
        if not images:
            print("Klasörde uygun dosya bulunamadı.")
            return False

        images.sort()

        # Video ayarları
        fps = 25  # Saniyede 25 kare

        # Her bir görselin gösterileceği süre ve kare sayısı
        duration_per_image = loop_duration / len(images)
        frames_per_image = int(fps * duration_per_image)

        # Video yazarını oluşturma
        out = cv2.VideoWriter(output_video, cv2.VideoWriter_fourcc(*'mp4v'), fps, (2300, 2300))

        # Toplam kare sayısı ve mevcut kare
        total_frames = int(fps * total_duration)
        current_frame = 0

        while current_frame < total_frames:
            for image in images:
                frame = cv2.imread(image)
                processed_frame = resize_and_crop_image(frame)
                for _ in range(frames_per_image):
                    if current_frame >= total_frames:
                        break
                    out.write(processed_frame)
                    current_frame += 1

        # İşlemi tamamla ve video dosyasını kapat
        out.release()
        print("Video başarıyla oluşturuldu:")
        return True
    except Exception as e:
        print("Video oluşturulamadı. Hata:", e)
        return False

# Klasör yolu, döngü süresi ve toplam video süresi
source_folder = "/Users/macox/Etsy/Export"
target_folder = "/Users/macox/Library/CloudStorage/GoogleDrive-enes.arji@gmail.com/Drive'ım/NeSvg"
loop_duration = 5  # Tek döngü süresi saniye olarak
total_duration = 10  # Toplam video süresi saniye olarak

# Video oluşturma fonksiyonunu çağır
create_video_from_images(source_folder, loop_duration, total_duration)

# .eps dosyasının adını al ve düzenle
eps_files = [f for f in os.listdir(source_folder) if f.endswith('.eps')]
if eps_files:
    eps_name = os.path.splitext(eps_files[0])[0]
    formatted_eps_name = eps_name.replace('-', ' ').title()  # Tire işaretlerini boşluklarla değiştir ve baş harfleri büyüt
    zip_name = eps_name  # Zip dosyası için orijinal .eps adını kullan
    next_number = get_next_folder_number(target_folder)
    new_folder_name = f"{next_number} - {formatted_eps_name}"

    # Dosyaları taşı ve ziple
    move_and_zip_files(source_folder, target_folder, new_folder_name, zip_name)
    print("NeSvg dosya transferi işlemi tamamlandı.")
