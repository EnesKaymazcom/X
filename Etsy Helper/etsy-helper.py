import sys
import queue  # queue modülünü içe aktar
import subprocess
import threading
import pyperclip
from PyQt5.QtCore import pyqtSignal
from PyQt5 import QtWidgets, QtGui, QtCore
from PyQt5.QtWidgets import QApplication, QLabel, QLineEdit, QPushButton, QTextEdit

class EtsyHelperApp(QtWidgets.QMainWindow):
    # Define the signal
    update_status_signal = pyqtSignal(str)

    def __init__(self):
        super().__init__()
        self.script_queue = queue.Queue()
        self.init_ui()
        # Connect the signal to the slot
        self.update_status_signal.connect(self.update_status)

    def init_ui(self):
        self.setWindowTitle("Etsy Helper")
        self.setGeometry(100, 100, 800, 600)
        self.setFixedSize(800, 600)
        
        self.load_logo()
        self.setup_labels()
        self.setup_entry()
        self.setup_status_label()
        self.setup_buttons()    
        self.load_stylesheet()  # Stil bilgilerini yükleyen metod çağrılıyor

    def load_stylesheet(self):
        with open("/Users/macox/Desktop/Etsy Helper/style.qss", "r") as f:
            self.setStyleSheet(f.read())

    def load_logo(self):
        logo = QtGui.QPixmap("/Users/macox/Desktop/Etsy Helper/logo.png").scaled(200, 200, QtCore.Qt.KeepAspectRatio)
        logo_label = QtWidgets.QLabel(self)
        logo_label.setPixmap(logo)
        logo_label.setGeometry(300, 20, 200, 200)

    def setup_labels(self):
        self.title_label = QtWidgets.QLabel("Etsy Product Title", self)
        self.title_label.setGeometry(150, 240, 200, 20)

    def setup_entry(self):
        self.entry = QtWidgets.QLineEdit(self)
        self.entry.setPlaceholderText("Input Text")
        self.entry.setGeometry(150, 270, 500, 30)

    def setup_status_label(self):
        self.status_label = QtWidgets.QTextEdit(self)
        self.status_label.setReadOnly(True)
        self.status_label.setGeometry(150, 550, 500, 100)

    def setup_buttons(self):
        button_width = 160
        button_height = 30
        spacing = 10  # Butonlar arası boşluk
        vertical_spacing = 20  # Dikey boşluk
        total_width = 3 * button_width + 4 * spacing
        start_x = (self.width() - total_width) // 2  # Butonları merkezlemek için başlangıç x koordinatı
        start_x += 10  # Butonları 10px sağa al

        # SUBMIT Button
        self.submit_button = QtWidgets.QPushButton("SUBMIT", self)
        self.submit_button.setGeometry(start_x, 310, button_width, 40)
        self.submit_button.clicked.connect(self.submit_action)

         # COPY Button
        self.copy_button = QtWidgets.QPushButton("COPY", self)
        self.copy_button.setGeometry(start_x + button_width + spacing, 310, button_width, 40)
        self.copy_button.clicked.connect(self.copy_to_clipboard)

        # CLEAR Button
        self.clear_button = QtWidgets.QPushButton("CLEAR", self)
        self.clear_button.setGeometry(start_x + 2 * (button_width + spacing), 310, button_width, 40)
        self.clear_button.clicked.connect(self.clear_action)

        self.nesvg_button = QtWidgets.QPushButton("NESVG", self)
        self.nesvg_button.setGeometry(150, 350, 240, 40)
        self.nesvg_button.clicked.connect(lambda: self.add_script_to_queue("/Users/macox/Desktop/Etsy Helper/Upscaler/export_nesvg.py"))

        self.nesvgpng_button = QtWidgets.QPushButton("NESVG PNG", self)
        self.nesvgpng_button.setGeometry(410, 350, 240, 40)
        self.nesvgpng_button.clicked.connect(lambda: self.add_script_to_queue("/Users/macox/Desktop/Etsy Helper/Upscaler/export_nesvg_png.py"))

        self.letsgetboho_button = QtWidgets.QPushButton("LETS GET BOHO", self)
        self.letsgetboho_button.setGeometry(150, 390, 240, 40)
        self.letsgetboho_button.clicked.connect(lambda: self.add_script_to_queue("/Users/macox/Desktop/Etsy Helper/Upscaler/export-lets-boho.py")) 

        self.letsgetbohopng_button = QtWidgets.QPushButton("LETS GET PNG", self)
        self.letsgetbohopng_button.setGeometry(410, 390, 240, 40)
        self.letsgetbohopng_button.clicked.connect(lambda: self.add_script_to_queue("/Users/macox/Desktop/Etsy Helper/Upscaler/export-lets-boho-png.py"))

        self.thistlecliparts_button = QtWidgets.QPushButton("THISTLE CLIPARTS", self)
        self.thistlecliparts_button.setGeometry(150, 430, 240, 40)
        self.thistlecliparts_button.clicked.connect(lambda: self.add_script_to_queue("/Users/macox/Desktop/Etsy Helper/Upscaler/thistle_clipart.py"))

        self.designbundles_button = QtWidgets.QPushButton("DESIGNBUNDLES", self)
        self.designbundles_button.setGeometry(410, 430, 240, 40)
        self.designbundles_button.clicked.connect(lambda: self.add_script_to_queue("/Users/macox/Desktop/Etsy Helper/Upscaler/designbundlescrop.py"))

    def submit_action(self):
        title_cased = self.entry.text().title()
        self.update_status(title_cased)
        
    def copy_to_clipboard(self):
        text_to_copy = self.status_label.toPlainText()
        pyperclip.copy(text_to_copy)
        self.update_status("Text copied to clipboard.")    

    def clear_action(self):
        self.entry.clear()
        self.update_status("")

    def update_status(self, message):
        self.status_label.setText(message)

    def add_script_to_queue(self, script_path):
        if self.script_queue.empty():
            self.script_queue.put(script_path)
            self.start_thread(self.run_script)

    def start_thread(self, target):
        thread = threading.Thread(target=target)
        thread.daemon = True
        thread.start()

    def run_script(self):
        while not self.script_queue.empty():
            script_path = self.script_queue.get()
            try:
               subprocess.run(["python3", script_path], check=True)
               self.update_status_signal.emit(f"Script {script_path} completed successfully.")
            except subprocess.CalledProcessError as e:
               self.update_status_signal.emit(f"Error running script {script_path}: {e}")

if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    mainWin = EtsyHelperApp()
    mainWin.show()
    sys.exit(app.exec_())
