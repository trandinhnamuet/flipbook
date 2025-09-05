const url = "assets/phutraco.pdf"; // PDF của bạn

pdfjsLib.getDocument(url).promise.then(function(pdf) {
  const flipbook = document.getElementById("flipbook");

  let loadPage = (num) => {
    pdf.getPage(num).then(function(page) {
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {
        const div = document.createElement("div");
        div.className = "page";
        div.appendChild(canvas);
        flipbook.appendChild(div);

        // Khi load xong tất cả thì khởi tạo turn.js
        if (flipbook.childElementCount === pdf.numPages) {
          $("#flipbook").turn({
            width: 1000,
            height: 700,
            autoCenter: true,
            display: "double",   // <-- 2 trang cùng lúc
            elevation: 50,
            gradients: true
          });
        }
      });
    });
  };

  for (let i = 1; i <= pdf.numPages; i++) {
    loadPage(i);
  }
});
