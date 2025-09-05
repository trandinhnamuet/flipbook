// Flipbook functionality
class FlipbookManager {
    constructor() {
        this.imageFolder = 'phutraco/';
        this.images = [];
        this.flipbook = null;
        this.currentPage = 1;
        this.totalPages = 1;
        
        this.init();
    }
    
    async init() {
        await this.loadImages();
        this.createPages();
        this.initializeFlipbook();
        this.setupEventListeners();
    }
    
    async loadImages() {
        // Danh sách các ảnh (từ page-0001 đến page-0028 như trong thư mục)
        const imageFiles = [];
        for (let i = 1; i <= 28; i++) {
            const pageNumber = i.toString().padStart(4, '0');
            imageFiles.push(`Công ty Cổ phần Thương mại và Xây dựng Phương Đông (15)_page-${pageNumber}.jpg`);
        }
        
        // Kiểm tra và lọc các ảnh tồn tại
        this.images = [];
        for (const filename of imageFiles) {
            try {
                const response = await fetch(`${this.imageFolder}${filename}`);
                if (response.ok) {
                    this.images.push(filename);
                }
            } catch (error) {
                console.log(`Image not found: ${filename}`);
            }
        }
        
        console.log(`Loaded ${this.images.length} images`);
    }
    
    createPages() {
        const flipbookElement = document.getElementById('flipbook');
        flipbookElement.innerHTML = '';
        
        if (this.images.length === 0) {
            flipbookElement.innerHTML = '<div class="page loading">Đang tải ảnh...</div>';
            return;
        }
        
        // Trang đầu tiên - hiển thị một mình
        if (this.images.length > 0) {
            const firstPage = this.createSinglePage(this.images[0], true);
            flipbookElement.appendChild(firstPage);
        }
        
        // Các trang tiếp theo - hiển thị theo cặp
        for (let i = 1; i < this.images.length; i += 2) {
            const doublePage = this.createDoublePage(
                this.images[i] || null,
                this.images[i + 1] || null
            );
            flipbookElement.appendChild(doublePage);
        }
        
        this.totalPages = flipbookElement.children.length;
        this.updatePageCounter();
    }
    
    createSinglePage(imageSrc, isFirst = false) {
        const page = document.createElement('div');
        page.className = isFirst ? 'page first-page' : 'page';
        
        if (imageSrc) {
            const img = document.createElement('img');
            img.src = `${this.imageFolder}${imageSrc}`;
            img.alt = `Page ${imageSrc}`;
            img.onerror = () => {
                img.style.display = 'none';
                page.innerHTML = '<div style="color: #999;">Không thể tải ảnh</div>';
            };
            page.appendChild(img);
        }
        
        return page;
    }
    
    createDoublePage(leftImageSrc, rightImageSrc) {
        const page = document.createElement('div');
        page.className = 'page double-page';
        
        // Trang trái
        const leftDiv = document.createElement('div');
        leftDiv.className = 'page-left';
        if (leftImageSrc) {
            const leftImg = document.createElement('img');
            leftImg.src = `${this.imageFolder}${leftImageSrc}`;
            leftImg.alt = `Page ${leftImageSrc}`;
            leftImg.onerror = () => {
                leftImg.style.display = 'none';
                leftDiv.innerHTML = '<div style="color: #999;">Không thể tải ảnh</div>';
            };
            leftDiv.appendChild(leftImg);
        }
        
        // Trang phải
        const rightDiv = document.createElement('div');
        rightDiv.className = 'page-right';
        if (rightImageSrc) {
            const rightImg = document.createElement('img');
            rightImg.src = `${this.imageFolder}${rightImageSrc}`;
            rightImg.alt = `Page ${rightImageSrc}`;
            rightImg.onerror = () => {
                rightImg.style.display = 'none';
                rightDiv.innerHTML = '<div style="color: #999;">Không thể tải ảnh</div>';
            };
            rightDiv.appendChild(rightImg);
        }
        
        page.appendChild(leftDiv);
        page.appendChild(rightDiv);
        
        return page;
    }
    
    initializeFlipbook() {
        const flipbookElement = document.getElementById('flipbook');
        
        // Kiểm tra nếu Turn.js đã được tải
        if (typeof $ === 'undefined' || typeof $.fn.turn === 'undefined') {
            console.error('Turn.js not loaded');
            return;
        }
        
        $(flipbookElement).turn({
            width: 800,
            height: 600,
            autoCenter: true,
            acceleration: true,
            gradients: true,
            elevation: 50,
            duration: 1000,
            pages: this.totalPages,
            when: {
                turning: (event, page, view) => {
                    this.currentPage = page;
                    this.updatePageCounter();
                    this.updateNavigationButtons();
                },
                turned: (event, page, view) => {
                    this.currentPage = page;
                    this.updatePageCounter();
                    this.updateNavigationButtons();
                }
            }
        });
        
        this.flipbook = $(flipbookElement);
        this.updateNavigationButtons();
    }
    
    updatePageCounter() {
        document.getElementById('currentPage').textContent = this.currentPage;
        document.getElementById('totalPages').textContent = this.totalPages;
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= this.totalPages;
    }
    
    next() {
        if (this.flipbook && this.currentPage < this.totalPages) {
            this.flipbook.turn('next');
        }
    }
    
    previous() {
        if (this.flipbook && this.currentPage > 1) {
            this.flipbook.turn('previous');
        }
    }
    
    goToPage(page) {
        if (this.flipbook && page >= 1 && page <= this.totalPages) {
            this.flipbook.turn('page', page);
        }
    }
    
    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.previous();
                    break;
                case 'ArrowRight':
                    this.next();
                    break;
                case 'Home':
                    this.goToPage(1);
                    break;
                case 'End':
                    this.goToPage(this.totalPages);
                    break;
            }
        });
        
        // Touch/swipe support for mobile
        let startX = 0;
        let endX = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        const handleSwipe = () => {
            const threshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    // Swipe left - next page
                    this.next();
                } else {
                    // Swipe right - previous page
                    this.previous();
                }
            }
        };
        
        this.handleSwipe = handleSwipe;
    }
}

// Khởi tạo flipbook khi trang đã tải xong
let flipbook;

// Đợi jQuery và Turn.js tải xong
function initializeWhenReady() {
    if (typeof $ !== 'undefined' && typeof $.fn.turn !== 'undefined') {
        flipbook = new FlipbookManager();
    } else {
        setTimeout(initializeWhenReady, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeWhenReady();
});

// Expose functions to global scope for button onclick
window.flipbook = {
    next: () => flipbook?.next(),
    previous: () => flipbook?.previous(),
    goToPage: (page) => flipbook?.goToPage(page)
};