import binascii

dosya_yolu = '/Volumes/ETSY/rcc_update/container.iso.bin'

with open(dosya_yolu, 'rb') as dosya:
    veri = dosya.read()

hex_veri = binascii.hexlify(veri)
print(hex_veri)