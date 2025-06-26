import os
import cv2
import numpy as np
from PIL import Image

def find_first_image(directory):
    for file in os.listdir(directory):
        if file.lower().endswith(('.jpg', '.jpeg')):
            return os.path.join(directory, file)
    return None  # Eğer uygun bir dosya bulunamazsa

def resize_and_center_image(img, desired_size):
    h, w = img.shape[:2]
    sh, sw = desired_size
    aspect = w / h
    if aspect > 1:
        new_w = sw
        new_h = np.round(new_w / aspect).astype(int)
        resized_img = cv2.resize(img, (new_w, new_h))
    else:
        new_h = sh
        new_w = np.round(new_h * aspect).astype(int)
        resized_img = cv2.resize(img, (new_w, new_h))

    pad_vert = (sh - new_h) // 2
    pad_horz = (sw - new_w) // 2
    padded_img = cv2.copyMakeBorder(resized_img, pad_vert, pad_vert, pad_horz, pad_horz, cv2.BORDER_CONSTANT, value=[255,255,255])
    return padded_img

def upscale_and_sharpen_image(input_path, output_path, desired_size=(4600, 4600)):
    ext = os.path.splitext(input_path)[1].lower()
    is_png = ext == '.png'
    try:
        if is_png:
            pil_img = Image.open(input_path).convert('RGBA')
            pil_img = pil_img.resize(desired_size, Image.LANCZOS)
            pil_img.save(output_path, format='PNG', dpi=(300, 300), optimize=True, compress_level=6)
            # PNG kaydettikten sonra pngquant ile optimize et
            try:
                import subprocess
                subprocess.run([
                    'pngquant', '--quality=40-60', '--ext', '.png', '--force', output_path
                ], check=True)
            except FileNotFoundError:
                print('UYARI: pngquant yüklü değil, PNG optimizasyonu atlandı.')
            except Exception as e:
                print(f'UYARI: pngquant ile optimize edilirken hata: {e}')
        else:
            img = cv2.imread(input_path)
            if img is None:
                raise ValueError(f"Resim yüklenemedi: {input_path}")
            resized_img = resize_and_center_image(img, desired_size)
            kernel = np.array([[0, -0.5, 0], [-0.5, 3, -0.5], [0, -0.5, 0]])
            sharp_img = cv2.filter2D(resized_img, -1, kernel)
            cv2.imwrite(output_path, sharp_img)
            pil_img = Image.open(output_path)
            pil_img.save(output_path, dpi=(300, 300))
    except Exception as e:
        print(f"HATA: {input_path} upscale edilirken hata: {e}")

def upscale_images_in_directory(input_directory, output_directory):
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    counter = 1
    for filename in os.listdir(input_directory):
        if filename.lower().endswith('.png'):
            input_path = os.path.join(input_directory, filename)
            output_path = os.path.join(output_directory, f'Clipart-{str(counter).zfill(2)}.png')
            try:
                upscale_and_sharpen_image(input_path, output_path, desired_size=(4600, 4600))
            except Exception as e:
                print(f"HATA: {input_path} upscale_and_sharpen_image çağrılırken hata: {e}")
            counter += 1

def create_slideshow_video(input_directory, output_video, cover_image_directory):
    cover_image_path = find_first_image(cover_image_directory)
    if cover_image_path is None:
        raise ValueError(f"{cover_image_directory} klasöründe uygun bir kapak resmi bulunamadı.")

    cover_img = cv2.imread(cover_image_path)
    if cover_img is None:
        raise ValueError(f"Kapak resmi yüklenemedi: {cover_image_path}")

    image_files = [f for f in os.listdir(input_directory) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    target_duration = 8
    target_fps = (len(image_files) + 1) / target_duration

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_video, fourcc, target_fps, (4600, 4600))

    cover_img_resized = resize_and_center_image(cover_img, (4600, 4600))
    out.write(cover_img_resized)

    for image_file in image_files:
        img_path = os.path.join(input_directory, image_file)
        frame = cv2.imread(img_path)
        if frame is None:
            raise ValueError(f"Resim yüklenemedi: {img_path}")
        resized_frame = resize_and_center_image(frame, (4600, 4600))
        out.write(resized_frame)

    out.release()

# Yol tanımlamaları ve işlevleri çağırma
input_dir = '/Users/macox/Desktop/Etsy Helper/Upscaler'
output_dir = '/Users/macox/Desktop/Etsy Helper/Upscaler/Upscaled'
watermark_dir = '/Users/macox/Desktop/Etsy Helper/Upscaler/WATERMARK'
cover_image_directory = '/Users/macox/Desktop/Etsy Helper/Upscaler/Main Preview'
output_video = os.path.join(watermark_dir, 'output.mp4')

# Önce görselleri yükselt
upscale_images_in_directory(input_dir, output_dir)

# Sonra watermark eklenmiş görsellerden video oluştur
if os.path.exists(watermark_dir) and os.listdir(watermark_dir):
    print("Watermark eklenmiş görsellerden video oluşturuluyor...")
    create_slideshow_video(watermark_dir, output_video, cover_image_directory)
else:
    print("Watermark klasörü bulunamadı veya boş, yükseltilmiş görsellerden video oluşturuluyor...")
    create_slideshow_video(output_dir, output_video, cover_image_directory)
