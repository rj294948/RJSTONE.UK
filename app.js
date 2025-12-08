// ==============================================
// IRYA STONE - Main JavaScript Application
// ==============================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('IRYA STONE - Application loaded');
    
    // Initialize all components
    initMobileMenu();
    initHeroSlider();
    initImageHoverEffects();
    initCartFunctionality();
    initProductClicks();
    
    // Load products from Firebase
    loadFeaturedProducts();
});

// ==============================================
// Mobile Menu Functionality
// ==============================================
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                navMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
        
        // Close menu on link click
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
}

// ==============================================
// Hero Slider Functionality
// ==============================================
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    let slideInterval;
    
    function showSlide(index) {
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Update current slide index
        currentSlide = (index + slides.length) % slides.length;
        
        // Add active class to current slide and dot
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        // Restart auto slide timer
        resetSlideTimer();
    }
    
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        showSlide(currentSlide - 1);
    }
    
    function resetSlideTimer() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    // Event listeners for navigation
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    // Event listeners for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            showSlide(index);
        });
    });
    
    // Initialize auto slide
    resetSlideTimer();
    
    // Pause auto slide on hover
    const heroBanner = document.querySelector('.hero-banner');
    if (heroBanner) {
        heroBanner.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        heroBanner.addEventListener('mouseleave', () => {
            resetSlideTimer();
        });
    }
}

// ==============================================
// Image Hover Effects
// ==============================================
function initImageHoverEffects() {
    // Triangle image hover effects
    const triangleImages = document.querySelectorAll('.image-triangle img');
    
    triangleImages.forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1.05)';
        });
    });
    
    // Regular image hover effects
    const categoryImages = document.querySelectorAll('.category-image img');
    
    categoryImages.forEach(img => {
        if (!img.closest('.triangle-layout')) {
            img.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1)';
            });
            
            img.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1.05)';
            });
        }
    });
}

// ==============================================
// Cart Functionality
// ==============================================
function initCartFunctionality() {
    // Load cart count from localStorage or initialize
    function loadCartCount() {
        const cartCount = localStorage.getItem('iryaStoneCartCount') || '0';
        updateCartDisplay(cartCount);
        return parseInt(cartCount);
    }
    
    // Update cart display
    function updateCartDisplay(count) {
        const cartElements = document.querySelectorAll('.cart-count');
        cartElements.forEach(element => {
            element.textContent = count;
        });
    }
    
    // Add to cart function
    window.addToCart = async function(productId) {
        try {
            // Check if user is logged in
            const user = firebaseApp?.auth?.currentUser;
            
            if (!user) {
                // Store product in session for later
                sessionStorage.setItem('pendingCartProduct', productId);
                window.location.href = 'login.html?redirect=cart';
                return;
            }
            
            // Add to cart logic here
            console.log('Adding product to cart:', productId);
            
            // Update cart count
            const currentCount = loadCartCount();
            const newCount = currentCount + 1;
            localStorage.setItem('iryaStoneCartCount', newCount.toString());
            updateCartDisplay(newCount);
            
            // Show success message
            showNotification('Product added to cart!', 'success');
            
            // If we're on a product page, you might want to update the cart icon
            const cartButtons = document.querySelectorAll('.btn-product, .add-to-cart');
            cartButtons.forEach(btn => {
                if (btn.dataset.productId === productId) {
                    btn.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
                    btn.disabled = true;
                    setTimeout(() => {
                        btn.innerHTML = 'Add to Cart';
                        btn.disabled = false;
                    }, 2000);
                }
            });
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('Failed to add to cart', 'error');
        }
    };
    
    // Initialize cart count
    loadCartCount();
}

// ==============================================
// Product Click Handlers
// ==============================================
function initProductClicks() {
    // Product card click handlers
    document.addEventListener('click', function(e) {
        const productCard = e.target.closest('.product-card');
        if (productCard && !e.target.closest('.btn-product')) {
            const productId = productCard.dataset.productId;
            if (productId) {
                viewProduct(productId);
            }
        }
        
        // Category card click handlers
        const categoryCard = e.target.closest('.category-card');
        if (categoryCard) {
            const category = categoryCard.dataset.category;
            if (category) {
                window.location.href = `products.html?category=${category}`;
            }
        }
    });
}

// ==============================================
// Load Featured Products from Firebase
// ==============================================
async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    try {
        // Show loading state
        container.innerHTML = `
            <div class="loading-products">
                <div class="loading-spinner"></div>
                <p>Loading products...</p>
            </div>
        `;
        
        // Check if Firebase is available
        if (!window.firebaseApp || !window.firebaseApp.db) {
            throw new Error('Firebase not loaded');
        }
        
        const { db, collection, getDocs, query, where, orderBy, limit } = window.firebaseApp;
        
        // Get featured products
        const q = query(
            collection(db, "products"),
            where("featured", "==", true),
            orderBy("createdAt", "desc"),
            limit(6)
        );
        
        const querySnapshot = await getDocs(q);
        const products = [];
        
        querySnapshot.forEach((doc) => {
            const productData = doc.data();
            products.push({
                id: doc.id,
                name: productData.name || 'Stone Product',
                category: productData.category || 'Stone',
                priceGBP: productData.priceGBP || 0,
                imageUrl: productData.imageUrl || '',
                description: productData.description || ''
            });
        });
        
        // Display products
        if (products.length > 0) {
            container.innerHTML = products.map(product => `
                <div class="product-card" data-product-id="${product.id}">
                    <div class="product-image">
                        ${product.imageUrl ? 
                            `<img src="${product.imageUrl}" alt="${product.name}" loading="lazy">` : 
                            `<i class="fas fa-mountain"></i>`}
                    </div>
                    <h3>${product.name}</h3>
                    <p class="product-category">${product.category}</p>
                    <p class="product-price">£${product.priceGBP.toFixed(2)}/m²</p>
                    <button class="btn-product" onclick="addToCart('${product.id}')">
                        Add to Cart
                    </button>
                </div>
            `).join('');
        } else {
            // No products found - show fallback
            container.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <h4>No Featured Products</h4>
                    <p>Check back soon for our latest stone collections</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading products:', error);
        
        // Show fallback products
        container.innerHTML = `
            <div class="product-card">
                <div class="product-image">
                    <i class="fas fa-mountain"></i>
                </div>
                <h3>Raj Green Sandstone</h3>
                <p class="product-category">Sandstone</p>
                <p class="product-price">£28.50/m²</p>
                <button class="btn-product" onclick="addToCart('sandstone-1')">
                    Add to Cart
                </button>
            </div>
            <div class="product-card">
                <div class="product-image">
                    <i class="fas fa-layer-group"></i>
                </div>
                <h3>Kota Blue Stone</h3>
                <p class="product-category">Kota Stone</p>
                <p class="product-price">£32.75/m²</p>
                <button class="btn-product" onclick="addToCart('kota-1')">
                    Add to Cart
                </button>
            </div>
            <div class="product-card">
                <div class="product-image">
                    <i class="fas fa-gem"></i>
                </div>
                <h3>Italian Marble</h3>
                <p class="product-category">Marble</p>
                <p class="product-price">£45.99/m²</p>
                <button class="btn-product" onclick="addToCart('marble-1')">
                    Add to Cart
                </button>
            </div>
        `;
    }
}

// ==============================================
// View Product Details
// ==============================================
window.viewProduct = function(productId) {
    console.log('Viewing product:', productId);
    window.location.href = `product-detail.html?id=${productId}`;
};

// ==============================================
// Notification System
// ==============================================
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 20px;
                border-radius: 8px;
                color: white;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                z-index: 9999;
                animation: slideIn 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                font-weight: 500;
            }
            .notification.success {
                background: #10b981;
            }
            .notification.error {
                background: #ef4444;
            }
            .notification.info {
                background: #3b82f6;
            }
            .notification.warning {
                background: #f59e0b;
            }
            .notification button {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                margin-left: 10px;
                opacity: 0.8;
                transition: opacity 0.2s;
            }
            .notification button:hover {
                opacity: 1;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ==============================================
// Loading Styles (inline in HTML for now)
// ==============================================
const loadingStyles = document.createElement('style');
loadingStyles.textContent = `
    .loading-products {
        grid-column: 1 / -1;
        text-align: center;
        padding: 40px;
    }
    
    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #b8860b;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }
    
    .no-products {
        grid-column: 1 / -1;
        text-align: center;
        padding: 40px;
        color: #666;
    }
    
    .no-products i {
        font-size: 3rem;
        color: #ddd;
        margin-bottom: 20px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(loadingStyles);

// ==============================================
// Export for use in other files
// ==============================================
window.iryaStoneApp = {
    initMobileMenu,
    initHeroSlider,
    initImageHoverEffects,
    initCartFunctionality,
    loadFeaturedProducts,
    showNotification
};
