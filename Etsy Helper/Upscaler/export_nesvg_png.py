import os
import shutil
import zipfile
import glob
import re
import cv2
import sys
from PIL import Image, ImageDraw, ImageFont
import numpy as np

# Renk kodları
HEADER = '\033[95m'  # Mor
BLUE = '\033[94m'    # Mavi
GREEN = '\033[92m'   # Yeşil
YELLOW = '\033[93m'  # Sarı
RED = '\033[91m'     # Kırmızı
ENDC = '\033[0m'     # Renk sıfırlama

opencv_path = '/usr/local/lib/python3.7.9/site-packages'

if opencv_path not in sys.path:
    sys.path.insert(0, opencv_path)

def make_square_image(image_path, target_size=2300):
    try:
        img = Image.open(image_path)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        width, height = img.size
        square_size = max(width, height)
        square_img = Image.new('RGB', (square_size, square_size), (255, 255, 255))
        offset_x = (square_size - width) // 2
        offset_y = (square_size - height) // 2
        square_img.paste(img, (offset_x, offset_y))
        square_img = square_img.resize((target_size, target_size), Image.LANCZOS)
        square_img.save(image_path, 'JPEG', quality=95)
        return True
    except Exception as e:
        return False

def upscale_png_files(source_folder):
    print(f"{HEADER}PNG dosyaları upscale ediliyor...{ENDC}")
    png_files = [f for f in os.listdir(source_folder) if f.lower().endswith('.png')]
    png_files = sorted(png_files)
    for png_file in png_files:
        input_path = os.path.join(source_folder, png_file)
        try:
            with Image.open(input_path) as img:
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                img = img.resize((4600, 4600), Image.LANCZOS)
                img.save(input_path, 'PNG', dpi=(300, 300))
                print(f"{GREEN}Upscaled: {png_file}{ENDC}")
        except Exception as e:
            print(f"{RED}Error upscaling {png_file}: {e}{ENDC}")

def get_next_folder_number(target_folder):
    max_number = 0
    for folder_name in os.listdir(target_folder):
        match = re.match(r"(\d+) - .*", folder_name)
        if match:
            number = int(match.group(1))
            max_number = max(max_number, number)
    return max_number + 1

def move_and_zip_files(source_folder, target_folder, base_name, zip_name):
    new_folder = os.path.join(target_folder, base_name)
    os.makedirs(new_folder, exist_ok=True)

    for file in os.listdir(source_folder):
        shutil.move(os.path.join(source_folder, file), new_folder)

    zip_file = os.path.join(new_folder, f"{zip_name}.zip")
    with zipfile.ZipFile(zip_file, 'w') as zipf:
        for file_type in ['*.png', '*.eps', '*.pdf', '*.dxf', '*.svg']:
            for file in glob.glob(os.path.join(new_folder, file_type)):
                zipf.write(file, os.path.basename(file))

def create_video_from_images(folder_path, loop_duration, total_duration):
    output_video = os.path.join(folder_path, "preview_video.mp4")
    print(f"{BLUE}Video oluşturuluyor...{ENDC}")

    try:
        # JPG ve JPEG dosyalarını bul
        images = [img for img in glob.glob(f"{folder_path}/*.jpg")]
        images.extend([img for img in glob.glob(f"{folder_path}/*.jpeg")])
        
        if not images:
            print(f"{YELLOW}Klasörde uygun dosya bulunamadı.{ENDC}")
            return False

        # Her görseli kare formata dönüştür
        print(f"{BLUE}Görseller kare formata dönüştürülüyor...{ENDC}")
        for image_path in images:
            make_square_image(image_path)

        images.sort()

        fps = 25
        duration_per_image = loop_duration / len(images)
        frames_per_image = int(fps * duration_per_image)

        out = cv2.VideoWriter(output_video, cv2.VideoWriter_fourcc(*'mp4v'), fps, (2300, 2300))

        total_frames = int(fps * total_duration)
        current_frame = 0

        while current_frame < total_frames:
            for image in images:
                frame = cv2.imread(image)
                for _ in range(frames_per_image):
                    if current_frame >= total_frames:
                        break
                    out.write(frame)
                    current_frame += 1

        out.release()
        print(f"{GREEN}Video başarıyla oluşturuldu!{ENDC}")
        return True
    except Exception as e:
        print(f"{RED}Video oluşturulamadı. Hata: {e}{ENDC}")
        return False

source_folder = "/Users/macox/Etsy/Export"
target_folder = "/Users/macox/Library/CloudStorage/GoogleDrive-enes.arji@gmail.com/Drive'ım/NeSvg"
loop_duration = 5
total_duration = 10

print(f"{HEADER}=== NeSvg PNG İşlemi Başlatılıyor ==={ENDC}")

# First upscale all PNG files
upscale_png_files(source_folder)

create_video_from_images(source_folder, loop_duration, total_duration)

png_files = [f for f in os.listdir(source_folder) if f.endswith('.png')]
if png_files:
    png_name = os.path.splitext(png_files[0])[0]
    formatted_png_name = png_name.replace('-', ' ').title()
    zip_name = png_name
    next_number = get_next_folder_number(target_folder)
    new_folder_name = f"{next_number} - {formatted_png_name}"

    print(f"{BLUE}Dosyalar taşınıyor ve ZIP oluşturuluyor...{ENDC}")
    move_and_zip_files(source_folder, target_folder, new_folder_name, zip_name)
    print(f"{GREEN}NeSvg PNG dosya transferi işlemi tamamlandı!{ENDC}")