
// CHETARMY PRO - Core Application
// Main application logic and state management

const APP = {
    // Application State
    state: {
        user: null,
        cart: [],
        products: [],
        orders: [],
        settings: {},
        isAdmin: false,
        isLoggedIn: false,
        theme: 'default',
        currency: 'USD',
        language: 'en'
    },

    // Initialize Application
    init: function() {
        console.log('%c🎮 CHETARMY PRO v2.1.0', 'color: #00d2ff; font-size: 24px; font-weight: bold;');
        console.log('%c⚠️ This is a premium cheating solution website.', 'color: #ff416c;');
        
        this.loadState();
        this.setupEventListeners();
        this.loadProducts();
        this.updateCartUI();
        this.checkAdminAccess();
        this.setupNotifications();
        
        // Initialize animations
        this.initAnimations();
        
        // Start background services
        this.startBackgroundServices();
        
        // Check for updates
        this.checkForUpdates();
        
        console.log('%c✅ Application initialized successfully', 'color: #00b09b;');
    },

    // Load saved state from localStorage
    loadState: function() {
        try {
            // Load cart
            const savedCart = localStorage.getItem('chetarmy_cart');
            if (savedCart) {
                this.state.cart = JSON.parse(savedCart);
            }

            // Load settings
            const savedSettings = localStorage.getItem('chetarmy_settings');
            if (savedSettings) {
                this.state.settings = JSON.parse(savedSettings);
                this.applySettings();
            }

            // Load theme
            const savedTheme = localStorage.getItem('chetarmy_theme');
            if (savedTheme) {
                this.state.theme = savedTheme;
                this.applyTheme(savedTheme);
            }
        } catch (error) {
            console.error('Error loading state:', error);
            this.resetState();
        }
    },

    // Save state to localStorage
    saveState: function() {
        try {
            localStorage.setItem('chetarmy_cart', JSON.stringify(this.state.cart));
            localStorage.setItem('chetarmy_settings', JSON.stringify(this.state.settings));
            localStorage.setItem('chetarmy_theme', this.state.theme);
        } catch (error) {
            console.error('Error saving state:', error);
        }
    },

    // Reset state to defaults
    resetState: function() {
        this.state = {
            user: null,
            cart: [],
            products: [],
            orders: [],
            settings: {},
            isAdmin: false,
            isLoggedIn: false,
            theme: 'default',
            currency: 'USD',
            language: 'en'
        };
        localStorage.clear();
        this.updateUI();
    },

    // Setup all event listeners
    setupEventListeners: function() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Product filtering
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterProducts(e));
        });

        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart')) {
                const productId = e.target.closest('.add-to-cart').dataset.productId;
                this.addToCart(productId);
            }
        });

        // Cart controls
        document.getElementById('cartBtn')?.addEventListener('click', () => this.toggleCart());
        document.getElementById('closeCart')?.addEventListener('click', () => this.toggleCart(false));
        document.getElementById('checkoutBtn')?.addEventListener('click', () => this.checkout());

        // User controls
        document.getElementById('loginBtn')?.addEventListener('click', () => this.showModal('login'));
        document.getElementById('registerBtn')?.addEventListener('click', () => this.showModal('register'));
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.handleLogout());

        // Modal controls
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                this.hideModal(modal.id);
            });
        });

        // Form submissions
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));

        // Theme color picker
        document.getElementById('colorPickerBtn')?.addEventListener('click', () => this.showModal('colorPickerModal'));

        // Support buttons
        document.getElementById('ticketBtn')?.addEventListener('click', () => this.createSupportTicket());

        // Newsletter form
        document.getElementById('newsletterForm')?.addEventListener('submit', (e) => this.handleNewsletter(e));

        // Window events
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Handle clicks outside modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.hideAllModals();
                this.toggleCart(false);
            }
        });
    },

    // Load products from CONFIG
    loadProducts: function() {
        this.state.products = CONFIG.PRODUCTS;
        this.renderProducts();
    },

    // Render products to grid
    renderProducts: function(filter = 'all') {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        let filteredProducts = this.state.products;
        if (filter !== 'all') {
            filteredProducts = this.state.products.filter(p => p.category === filter);
        }

        grid.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-category="${product.category}">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                
                <div class="product-icon">
                    <i class="fas ${product.icon}"></i>
                </div>
                
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                
                <ul class="product-features">
                    ${product.features.slice(0, 4).map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                
                <div class="product-footer">
                    <div class="product-price">
                        ${product.discount ? `
                            <span class="old-price">$${product.price.toFixed(2)}</span>
                            <span class="new-price">$${(product.price * (1 - product.discount/100)).toFixed(2)}</span>
                        ` : `
                            <span>$${product.price.toFixed(2)}</span>
                        `}
                    </div>
                    
                    <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
                
                <div class="product-meta">
                    <span><i class="fas fa-sync-alt"></i> ${product.updates}</span>
                    <span><i class="fas fa-gamepad"></i> ${product.compatible.length}+ Games</span>
                    <span><i class="fas fa-shield-alt"></i> ${product.requires_hwid ? 'HWID Lock' : 'No HWID'}</span>
                </div>
            </div>
        `).join('');

        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.classList.toggle('active', button.dataset.filter === filter);
        });
    },

    // Filter products by category
    filterProducts: function(event) {
        event.preventDefault();
        const filter = event.target.dataset.filter;
        this.renderProducts(filter);
    },

    // Add product to cart
    addToCart: function(productId) {
        const product = this.state.products.find(p => p.id == productId);
        if (!product) return;

        const existingItem = this.state.cart.find(item => item.id == productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.state.cart.push({
                id: product.id,
                name: product.name,
                price: product.discount ? product.price * (1 - product.discount/100) : product.price,
                originalPrice: product.price,
                quantity: 1,
                image: product.icon
            });
        }

        this.updateCartUI();
        this.saveState();
        this.showNotification(`${product.name} added to cart`, 'success');
        
        // Show cart sidebar
        this.toggleCart(true);
    },

    // Update cart UI
    updateCartUI: function() {
        const cartCount = document.getElementById('cartCount');
        const cartBody = document.getElementById('cartBody');
        const cartTotal = document.getElementById('cartTotal');

        if (cartCount) {
            cartCount.textContent = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
        }

        if (cartBody) {
            if (this.state.cart.length === 0) {
                cartBody.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
            } else {
                cartBody.innerHTML = this.state.cart.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <span class="price">$${item.price.toFixed(2)}</span>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn increase" data-id="${item.id}">+</button>
                            </div>
                            <button class="remove-btn" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('');

                // Add event listeners for cart controls
                cartBody.querySelectorAll('.quantity-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.dataset.id;
                        const isIncrease = e.target.classList.contains('increase');
                        this.updateCartQuantity(id, isIncrease);
                    });
                });

                cartBody.querySelectorAll('.remove-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.closest('.remove-btn').dataset.id;
                        this.removeFromCart(id);
                    });
                });
            }
        }

        if (cartTotal) {
            const total = this.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = `$${total.toFixed(2)}`;
        }
    },

    // Update cart quantity
    updateCartQuantity: function(productId, increase = true) {
        const item = this.state.cart.find(item => item.id == productId);
        if (!item) return;

        if (increase) {
            item.quantity += 1;
        } else {
            item.quantity -= 1;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
                return;
            }
        }

        this.updateCartUI();
        this.saveState();
    },

    // Remove item from cart
    removeFromCart: function(productId) {
        this.state.cart = this.state.cart.filter(item => item.id != productId);
        this.updateCartUI();
        this.saveState();
        this.showNotification('Item removed from cart', 'warning');
    },

    // Toggle cart sidebar
    toggleCart: function(show = null) {
        const cartSidebar = document.getElementById('cartSidebar');
        if (!cartSidebar) return;

        if (show === null) {
            cartSidebar.classList.toggle('active');
        } else {
            cartSidebar.classList.toggle('active', show);
        }
    },

    // Handle checkout
    checkout: function() {
        if (this.state.cart.length === 0) {
            this.showNotification('Your cart is empty', 'error');
            return;
        }

        if (!this.state.isLoggedIn) {
            this.showNotification('Please login to checkout', 'warning');
            this.showModal('login');
            return;
        }

        // Initialize payment
        PAYMENT.initCheckout(this.state.cart);
    },

    // ===== REAL LOGIN WITH FIREBASE =====
    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.showNotification('Please fill all fields', 'error');
            return;
        }
        
        this.showNotification('Signing in...', 'info');
        
        // Use Firebase function
        const result = await window.firebaseLogin(email, password);
        
        if (result.success) {
            this.hideModal('loginModal');
            document.getElementById('loginForm').reset();
        }
    },

    // ===== REAL REGISTER WITH FIREBASE =====
    async handleRegister(event) {
        event.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        if (!username || !email || !password || !confirmPassword) {
            this.showNotification('Please fill all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        this.showNotification('Creating account...', 'info');
        
        // Use Firebase function
        const result = await window.firebaseRegister(email, password, username);
        
        if (result.success) {
            this.hideModal('registerModal');
            document.getElementById('registerForm').reset();
        }
    },

    // Handle user logout
    async handleLogout() {
        const result = await window.firebaseLogout();
        if (result.success) {
            this.state.user = null;
            this.state.isLoggedIn = false;
            this.updateUserUI();
        }
    },

    // Update user UI
    updateUserUI: function(user = null) {
        const userBtn = document.getElementById('userBtn');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const profileBtn = document.getElementById('profileBtn');
        const adminLink = document.querySelector('.admin-link');

        if (user) {
            // User is logged in
            if (userBtn) {
                userBtn.innerHTML = `<i class="fas fa-user"></i> ${user.email.split('@')[0]}`;
            }
            
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (profileBtn) profileBtn.style.display = 'block';
            
            // Check if user is admin
            if (adminLink && user.email === CONFIG.ADMIN.EMAIL_ADMIN) {
                adminLink.classList.remove('hidden');
                this.state.isAdmin = true;
            }
            
            // Update app state
            this.state.user = {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified
            };
            this.state.isLoggedIn = true;
            
        } else {
            // User logged out
            if (userBtn) userBtn.innerHTML = '<i class="fas fa-user"></i>';
            if (loginBtn) loginBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (profileBtn) profileBtn.style.display = 'none';
            if (adminLink) adminLink.classList.add('hidden');
            
            // Clear state
            this.state.user = null;
            this.state.isLoggedIn = false;
            this.state.isAdmin = false;
        }
    },

    // Check for admin access
    checkAdminAccess: function() {
        // This now happens in updateUserUI based on user email
    },

    // Show notification
    showNotification: function(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        // Add to container
        const container = document.getElementById('notificationContainer') || this.createNotificationContainer();
        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        });
    },

    // Create notification container
    createNotificationContainer: function() {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
    },

    // Show modal
    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            this.hideAllModals();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    // Hide modal
    hideModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    // Hide all modals
    hideAllModals: function() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    },

    // Apply theme
    applyTheme: function(themeName) {
        const theme = CONFIG.THEMES.find(t => t.name === themeName) || CONFIG.THEMES[0];
        
        document.documentElement.style.setProperty('--primary-color', theme.primary);
        document.documentElement.style.setProperty('--secondary-color', theme.secondary);
        document.documentElement.style.setProperty('--accent-color', theme.accent);
        
        this.state.theme = themeName;
        this.saveState();
    },

    // Apply settings
    applySettings: function() {
        // Apply saved settings
        if (this.state.settings.darkMode !== undefined) {
            document.body.classList.toggle('dark-mode', this.state.settings.darkMode);
        }
        
        if (this.state.settings.language) {
            this.state.language = this.state.settings.language;
        }
        
        if (this.state.settings.currency) {
            this.state.currency = this.state.settings.currency;
        }
    },

    // Handle navigation
    handleNavigation: function(event) {
        event.preventDefault();
        const targetId = event.target.getAttribute('href');
        
        if (targetId.startsWith('#')) {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            event.target.classList.add('active');
        }
    },

    // Handle scroll
    handleScroll: function() {
        const header = document.getElementById('mainHeader');
        if (window.scrollY > 100) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
        
        // Update active nav based on scroll position
        this.updateActiveNav();
    },

    // Update active navigation based on scroll
    updateActiveNav: function() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    },

    // Handle resize
    handleResize: function() {
        // Update any responsive elements
        this.updateResponsiveElements();
    },

    // Handle keyboard shortcuts
    handleKeyboardShortcuts: function(event) {
        // Ctrl/Cmd + K to search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            // Focus search if available
            const searchInput = document.querySelector('input[type="search"]');
            if (searchInput) searchInput.focus();
        }
        
        // Escape to close modals
        if (event.key === 'Escape') {
            this.hideAllModals();
            this.toggleCart(false);
        }
        
        // Ctrl/Cmd + / for admin
        if ((event.ctrlKey || event.metaKey) && event.key === '/') {
            event.preventDefault();
            if (this.state.isAdmin) {
                this.showModal('adminModal');
            }
        }
    },

    // Initialize animations
    initAnimations: function() {
        // Animate numbers
        this.animateNumbers();
        
        // Initialize intersection observer for scroll animations
        this.initScrollAnimations();
    },

    // Animate numbers
    animateNumbers: function() {
        const numberElements = document.querySelectorAll('.stat-number[data-target]');
        
        numberElements.forEach(element => {
            const target = parseInt(element.dataset.target);
            const duration = 2000;
            const step = target / (duration / 16); // 60fps
            
            let current = 0;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current);
            }, 16);
        });
    },

    // Initialize scroll animations
    initScrollAnimations: function() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });
        
        // Observe elements with animation classes
        document.querySelectorAll('.fade-in, .slide-in, .zoom-in').forEach(el => {
            observer.observe(el);
        });
    },

    // Start background services
    startBackgroundServices: function() {
        // Update live stats every 30 seconds
        setInterval(() => this.updateLiveStats(), 30000);
        
        // Check for session expiry every minute
        setInterval(() => this.checkSession(), 60000);
        
        // Update product stock every 5 minutes
        setInterval(() => this.updateProductStock(), 300000);
    },

    // Update live stats
    updateLiveStats: function() {
        // In production, this would fetch from API
        // For demo, generate random data
        const statElements = document.querySelectorAll('.stat-number');
        statElements.forEach(el => {
            const current = parseInt(el.textContent);
            const change = Math.floor(Math.random() * 10) - 2; // -2 to +7
            const newValue = Math.max(0, current + change);
            
            if (Math.abs(change) > 0) {
                el.textContent = newValue;
                el.dataset.target = newValue;
            }
        });
    },

    // Check session
    checkSession: function() {
        // Firebase handles sessions automatically
        // We just update last activity
        if (this.state.isLoggedIn) {
            localStorage.setItem('chetarmy_last_activity', Date.now());
        }
    },

    // Update product stock
    updateProductStock: function() {
        // In production, this would sync with server
        // For demo, randomly adjust stock
        this.state.products.forEach(product => {
            if (product.stock > 0) {
                const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
                product.stock = Math.max(0, product.stock + change);
            }
        });
    },

    // Check for updates
    checkForUpdates: function() {
        if (CONFIG.SETTINGS.AUTO_UPDATE) {
            // Check if current version matches latest
            const currentVersion = localStorage.getItem('chetarmy_version');
            const latestVersion = CONFIG.SITE.VERSION;
            
            if (currentVersion !== latestVersion) {
                console.log(`%c🔄 Update available: ${currentVersion || 'unknown'} → ${latestVersion}`, 'color: #ffa62e;');
                this.showNotification(`New version ${latestVersion} available`, 'info');
                localStorage.setItem('chetarmy_version', latestVersion);
            }
        }
    },

    // Create support ticket
    createSupportTicket: function() {
        if (!this.state.isLoggedIn) {
            this.showNotification('Please login to create support ticket', 'warning');
            this.showModal('login');
            return;
        }
        
        // Open support URL
        window.open(CONFIG.SITE.SUPPORT_TELEGRAM, '_blank');
    },

    // Handle newsletter subscription
    handleNewsletter: function(event) {
        event.preventDefault();
        const email = event.target.querySelector('input[type="email"]').value;
        
        if (!email) {
            this.showNotification('Please enter your email', 'error');
            return;
        }
        
        // In production, this would be an API call
        this.showNotification('Subscribed to newsletter successfully', 'success');
        event.target.reset();
    },

    // Update responsive elements
    updateResponsiveElements: function() {
        const isMobile = window.innerWidth < 768;
        
        // Update menu toggle visibility
        const menuToggle = document.getElementById('menuToggle');
        const mainNav = document.getElementById('mainNav');
        
        if (menuToggle && mainNav) {
            if (isMobile) {
                menuToggle.style.display = 'block';
                menuToggle.addEventListener('click', () => {
                    mainNav.classList.toggle('active');
                });
            } else {
                menuToggle.style.display = 'none';
                mainNav.classList.remove('active');
            }
        }
    },

    // Setup notifications system
    setupNotifications: function() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notificationContainer')) {
            this.createNotificationContainer();
        }
        
        // Add notification styles
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            }
            
            .notification {
                background: var(--card-bg);
                border: 1px solid var(--card-border);
                border-radius: var(--border-radius);
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                animation: slideIn 0.3s ease;
                transform: translateX(0);
                opacity: 1;
                transition: transform 0.3s ease, opacity 0.3s ease;
            }
            
            .notification.hide {
                transform: translateX(100%);
                opacity: 0;
            }
            
            .notification-success {
                border-left: 4px solid var(--success-color);
            }
            
            .notification-error {
                border-left: 4px solid var(--danger-color);
            }
            
            .notification-warning {
                border-left: 4px solid var(--warning-color);
            }
            
            .notification-info {
                border-left: 4px solid var(--accent-color);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--text-primary);
            }
            
            .notification-close {
                background: transparent;
                border: none;
                color: var(--text-muted);
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: var(--transition);
            }
            
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-primary);
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
        document.head.appendChild(style);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => APP.init());

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP;
} else {
    window.APP = APP;
}

// DEBUG: Force bind events on page load
setTimeout(() => {
  console.log('DEBUG: Checking form bindings...');
  
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  if (loginForm) {
    console.log('✓ Login form found');
    loginForm.onsubmit = (e) => APP.handleLogin(e);
  } else {
    console.log('✗ Login form NOT found');
  }
  
  if (registerForm) {
    console.log('✓ Register form found');
    registerForm.onsubmit = (e) => APP.handleRegister(e);
  } else {
    console.log('✗ Register form NOT found');
  }
}, 1000);
