const url = "assets/phutraco.pdf"; // file PDF bạn muốn show

pdfjsLib.getDocument(url).promise.then(function(pdf) {
  let pages = [];

  // Lấy tất cả các trang PDF -> render ra <canvas>
  for (let i = 1; i <= pdf.numPages; i++) {
    pdf.getPage(i).then(function(page) {
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {
        // thêm canvas vào flipbook
        const pageDiv = document.createElement("div");
        pageDiv.appendChild(canvas);
        document.getElementById("flipbook").appendChild(pageDiv);

        // Khi load hết thì tạo flipbook
        if (i === pdf.numPages) {
          $("#flipbook").turn({
            width: 800,
            height: 600,
            autoCenter: true
          });
        }
      });
    });
  }
});
