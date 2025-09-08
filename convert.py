import os
from pdf2image import convert_from_path

# Tạo thư mục "ICS" nếu chưa có
output_folder = "ICS"
os.makedirs(output_folder, exist_ok=True)

# Chuyển PDF thành ảnh (dpi = 300 để in ấn rõ nét)
pages = convert_from_path("ICS.pdf", dpi=300)

# Lưu từng trang vào thư mục ICS
for i, page in enumerate(pages):
    filename = os.path.join(output_folder, f"page_{i+1}.jpg")
    page.save(filename, "JPEG")

print(f"Đã lưu {len(pages)} trang vào thư mục {output_folder}")
