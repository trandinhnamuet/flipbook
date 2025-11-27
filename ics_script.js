// Flipbook for ICS folder
class ICSFlipbookManager {
    constructor() {
        this.imageFolder = 'ICS/';
        this.images = [];
        this.flipbook = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.init();
    }
    async init() {
        this.loadImages();
        this.createPages();
        this.initializeFlipbook();
        this.setupEventListeners();
    }
    loadImages() {
        // Tìm tất cả ảnh trong thư mục ICS (page_1.jpg, page_2.jpg, ...)
        for (let i = 1; i <= 32; i++) {
            this.images.push(`page_${i}.jpg`);
        }
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
        // Các trang tiếp theo
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
        if (typeof $ === 'undefined' || typeof $.fn.turn === 'undefined') {
            console.error('Turn.js not loaded');
            return;
        }
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
            duration: 800,
            pages: this.totalPages,
            display: 'double',
            turnCorners: 'bl,br,tl,tr',
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
        this.addDebugEvents();
        this.handleResize();
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    addDebugEvents() {
        const flipbookElement = document.getElementById('flipbook');
        flipbookElement.addEventListener('mousedown', (e) => {
            const rect = flipbookElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const width = rect.width;
            const height = rect.height;
            const cornerSize = Math.min(width * 0.75, height * 0.75);
            let corner = null;
            if (x <= cornerSize && y <= cornerSize) corner = 'tl';
            else if (x >= width - cornerSize && y <= cornerSize) corner = 'tr';
            else if (x <= cornerSize && y >= height - cornerSize) corner = 'bl';
            else if (x >= width - cornerSize && y >= height - cornerSize) corner = 'br';
            if (corner) {
                setTimeout(() => {
                    if (corner === 'br' || corner === 'tr') {
                        this.next();
                    } else if (corner === 'bl' || corner === 'tl') {
                        this.previous();
                    }
                }, 100);
            }
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
            flipbookWidth = 1271;
            flipbookHeight = 900;
        } else if (screenWidth >= 1100) {
            flipbookWidth = 1000;
            flipbookHeight = 707;
        } else if (screenWidth >= 900) {
            flipbookWidth = 800;
            flipbookHeight = 566;
        } else if (screenWidth >= 700) {
            flipbookWidth = 600;
            flipbookHeight = 450;
        } else {
            flipbookWidth = 400;
            flipbookHeight = 283;
        }
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
    }
}

function initializeICSFlipbookWhenReady() {
    if (typeof $ !== 'undefined' && typeof $.fn.turn !== 'undefined') {
        window.icsFlipbook = new ICSFlipbookManager();
    } else {
        setTimeout(initializeICSFlipbookWhenReady, 100);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    initializeICSFlipbookWhenReady();
});
