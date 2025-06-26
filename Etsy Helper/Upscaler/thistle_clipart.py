from PIL import Image, ImageDraw, ImageFont
import os

# 1. Ana klasördeki ilk 12 PNG'yi sıralı şekilde yeniden adlandır
png_files = [f for f in os.listdir('/Users/macox/Desktop/Etsy Helper/Upscaler') if f.lower().endswith('.png')]
png_files = sorted(png_files)[:12]
for idx, filename in enumerate(png_files, 1):
    old_path = os.path.join('/Users/macox/Desktop/Etsy Helper/Upscaler', filename)
    new_name = f"{idx:02}.png"
    new_path = os.path.join('/Users/macox/Desktop/Etsy Helper/Upscaler', new_name)
    if old_path != new_path:
        os.rename(old_path, new_path)

# Görsellerin bulunduğu dosya yolu.
directory = '/Users/macox/Desktop/Etsy Helper/Upscaler'

# Yeni bir 2048x2048'lik boş bir resim oluştur - BEYAZ arka plan için RGB kullan
new_im = Image.new('RGB', (2048, 2048), (255, 255, 255))

# Klasördeki tüm uygun dosyaları bul ve listele.
image_files = [os.path.join(directory, f) for f in os.listdir(directory) if f.endswith(('.jpg', '.jpeg', '.png'))]

# Dosya listesinden ilk 12 görseli al.
image_files = image_files[:12]

# Görüntüleri yükle ve RGB'ye dönüştür.
images = []
for img in image_files:
    try:
        with Image.open(img) as opened_img:
            images.append(opened_img.convert('RGB'))
    except Exception as e:
        print(f"Bu dosya atlandı: {img}, Hata: {e}")

# Görüntüleri yeni resmin içine 4x3 düzende yerleştir.
x_offset = 0
y_offset = 50  # Üst kısmına 50 piksellik beyaz arkaplan ekleyin.
for i, im in enumerate(images):
    im = im.resize((512, 512), Image.LANCZOS)
    new_im.paste(im, (x_offset, y_offset))
    x_offset += 512
    if (i + 1) % 4 == 0:
        x_offset = 0
        y_offset += 512

# Alt bölge için bir boşluk bırak.
bottom_section_height = 400
bottom_section = Image.new('RGB', (2048, bottom_section_height), (255, 255, 255))
new_im.paste(bottom_section, (0, 2048 - bottom_section_height))

# Alt bölgeye yazı yaz.
draw = ImageDraw.Draw(new_im)
font_path = "/Users/macox/Library/Fonts/La Luxes Serif.otf"
font_size = 50
font = ImageFont.truetype(font_path, font_size)

# Kenarlık rengi
border_color = "black"
# Kenarlık genişliği
border_width = 1

# Tüm metinlerin yüksekliği eşit olacak şekilde ayarlanır.
text_height = max([draw.textbbox((0, 0), line, font=font)[3] for line in "WHITE\nBACKGROUND".split('\n')])

# Alt bölge yüksekliği ve metin yüksekliği hesaplamaları.
bottom_section_height = 380
vertical_padding = (bottom_section_height - text_height) // 2

# Sol sütun metnini çiz (dikey olarak ortalanır).
left_text_lines = "WHITE\nBACKGROUND".split('\n')
left_text_y = 2048 - bottom_section_height + vertical_padding
for line in left_text_lines:
    text_bbox = draw.textbbox((0, 0), line, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    line_x = 512 / 2 + 35 # Sol kenarın ortası.
    draw.text((line_x, left_text_y), line, font=font, fill="black", anchor="mm", stroke_width=border_width, stroke_fill=border_color)
    left_text_y += text_height  # Tüm metinler aynı yükseklikte olduğu için text_height kullanılır.

# Sağ sütun metnini çiz (dikey olarak ortalanır).
right_text_lines = "300 DPI\n4600x4600".split('\n')
right_text_y = 2048 - bottom_section_height + vertical_padding
for line in right_text_lines:
    text_bbox = draw.textbbox((0, 0), line, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    line_x = 2048 - 512 / 2  # Sağ kenarın ortası.
    draw.text((line_x, right_text_y), line, font=font, fill="black", anchor="mm", stroke_width=border_width, stroke_fill=border_color)
    right_text_y += text_height  # Tüm metinler aynı yükseklikte olduğu için text_height kullanılır.

# Yeni resmi PNG ve/veya JPG formatında kaydet (her ikisi de beyaz arka planlı olur)
output_path_jpg = '/Users/macox/Desktop/Etsy Helper/Upscaler/Main Preview/Main Preview.jpg'
os.makedirs(os.path.dirname(output_path_jpg), exist_ok=True)
new_im.save(output_path_jpg, format='JPEG', quality=95)

# İş akışının diğer adımlarını çağır
import subprocess
watermark_script = '/Users/macox/Desktop/Etsy Helper/Upscaler/watermark.py'
print("Watermark işlemi başlatılıyor...")
subprocess.run(['python3', watermark_script], check=True)
