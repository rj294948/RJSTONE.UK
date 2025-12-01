<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Details - StoneCraft UK</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Firebase SDKs -->
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"></script>
    
    <style>
        /* Your CSS remains the same... */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        /* ... rest of your CSS ... */
    </style>
</head>
<body>
    <!-- Your HTML remains the same... -->

    <script>
        // ===== FIREBASE INITIALIZATION =====
        // Your web app's Firebase configuration
        const firebaseConfig = {
            apiKey: "YOUR_API_KEY_HERE",
            authDomain: "YOUR_AUTH_DOMAIN_HERE",
            projectId: "YOUR_PROJECT_ID_HERE",
            storageBucket: "YOUR_STORAGE_BUCKET_HERE",
            messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
            appId: "YOUR_APP_ID_HERE"
        };

        // Initialize Firebase
        const app = firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const auth = firebase.auth();

        // ===== GLOBAL VARIABLES =====
        let currentProduct = null;
        let currentImageIndex = 0;
        let selectedSize = null;
        let selectedColor = null;
        let selectedFinish = null;
        let quantity = 1;
        let relatedProducts = [];

        // ===== DOM ELEMENTS =====
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const productContent = document.getElementById('productContent');
        const relatedProductsSection = document.getElementById('relatedProductsSection');
        
        const mainProductImage = document.getElementById('mainProductImage');
        const mainImageContainer = document.getElementById('mainImageContainer');
        const zoomLens = document.getElementById('zoomLens');
        const zoomResult = document.getElementById('zoomResult');
        const zoomResultImg = document.getElementById('zoomResultImg');
        const thumbnailStrip = document.getElementById('thumbnailStrip');
        
        const productTitle = document.getElementById('productTitle');
        const productPrice = document.getElementById('productPrice');
        const priceUnit = document.getElementById('priceUnit');
        const productRating = document.getElementById('productRating');
        const ratingCount = document.getElementById('ratingCount');
        const productDescription = document.getElementById('productDescription');
        const productOptions = document.getElementById('productOptions');
        const specificationsTable = document.getElementById('specificationsTable');
        
        const quantityInput = document.getElementById('quantityInput');
        const quantityDecrease = document.getElementById('quantityDecrease');
        const quantityIncrease = document.getElementById('quantityIncrease');
        const totalPrice = document.getElementById('totalPrice');
        const addToCartBtn = document.getElementById('addToCartBtn');
        const buyNowBtn = document.getElementById('buyNowBtn');
        
        const relatedProductsSlider = document.getElementById('relatedProductsSlider');
        const sliderPrevBtn = document.getElementById('sliderPrevBtn');
        const sliderNextBtn = document.getElementById('sliderNextBtn');
        
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImg');
        const lightboxClose = document.getElementById('lightboxClose');
        const lightboxPrev = document.getElementById('lightboxPrev');
        const lightboxNext = document.getElementById('lightboxNext');

        // ===== INITIALIZATION =====
        document.addEventListener('DOMContentLoaded', async function() {
            console.log('🚀 Initializing Product Details Page...');
            
            // Get product ID from URL
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id') || localStorage.getItem('selectedProductId');
            
            if (!productId) {
                showError("No product ID found in URL");
                return;
            }
            
            console.log('📋 Product ID:', productId);
            
            try {
                // Load product from Firebase
                await loadProductFromFirestore(productId);
                
                // Initialize UI after product is loaded
                initializeProductPage();
                initializeImageZoom();
                initializeLightbox();
                initializeQuantityControls();
                initializeActionButtons();
                initializeRelatedProductsSlider();
                
                console.log('✅ Product Page initialized successfully!');
            } catch (error) {
                console.error('❌ Error loading product:', error);
                showError("Failed to load product details");
            }
        });

        // ===== FIREBASE FUNCTIONS =====
        async function loadProductFromFirestore(productId) {
            try {
                console.log('🔥 Loading product from Firestore...');
                
                // Get product document
                const docRef = db.collection("products").doc(productId);
                const docSnap = await docRef.get();
                
                if (!docSnap.exists) {
                    throw new Error("Product not found");
                }
                
                // Get product data
                let productData = docSnap.data();
                
                // ✅ FIX: Handle additional_fields array properly
                if (productData.additional_fields && Array.isArray(productData.additional_fields)) {
                    productData.additional_fields.forEach(field => {
                        if (field && typeof field === 'object') {
                            productData = { ...productData, ...field };
                        }
                    });
                }
                
                // Set current product
                currentProduct = {
                    id: docSnap.id,
                    ...productData
                };
                
                console.log('✅ Product loaded:', currentProduct);
                
                // Hide loading, show content
                loadingState.style.display = 'none';
                productContent.classList.remove('hidden');
                
                // Load related products
                await loadRelatedProducts();
                
            } catch (error) {
                console.error('❌ Error loading product from Firestore:', error);
                throw error;
            }
        }

        async function loadRelatedProducts() {
            try {
                if (!currentProduct) return;
                
                console.log('🔄 Loading related products...');
                
                // Get products from same category or uses
                const q = db.collection("products")
                    .where("id", "!=", currentProduct.id)
                    .limit(6);
                
                const querySnapshot = await q.get();
                relatedProducts = [];
                
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    let processedData = { ...data };
                    
                    // Handle additional_fields
                    if (data.additional_fields && Array.isArray(data.additional_fields)) {
                        data.additional_fields.forEach(field => {
                            if (field && typeof field === 'object') {
                                processedData = { ...processedData, ...field };
                            }
                        });
                    }
                    
                    relatedProducts.push({
                        id: doc.id,
                        ...processedData
                    });
                });
                
                console.log('✅ Related products loaded:', relatedProducts.length);
                
                // If no related products found, use sample data as fallback
                if (relatedProducts.length === 0) {
                    relatedProducts = getSampleRelatedProducts();
                }
                
                // Show related products section
                relatedProductsSection.classList.remove('hidden');
                
            } catch (error) {
                console.error('❌ Error loading related products:', error);
                // Use sample data as fallback
                relatedProducts = getSampleRelatedProducts();
                relatedProductsSection.classList.remove('hidden');
            }
        }

        // ===== REST OF YOUR FUNCTIONS REMAIN THE SAME =====
        // initializeProductPage(), createThumbnailStrip(), etc.
        // ... (All your existing functions remain unchanged)

        function getSampleRelatedProducts() {
            return [
                {
                    id: "2",
                    stone_name: "Black Galaxy Granite",
                    category: "Granite",
                    price: 89.99,
                    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                },
                {
                    id: "3",
                    stone_name: "Travertine Beige Stone",
                    category: "Limestone",
                    price: 75.50,
                    image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                },
                {
                    id: "4",
                    stone_name: "Sandstone Pavers",
                    category: "Sandstone",
                    price: 45.25,
                    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                }
            ];
        }

        function showError(message) {
            loadingState.style.display = 'none';
            errorState.classList.remove('hidden');
            
            if (message) {
                errorState.querySelector('h3').textContent = message;
            }
        }

        console.log('✅ All functions defined successfully!');
    </script>
</body>
</html>
