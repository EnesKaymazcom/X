import os
import shutil
import subprocess

def video_boyutunu_düşür(src_path, dst_path):
    try:
        subprocess.run(['ffmpeg', '-i', src_path, '-vf', 'scale=2000:2000', '-c:a', 'copy', dst_path], check=True)
    except Exception as e:
        print(f"HATA: {src_path} ffmpeg ile boyutlandırılırken hata: {e}")

def mp4_dosyalarını_taşı_ve_boyutunu_düşür(dst_dir):
    for root, dirs, files in os.walk(dst_dir):
        if 'Upscaled' in dirs:
            upscaled_dir = os.path.join(root, 'Upscaled')
            watermark_dir = os.path.join(root, 'WATERMARK')

            if not os.path.exists(watermark_dir):
                os.makedirs(watermark_dir)

            for filename in os.listdir(upscaled_dir):
                if filename.lower().endswith('.mp4'):
                    src_path = os.path.join(upscaled_dir, filename)
                    temp_path = os.path.join(upscaled_dir, 'temp_' + filename)
                    dst_path = os.path.join(watermark_dir, filename)
                    try:
                    video_boyutunu_düşür(src_path, temp_path)
                    shutil.move(temp_path, dst_path)
                    os.remove(src_path)  # Orijinal MP4 dosyasını sil
                    except Exception as e:
                        print(f"HATA: {filename} mp4 işlenirken hata: {e}")

hedef_klasör = '/Users/macox/Library/CloudStorage/GoogleDrive-enes.arji@gmail.com/Drive\'ım/ThistleClipart/Clip Arts'
mp4_dosyalarını_taşı_ve_boyutunu_düşür(hedef_klasör)
