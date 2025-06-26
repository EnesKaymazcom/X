from PIL import Image, ImageDraw, ImageFont
import os

# Görsellerin bulunduğu dosya yolu.
directory = '/Users/macox/Desktop/Upscaler'

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
            images.append(opened_img.convert('RGB'))
    except Exception as e:
        print(f"Bu dosya atlandı: {img}, Hata: {e}")

# Görüntüleri yeni resmin içine 4x3 düzende yerleştir.
x_offset = 0
y_offset = 50  # Üst kısmına 50 piksellik beyaz arkaplan ekleyin.
for i, im in enumerate(images):
    im = im.resize((512, 512), Image.ANTIALIAS)
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
text_height = max([draw.textsize(line, font=font)[1] for line in "WHITE\nBACKGROUND".split('\n')])

# Alt bölge yüksekliği ve metin yüksekliği hesaplamaları.
bottom_section_height = 380
vertical_padding = (bottom_section_height - text_height) // 2

# Sol sütun metnini çiz (dikey olarak ortalanır).
left_text_lines = "WHITE\nBACKGROUND".split('\n')
left_text_y = 2048 - bottom_section_height + vertical_padding
for line in left_text_lines:
    text_size = draw.textsize(line, font=font)
    line_x = 512 / 2 + 35 # Sol kenarın ortası.
    draw.text((line_x, left_text_y), line, font=font, fill="black", anchor="mm", stroke_width=border_width, stroke_fill=border_color)
    left_text_y += text_height  # Tüm metinler aynı yükseklikte olduğu için text_height kullanılır.

# Sağ sütun metnini çiz (dikey olarak ortalanır).
right_text_lines = "300 DPI\n4600x4600".split('\n')
right_text_y = 2048 - bottom_section_height + vertical_padding
for line in right_text_lines:
    text_size = draw.textsize(line, font=font)
    line_x = 2048 - 512 / 2  # Sağ kenarın ortası.
    draw.text((line_x, right_text_y), line, font=font, fill="black", anchor="mm", stroke_width=border_width, stroke_fill=border_color)
    right_text_y += text_height  # Tüm metinler aynı yükseklikte olduğu için text_height kullanılır.

# Orta sütun metni çiz (dikey olarak ortalanır).
center_font_size = 90
center_font = ImageFont.truetype(font_path, center_font_size)
center_text = "JPEG & PNG\nCLIPART"
center_text_x = 2048 / 2 + 20 # Orta.
center_text_y = 2048 - bottom_section_height + (bottom_section_height - text_height) / 2 + 33  # 10 piksel aşağı kaydırıldı.
draw.text((center_text_x, center_text_y), center_text, font=center_font, fill="black", anchor="mm", stroke_width=border_width, stroke_fill=border_color)

# Yeni resmi göster veya kaydet.
new_im.show()
# veya
output_path = os.path.join(directory, 'Main-Preview.jpg')
new_im.save(output_path)
