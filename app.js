// ==============================================
// IRYA STONE - Main JavaScript (Fixed Firebase)
// ==============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('IRYA STONE - App loaded');
    
    initMobileMenu();
    loadFeaturedProducts();
    initTriangleHover();
    initScrollAnimations();
});

// Mobile Menu
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Close on click outside
        document.addEventListener('click', function(event) {
            if (!navLinks.contains(event.target) && !menuBtn.contains(event.target)) {
                navLinks.classList.remove('active');
                menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
        
        // Close on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
}

// Load Featured Products (FIXED FIREBASE QUERY)
async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    try {
        // Check if Firebase is loaded
        if (!window.firebaseApp || !window.firebaseApp.db) {
            throw new Error('Firebase not loaded');
        }
        
        const { db, collection, getDocs, query, where, limit } = window.firebaseApp;
        
        // SIMPLIFIED QUERY - No orderBy to avoid index requirement
        const q = query(
            collection(db, "products"),
            where("featured", "==", true),
            limit(8) // Limit to 8 products
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            showDefaultProducts(container);
            return;
        }
        
        const products = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            products.push({
                id: doc.id,
                name: data.name || 'Stone Product',
                category: data.category || 'Stone',
                price: data.priceGBP || 0,
                image: data.images?.[0] || data.imageUrl || '',
                description: data.description || ''
            });
        });
        
        // Display products
        displayProducts(container, products);
        
    } catch (error) {
        console.error('Error loading products:', error);
        showDefaultProducts(container);
    }
}

// Display products
function displayProducts(container, products) {
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                ${product.image ? 
                    `<img src="${product.image}" alt="${product.name}" loading="lazy">` : 
                    `<i class="fas fa-mountain"></i>`}
            </div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="product-category">${product.category}</p>
                <div class="product-price">
                    <span>£${product.price.toFixed(2)}</span>
                    <span>/m²</span>
                </div>
                <button class="btn-view-product" onclick="viewProduct('${product.id}')">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Show default products if Firebase fails
function showDefaultProducts(container) {
    container.innerHTML = `
        <style>
            .product-card {
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                transition: transform 0.3s ease;
            }
            .product-card:hover {
                transform: translateY(-5px);
            }
            .product-image {
                height: 200px;
                background: #f5f5f5;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            .product-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .product-image i {
                font-size: 3rem;
                color: #b8860b;
            }
            .product-info {
                padding: 20px;
            }
            .product-info h4 {
                margin-bottom: 8px;
                color: #333;
            }
            .product-category {
                color: #666;
                font-size: 0.9rem;
                margin-bottom: 10px;
            }
            .product-price {
                color: #b8860b;
                font-weight: 600;
                font-size: 1.2rem;
                margin-bottom: 15px;
            }
            .btn-view-product {
                background: #333;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                width: 100%;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            .btn-view-product:hover {
                background: #b8860b;
            }
        </style>
        
        <div class="product-card">
            <div class="product-image">
                <i class="fas fa-mountain"></i>
            </div>
            <div class="product-info">
                <h4>Raj Green Sandstone</h4>
                <p class="product-category">Sandstone</p>
                <div class="product-price">
                    <span>£28.50</span>
                    <span>/m²</span>
                </div>
                <button class="btn-view-product" onclick="viewProduct('sandstone-1')">
                    View Details
                </button>
            </div>
        </div>
        
        <div class="product-card">
            <div class="product-image">
                <i class="fas fa-layer-group"></i>
            </div>
            <div class="product-info">
                <h4>Kota Blue Stone</h4>
                <p class="product-category">Kota Stone</p>
                <div class="product-price">
                    <span>£32.50</span>
                    <span>/m²</span>
                </div>
                <button class="btn-view-product" onclick="viewProduct('kota-1')">
                    View Details
                </button>
            </div>
        </div>
        
        <div class="product-card">
            <div class="product-image">
                <i class="fas fa-sun"></i>
            </div>
            <div class="product-info">
                <h4>Autumn Brown Sandstone</h4>
                <p class="product-category">Sandstone</p>
                <div class="product-price">
                    <span>£26.75</span>
                    <span>/m²</span>
                </div>
                <button class="btn-view-product" onclick="viewProduct('sandstone-2')">
                    View Details
                </button>
            </div>
        </div>
        
        <div class="product-card">
            <div class="product-image">
                <i class="fas fa-gem"></i>
            </div>
            <div class="product-info">
                <h4>Natural Kota Stone</h4>
                <p class="product-category">Kota Stone</p>
                <div class="product-price">
                    <span>£30.20</span>
                    <span>/m²</span>
                </div>
                <button class="btn-view-product" onclick="viewProduct('kota-2')">
                    View Details
                </button>
            </div>
        </div>
    `;
}

// Triangle hover effects
function initTriangleHover() {
    const triangleItems = document.querySelectorAll('.triangle-item');
    
    triangleItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.zIndex = '20';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.zIndex = '';
        });
        
        // Click to view product
        item.addEventListener('click', function() {
            const position = this.style.getPropertyValue('--triangle-position');
            const category = this.closest('.stone-section').id;
            
            if (category === 'sandstone') {
                viewSandstoneProduct(position);
            } else if (category === 'kota-stone') {
                viewKotaProduct(position);
            }
        });
    });
}

// View sandstone product
function viewSandstoneProduct(position) {
    const products = {
        '1': 'raj-green',
        '2': 'autumn-brown', 
        '3': 'mint-fossil',
        '4': 'modak'
    };
    
    const product = products[position] || 'sandstone';
    window.location.href = `product-detail.html?category=sandstone&type=${product}`;
}

// View kota stone product
function viewKotaProduct(position) {
    const products = {
        '1': 'kota-blue',
        '2': 'kota-brown',
        '3': 'natural-kota',
        '4': 'polished-kota'
    };
    
    const product = products[position] || 'kota-stone';
    window.location.href = `product-detail.html?category=kota-stone&type=${product}`;
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.stone-section, .feature-card, .step').forEach(el => {
        observer.observe(el);
    });
}

// View product details
window.viewProduct = function(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
};

// Update cart count
function updateCartCount() {
    const count = localStorage.getItem('iryaCartCount') || '0';
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
    });
}

// Initialize cart count
updateCartCount();
