import os
import fitz  # PyMuPDF
from PIL import Image

output_folder = "ICS"
os.makedirs(output_folder, exist_ok=True)

pdf_path = "ICS.pdf"
doc = fitz.open(pdf_path)

for i in range(len(doc)):
    page = doc.load_page(i)
    pix = page.get_pixmap(dpi=300)
    img_path = os.path.join(output_folder, f"page_{i+1}.jpg")
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    img.save(img_path, "JPEG")

print(f"Đã lưu {len(doc)} trang vào thư mục {output_folder}")