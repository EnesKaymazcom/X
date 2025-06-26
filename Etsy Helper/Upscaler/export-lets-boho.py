import os
import shutil
import zipfile
import glob
import re
import cv2

# Renk kodları
HEADER = '\033[95m'  # Mor
BLUE = '\033[94m'    # Mavi
GREEN = '\033[92m'   # Yeşil
YELLOW = '\033[93m'  # Sarı
RED = '\033[91m'     # Kırmızı
ENDC = '\033[0m'     # Renk sıfırlama

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

def resize_and_crop_image(image, target_size=(3000, 2400), crop_size=(2300, 2300)):
    original_height, original_width = image.shape[:2]
    ratio = original_width / original_height

    # Eğer görsel zaten kare formatında ise (1:1 oran, %5 tolerans ile)
    if 0.95 <= ratio <= 1.05:
        # Kare görseli direkt hedef boyuta resize et
        resized_image = cv2.resize(image, crop_size, interpolation=cv2.INTER_AREA)
        return resized_image
    elif 0.9 <= ratio <= 1.1:
        # Kareye yakın ama tam kare olmayan görseller için özel işlem
        if original_width > original_height:
            new_width = int(original_width * (2400 / original_height))
            image = cv2.resize(image, (new_width, 2400))
        else:
            new_height = int(original_height * (2400 / original_width))
            image = cv2.resize(image, (2400, new_height))
    else:
        # Kare olmayan görseller için standart işlem
        image = cv2.resize(image, target_size)

    # Kırpma işlemi (sadece kare olmayan görseller için)
    start_x = int((image.shape[1] - crop_size[0]) / 2)
    start_y = int((image.shape[0] - crop_size[1]) / 2)
    cropped_image = image[start_y:start_y + crop_size[1], start_x:start_x + crop_size[0]]
    return cropped_image

def create_video_from_images(folder_path, loop_duration, total_duration):
    output_video = os.path.join(folder_path, "preview_video.mp4")
    print(f"{BLUE}Video oluşturuluyor...{ENDC}")

    images = [img for img in glob.glob(f"{folder_path}/*.jpg")]
    images.extend([img for img in glob.glob(f"{folder_path}/*.jpeg")])
    if not images:
        print(f"{YELLOW}Klasörde uygun dosya bulunamadı.{ENDC}")
        return False

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
            processed_frame = resize_and_crop_image(frame)
            for _ in range(frames_per_image):
                if current_frame >= total_frames:
                    break
                out.write(processed_frame)
                current_frame += 1

    out.release()
    print(f"{GREEN}Video başarıyla oluşturuldu!{ENDC}")
    return True

source_folder = "/Users/macox/Etsy/Export"
target_folder = "/Users/macox/Library/CloudStorage/GoogleDrive-enes.arji@gmail.com/Drive'ım/LetsGetBohoArt"
loop_duration = 5
total_duration = 10

print(f"{HEADER}=== Lets Get Boho Art İşlemi Başlatılıyor ==={ENDC}")

create_video_from_images(source_folder, loop_duration, total_duration)

eps_files = [f for f in os.listdir(source_folder) if f.endswith('.eps')]
if eps_files:
    eps_name = os.path.splitext(eps_files[0])[0]
    formatted_eps_name = eps_name.replace('-', ' ').title()
    zip_name = eps_name
    next_number = get_next_folder_number(target_folder)
    new_folder_name = f"{next_number} - {formatted_eps_name}"

    print(f"{BLUE}Dosyalar taşınıyor ve ZIP oluşturuluyor...{ENDC}")
    move_and_zip_files(source_folder, target_folder, new_folder_name, zip_name)
    print(f"{GREEN}Lets Get Boho Art dosya transferi işlemi tamamlandı!{ENDC}")
