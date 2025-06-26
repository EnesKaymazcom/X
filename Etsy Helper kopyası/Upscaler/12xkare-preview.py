from PIL import Image, ImageDraw, ImageFont
import os
import subprocess

# Görsellerin bulunduğu dosya yolu.
directory = '/Users/macox/Desktop/Etsy Helper/Upscaler'

# Yeni bir 2048x2048'lik boş bir resim oluştur.
new_im = Image.new('RGB', (2048, 2048), "white")

# Klasördeki tüm uygun dosyaları bul ve listele.
image_files = [os.path.join(directory, f) for f in os.listdir(directory) if f.endswith(('.jpg', '.jpeg', '.png'))]

# Dosya listesinden ilk 12 görseli al.
image_files = image_files[:12]

# Görüntüleri yükle ve RGB'ye dönüştür.
images = []
for img in image_files:
    try:
        with Image.open(img) as opened_img:
            # PNG ise ve transparanlık varsa arka planı beyaz yap
            if opened_img.mode in ('RGBA', 'LA'):
                bg = Image.new('RGB', opened_img.size, (255, 255, 255))
                bg.paste(opened_img, mask=opened_img.split()[-1])
                images.append(bg)
            else:
                images.append(opened_img.convert('RGB'))
    except Exception as e:
        print(f"HATA: {img} açılırken hata: {e}")

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
bottom_section = Image.new('RGB', (2048, bottom_section_height), '#ede3db')
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

# Satır arası boşluk
line_spacing = 20

# --- Alt banttaki tüm yazı bloklarını tam ortala ---
# Sol blok
left_text_lines = "TRANSPARENT\nBACKGROUND".split('\n')
left_block_height = sum([draw.textbbox((0, 0), line, font=font)[3] - draw.textbbox((0, 0), line, font=font)[1] for line in left_text_lines]) + line_spacing * (len(left_text_lines) - 1)
left_text_x = 512 / 2 + 35
left_block_y = 2048 - bottom_section_height + (bottom_section_height - left_block_height) // 2 + 20
left_y = left_block_y
for line in left_text_lines:
    text_bbox = draw.textbbox((0, 0), line, font=font)
    text_height = text_bbox[3] - text_bbox[1]
    draw.text((left_text_x, left_y), line, font=font, fill="black", anchor="mm", stroke_width=border_width, stroke_fill=border_color)
    left_y += text_height + line_spacing

# Sağ blok
right_text_lines = "300 DPI\n4600x4600px".split('\n')
right_block_height = sum([draw.textbbox((0, 0), line, font=font)[3] - draw.textbbox((0, 0), line, font=font)[1] for line in right_text_lines]) + line_spacing * (len(right_text_lines) - 1)
right_text_x = 2048 - 512 / 2
right_block_y = 2048 - bottom_section_height + (bottom_section_height - right_block_height) // 2 + 20
right_y = right_block_y
for line in right_text_lines:
    text_bbox = draw.textbbox((0, 0), line, font=font)
    text_height = text_bbox[3] - text_bbox[1]
    draw.text((right_text_x, right_y), line, font=font, fill="black", anchor="mm", stroke_width=border_width, stroke_fill=border_color)
    right_y += text_height + line_spacing

# Orta blok (PNG\nCLIPART)
center_text_lines = ["PNG", "CLIPART"]
center_font_size_clipart = 80
center_font_clipart = ImageFont.truetype(font_path, center_font_size_clipart)
center_block_height = sum([draw.textbbox((0, 0), line, font=center_font_clipart)[3] - draw.textbbox((0, 0), line, font=center_font_clipart)[1] for line in center_text_lines]) + line_spacing * (len(center_text_lines) - 1)
center_text_x = 2048 / 2
center_block_y = 2048 - bottom_section_height + (bottom_section_height - center_block_height) // 2 + 20
center_y = center_block_y
for line in center_text_lines:
    text_bbox = draw.textbbox((0, 0), line, font=center_font_clipart)
    text_height = text_bbox[3] - text_bbox[1]
    draw.text((center_text_x, center_y), line, font=center_font_clipart, fill="black", anchor="mm", stroke_width=border_width, stroke_fill=border_color)
    center_y += text_height + line_spacing

# Yeni resmi kaydet.
output_path_jpg = '/Users/macox/Desktop/Etsy Helper/Upscaler/Main Preview/Main Preview.jpg'
os.makedirs(os.path.dirname(output_path_jpg), exist_ok=True)
new_im.save(output_path_jpg, format='JPEG', quality=95)

# Preview görseli üretildikten sonra watermark ekle
# watermark_script = '/Users/macox/Desktop/Etsy Helper/Upscaler/watermark.py'
# subprocess.run(['python3', watermark_script], check=True)
