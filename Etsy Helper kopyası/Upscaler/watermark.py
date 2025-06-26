from PIL import Image, ImageEnhance
import os
import subprocess

# 12xkare-preview.py dosyası mevcut değilse, bu adımı atla
print("12xkare-preview.py başlatılıyor")
transfer_script = '/Users/macox/Desktop/Etsy Helper/Upscaler/12xkare-preview.py'
if os.path.exists(transfer_script):
    try:
        subprocess.run(['python3', transfer_script])
        print("12xkare-preview.py bitti")
    except Exception as e:
        print(f"Uyarı: {transfer_script} çalıştırılırken hata oluştu: {e}")
else:
    print(f"Uyarı: {transfer_script} dosyası bulunamadı, bu adım atlanıyor.")

def add_watermark(input_image_path, output_image_path, watermark_image_path):
    print(f"add_watermark: {input_image_path} -> {output_image_path} using {watermark_image_path}")
    try:
        base_image = Image.open(input_image_path).convert("RGBA")
        watermark = Image.open(watermark_image_path).convert("RGBA")
    except Exception as e:
        print(f"HATA: {input_image_path} veya watermark açılırken hata: {e}")
        raise
    # Filigranın boyutunu ayarla ve ana resmin ortasına yerleştir
    base_width, base_height = base_image.size
    watermark_width, watermark_height = watermark.size
    scale = min(base_width / watermark_width, base_height / watermark_height)
    new_size = (int(watermark_width * scale), int(watermark_height * scale))
    watermark = watermark.resize(new_size, Image.LANCZOS)

    position = ((base_width - new_size[0]) // 2, (base_height - new_size[1]) // 2)
    watermark = reduce_opacity(watermark, 0.12)
    base_image.paste(watermark, position, watermark)

    # Şeffaflık varsa, arka planı beyaz yap
    if base_image.mode in ("RGBA", "LA"):
        bg = Image.new("RGB", base_image.size, (255, 255, 255))
        bg.paste(base_image, mask=base_image.split()[3])  # alpha channel
        result = bg
    else:
        result = base_image.convert('RGB')

    # JPEG olarak kaydet ve yeniden boyutlandır
    output_image_path_jpg = os.path.splitext(output_image_path)[0] + '.jpg'
    result.save(output_image_path_jpg, 'JPEG')

    resized_image = Image.open(output_image_path_jpg)
    resized_image = resized_image.resize((2000, 2000), Image.LANCZOS)
    resized_image.save(output_image_path_jpg)

def reduce_opacity(im, opacity):
    # Filigranın opaklığını ayarla
    assert 0 <= opacity <= 1, "Opacity must be between 0 and 1."
    if im.mode != 'RGBA':
        im = im.convert('RGBA')
    else:
        im = im.copy()
    alpha = im.split()[3]
    alpha = ImageEnhance.Brightness(alpha).enhance(opacity)
    im.putalpha(alpha)
    return im

def process_directory(directory):
    # Gerekli klasörleri oluştur ve dosyaları işle
    print("process_directory başlatılıyor")
    watermark_dir = os.path.join(directory, 'W1')
    watermark_path = os.path.join(watermark_dir, 'watermark.png')
    output_dir = os.path.join(directory, 'WATERMARK')

    if not os.path.exists(watermark_dir):
        os.makedirs(watermark_dir)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    processed_files = []
    for filename in os.listdir(directory):
        print(f"Processing file: {filename}")
        # JPG, JPEG ve PNG dosyalarını işle
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')) and filename != 'watermark.png':
            file_path = os.path.join(directory, filename)
            # PNG ise arka planı beyaz yaparak JPG'e çevir
            if filename.lower().endswith('.png'):
                from PIL import Image
                try:
                    with Image.open(file_path) as im:
                        if im.mode in ('RGBA', 'LA'):
                            bg = Image.new('RGB', im.size, (255, 255, 255))
                            bg.paste(im, mask=im.split()[-1])
                            im = bg
                        else:
                            im = im.convert('RGB')
                        temp_jpg_path = os.path.splitext(file_path)[0] + '_temp.jpg'
                        im.save(temp_jpg_path, 'JPEG')
                        add_watermark(temp_jpg_path, temp_jpg_path, watermark_path)
                        processed_files.append(temp_jpg_path)
                except Exception as e:
                    print(f"HATA: {file_path} PNG işlenirken hata: {e}")
            else:
                output_filename = os.path.splitext(filename)[0] + '.jpg'
                output_path = os.path.join(output_dir, output_filename)
                try:
                    add_watermark(file_path, output_path, watermark_path)
                    processed_files.append(output_path)
                except Exception as e:
                    print(f"HATA: {file_path} JPG/JPEG işlenirken hata: {e}")

    # Dosyaları yeniden adlandır
    for i, file_path in enumerate(sorted(processed_files), start=1):
        new_name = f"Preview-{i:02}.jpg"
        new_path = os.path.join(output_dir, new_name)
        if os.path.exists(file_path):
            os.rename(file_path, new_path)
    print("process_directory bitti")

# Ana işlemleri başlat
upscaler_directory = '/Users/macox/Desktop/Etsy Helper/Upscaler'
print("process_directory başlatılıyor")
process_directory(upscaler_directory)
print("process_directory bitti")

# Diğer scriptleri çalıştır
print("image_upscaler.py başlatılıyor")
upscaler_script = '/Users/macox/Desktop/Etsy Helper/Upscaler/image_upscaler.py'
subprocess.run(['python3', upscaler_script])
print("image_upscaler.py bitti")

print("transfer.py başlatılıyor")
transfer_script = '/Users/macox/Desktop/Etsy Helper/Upscaler/transfer.py'
subprocess.run(['python3', transfer_script])
print("transfer.py bitti")

mp4_script_path = '/Users/macox/Desktop/Etsy Helper/Upscaler/mp4.py'
print("mp4.py başlatılıyor")
subprocess.run(['python3', mp4_script_path])
print("mp4.py bitti")

print("Thistle Cliparts Watermark oluşturma, yeniden adlandırma, yükseltme ve transfer işlemleri tamamlandı.")
