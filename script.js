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
        
        console.log('Initializing flipbook with', this.totalPages, 'pages');
        
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
            duration: 800,
            pages: this.totalPages,
            display: 'double',
            turnCorners: 'bl,br,tl,tr',
            when: {
                turning: (event, page, view) => {
                    console.log('Turning to page:', page);
                    this.currentPage = page;
                    this.updatePageCounter();
                    this.updateNavigationButtons();
                },
                turned: (event, page, view) => {
                    console.log('Turned to page:', page);
                    this.currentPage = page;
                    this.updatePageCounter();
                    this.updateNavigationButtons();
                },
                start: (event, pageObject, corner) => {
                    console.log('Drag started on corner:', corner);
                },
                end: (event, pageObject, corner) => {
                    console.log('Drag ended on corner:', corner);
                },
                pressed: (event, pageObject, corner) => {
                    console.log('Page pressed at corner:', corner);
                },
                released: (event, pageObject, corner) => {
                    console.log('Page released at corner:', corner);
                }
            }
        });
        
        this.flipbook = $(flipbookElement);
        this.updateNavigationButtons();
        
        // Thêm debug events cho kéo thả
        this.addDebugEvents();
        
        // Đảm bảo Turn.js đã được khởi tạo hoàn toàn
        setTimeout(() => {
            console.log('Turn.js initialized successfully');
            // Test basic Turn.js functionality
            try {
                console.log('Current page:', this.flipbook.turn('page'));
                console.log('Total pages:', this.flipbook.turn('pages'));
                console.log('Turn.js is working properly');
            } catch(e) {
                console.log('Turn.js basic functions not working:', e.message);
            }
        }, 100);
        
        // Xử lý thay đổi kích thước màn hình
            // Luôn chạy handleResize một lần khi khởi tạo
            this.handleResize();
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
    
    addDebugEvents() {
        const flipbookElement = document.getElementById('flipbook');
        
        // Debug mouse events
        flipbookElement.addEventListener('mousedown', (e) => {
            console.log('Mouse down on flipbook at:', e.clientX, e.clientY);
            console.log('Target element:', e.target);
            
            // Check if we're near a corner
            const rect = flipbookElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const width = rect.width;
            const height = rect.height;
            
            console.log('Relative position:', x, y, 'Size:', width, height);
            
            // Check corners (mở rộng vùng corner để chiếm gần toàn bộ trang)
            const cornerSize = Math.min(width * 0.75, height * 0.75); // 45% kích thước trang
            let corner = null;
            
            if (x <= cornerSize && y <= cornerSize) corner = 'tl';
            else if (x >= width - cornerSize && y <= cornerSize) corner = 'tr';
            else if (x <= cornerSize && y >= height - cornerSize) corner = 'bl';
            else if (x >= width - cornerSize && y >= height - cornerSize) corner = 'br';
            
            if (corner) {
                console.log('Detected corner:', corner);
                // Manually trigger page turn based on corner
                setTimeout(() => {
                    if (corner === 'br' || corner === 'tr') {
                        console.log('Triggering next page from corner:', corner);
                        this.next();
                    } else if (corner === 'bl' || corner === 'tl') {
                        console.log('Triggering previous page from corner:', corner);
                        this.previous();
                    }
                }, 100);
            } else {
                console.log('Not in any corner area');
                console.log('Corner size:', cornerSize);
                console.log('Corner areas: TL(0-' + cornerSize + ',0-' + cornerSize + '), TR(' + (width-cornerSize) + '-' + width + ',0-' + cornerSize + '), BL(0-' + cornerSize + ',' + (height-cornerSize) + '-' + height + '), BR(' + (width-cornerSize) + '-' + width + ',' + (height-cornerSize) + '-' + height + ')');
            }
        });
        
        flipbookElement.addEventListener('mouseup', (e) => {
            console.log('Mouse up on flipbook at:', e.clientX, e.clientY);
        });
        
        flipbookElement.addEventListener('mousemove', (e) => {
            // Only log when mouse is pressed
            if (e.buttons === 1) {
                console.log('Mouse drag on flipbook at:', e.clientX, e.clientY);
            }
        });
        
        flipbookElement.addEventListener('click', (e) => {
            console.log('Click on flipbook at:', e.clientX, e.clientY);
            console.log('Clicked element:', e.target);
        });
        
        // Debug turn.js specific events
        $(flipbookElement).on('pressed', (event, pageObject, corner) => {
            console.log('Turn.js pressed event - corner:', corner);
        });
        
        $(flipbookElement).on('released', (event, pageObject, corner) => {
            console.log('Turn.js released event - corner:', corner);
        });
        
        $(flipbookElement).on('missing', (event, pages) => {
            console.log('Turn.js missing pages:', pages);
        });
        
        // Try to directly handle page clicks
        setTimeout(() => {
            $('.turn-page').on('mousedown', (e) => {
                console.log('Direct page mousedown detected');
                const page = $(e.currentTarget);
                const pageNumber = page.attr('class').match(/p(\d+)/);
                if (pageNumber) {
                    console.log('Clicked on page:', pageNumber[1]);
                }
            });
        }, 1000);
        
        // Test turn.js methods
        setTimeout(() => {
            try {
                console.log('Testing Turn.js methods after initialization...');
                if (this.flipbook && this.flipbook.turn) {
                    console.log('Turn.js methods available');
                } else {
                    console.log('Turn.js methods not available');
                }
            } catch(e) {
                console.log('Error testing Turn.js:', e.message);
            }
        }, 200);
    }
    
    handleResize() {
        if (!this.flipbook) return;
        
        const screenWidth = window.innerWidth;
        let flipbookWidth, flipbookHeight;
        
        if (screenWidth >= 1300) {
            console.log("First")
            flipbookWidth = 1271;
            flipbookHeight = 900;
        } else if (screenWidth >= 1100) {
            console.log("Second")
            flipbookWidth = 1000;
            flipbookHeight = 707;
        } else if (screenWidth >= 900) {
            console.log("Third")
            flipbookWidth = 800;
            flipbookHeight = 566;
        } else if (screenWidth >= 700) {
            console.log("Fourth")
            flipbookWidth = 600;
            flipbookHeight = 450;
        } else {
            console.log("Fifth")
            flipbookWidth = 400;
            flipbookHeight = 283;
        }
        
        // Cập nhật kích thước flipbook
        this.flipbook.turn('size', flipbookWidth, flipbookHeight);
    }
    
    next() {
        if (this.flipbook && this.currentPage < this.totalPages) {
            console.log('Manual next page from', this.currentPage, 'to', this.currentPage + 1);
            this.flipbook.turn('next');
        }
    }

    previous() {
        if (this.flipbook && this.currentPage > 1) {
            console.log('Manual previous page from', this.currentPage, 'to', this.currentPage - 1);
            this.flipbook.turn('previous');
        }
    }

    goToPage(page) {
        if (this.flipbook && page >= 1 && page <= this.totalPages) {
            console.log('Manual go to page:', page);
            this.flipbook.turn('page', page);
        }
    }
    
    // Test method for manual corner triggering
    testCornerDrag(corner) {
        console.log('Testing corner drag:', corner);
        if (this.flipbook) {
            try {
                // Try different methods to trigger page turn
                if (corner === 'br' || corner === 'tr') {
                    console.log('Trying to go to next page');
                    this.flipbook.turn('next');
                } else if (corner === 'bl' || corner === 'tl') {
                    console.log('Trying to go to previous page');
                    this.flipbook.turn('previous');
                }
            } catch(e) {
                console.log('Error in testCornerDrag:', e.message);
            }
        } else {
            console.log('Flipbook not initialized');
        }
    }
    
    // Method to enable/disable corners
    enableCorners(enabled = true) {
        if (this.flipbook) {
            try {
                console.log('Attempting to', enabled ? 'enable' : 'disable', 'corners');
                // Try different approaches to enable corners
                const cornerValue = enabled ? 'bl,br,tl,tr' : '';
                
                // Method 1: Set turnCorners option
                this.flipbook.turn('turnCorners', cornerValue);
                
                // Method 2: Force re-initialization if needed
                if (enabled) {
                    // Re-bind turn.js events
                    this.flipbook.turn('destroy');
                    setTimeout(() => {
                        this.initializeTurnJs();
                    }, 100);
                }
                
                console.log('Corners', enabled ? 'enabled' : 'disabled');
            } catch(e) {
                console.log('Error setting corners:', e.message);
            }
        }
    }
    
    // Separate method to initialize Turn.js
    initializeTurnJs() {
        const flipbookElement = document.getElementById('flipbook');
        const screenWidth = window.innerWidth;
        let flipbookWidth, flipbookHeight;
        
        if (screenWidth >= 1300) {
            flipbookWidth = 1400;
            flipbookHeight = 1000;
        } else {
            flipbookWidth = 1000;
            flipbookHeight = 667;
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
                    console.log('Turning to page:', page);
                    this.currentPage = page;
                    this.updatePageCounter();
                    this.updateNavigationButtons();
                },
                turned: (event, page, view) => {
                    console.log('Turned to page:', page);
                    this.currentPage = page;
                    this.updatePageCounter();
                    this.updateNavigationButtons();
                },
                start: (event, pageObject, corner) => {
                    console.log('Drag started on corner:', corner);
                },
                end: (event, pageObject, corner) => {
                    console.log('Drag ended on corner:', corner);
                },
                pressed: (event, pageObject, corner) => {
                    console.log('Page pressed at corner:', corner);
                },
                released: (event, pageObject, corner) => {
                    console.log('Page released at corner:', corner);
                }
            }
        });
        
        this.flipbook = $(flipbookElement);
    }    setupEventListeners() {
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
        
        // Expose functions sau khi flipbook được khởi tạo
        setTimeout(() => {
            window.flipbook = {
                next: () => flipbook?.next(),
                previous: () => flipbook?.previous(),
                goToPage: (page) => flipbook?.goToPage(page),
                testCorner: (corner) => flipbook?.testCornerDrag(corner),
                enableCorners: (enabled) => flipbook?.enableCorners(enabled),
                getFlipbook: () => flipbook?.flipbook,
                instance: flipbook  // Expose the entire instance for debugging
            };
            console.log('Global flipbook methods exposed');
            console.log('Available methods:', Object.keys(window.flipbook));
        }, 500);
    } else {
        setTimeout(initializeWhenReady, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeWhenReady();
});