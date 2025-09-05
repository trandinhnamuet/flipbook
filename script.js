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
        
        // Các trang tiếp theo - mỗi trang một ảnh
        for (let i = 1; i < this.images.length; i++) {
            const singlePage = this.createSinglePage(this.images[i], false);
            flipbookElement.appendChild(singlePage);
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
    
    initializeFlipbook() {
        const flipbookElement = document.getElementById('flipbook');
        
        // Kiểm tra nếu Turn.js đã được tải
        if (typeof $ === 'undefined' || typeof $.fn.turn === 'undefined') {
            console.error('Turn.js not loaded');
            return;
        }
        
        // Tự động điều chỉnh kích thước dựa trên màn hình
        const screenWidth = window.innerWidth;
        let flipbookWidth, flipbookHeight;
        
        if (screenWidth >= 1300) {
            flipbookWidth = 1200;
            flipbookHeight = 800;
        } else if (screenWidth >= 1100) {
            flipbookWidth = 1000;
            flipbookHeight = 667;
        } else if (screenWidth >= 900) {
            flipbookWidth = 800;
            flipbookHeight = 533;
        } else if (screenWidth >= 700) {
            flipbookWidth = 600;
            flipbookHeight = 450;
        } else {
            flipbookWidth = 400;
            flipbookHeight = 300;
        }
        
        $(flipbookElement).turn({
            width: flipbookWidth,
            height: flipbookHeight,
            autoCenter: true,
            acceleration: true,
            gradients: true,
            elevation: 50,
            duration: 1000,
            pages: this.totalPages,
            display: 'double',
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
        
        // Xử lý thay đổi kích thước màn hình
        window.addEventListener('resize', () => {
            this.handleResize();
        });
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
    
    handleResize() {
        if (!this.flipbook) return;
        
        const screenWidth = window.innerWidth;
        let flipbookWidth, flipbookHeight;
        
        if (screenWidth >= 1300) {
            flipbookWidth = 1400;
            flipbookHeight = 1000;
        } else if (screenWidth >= 1100) {
            flipbookWidth = 1000;
            flipbookHeight = 667;
        } else if (screenWidth >= 900) {
            flipbookWidth = 800;
            flipbookHeight = 533;
        } else if (screenWidth >= 700) {
            flipbookWidth = 600;
            flipbookHeight = 450;
        } else {
            flipbookWidth = 400;
            flipbookHeight = 300;
        }
        
        // Cập nhật kích thước flipbook
        this.flipbook.turn('size', flipbookWidth, flipbookHeight);
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