import os
from PIL import Image

# Klasörler
upscaled_dir = '/Users/macox/Desktop/Etsy Helper/Upscaler/Upscaled'
preview_dir = '/Users/macox/Desktop/Etsy Helper/Upscaler/Preview'
os.makedirs(preview_dir, exist_ok=True)

# İlk 12 PNG dosyasını bul
png_files = [f for f in os.listdir(upscaled_dir) if f.lower().endswith('.png')]
png_files = sorted(png_files)[:12]

# Hedef boyut (örnek: 3200x3200)
target_size = (3200, 3200)

for idx, filename in enumerate(png_files, 1):
    input_path = os.path.join(upscaled_dir, filename)
    output_path = os.path.join(preview_dir, f'Preview-{idx:02}.jpg')
    with Image.open(input_path) as im:
        # Transparan arka planı beyaz yap
        if im.mode in ('RGBA', 'LA'):
            bg = Image.new('RGB', im.size, (255, 255, 255))
            bg.paste(im, mask=im.split()[-1])
            im = bg
        else:
            im = im.convert('RGB')
        # Büyüt
        im = im.resize(target_size, Image.LANCZOS)
        # JPG olarak kaydet
        im.save(output_path, 'JPEG', quality=95) 