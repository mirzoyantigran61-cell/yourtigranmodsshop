// CHETARMY PRO - Admin Panel
// Administrative control panel for managing the website

const ADMIN = {
    // Admin state
    state: {
        isAuthenticated: false,
        userLevel: 0, // 0=none, 1=mod, 2=admin, 3=owner
        permissions: [],
        lastActivity: null
    },

    // Admin data
    data: {
        users: [],
        orders: [],
        products: [],
        licenses: [],
        logs: [],
        stats: {}
    },

    // Initialize admin panel
    init: function() {
        console.log('🔐 Admin system initialized');
        
        this.checkAuth();
        this.setupAdminAccess();
        this.loadAdminData();
        this.setupEventListeners();
        this.startBackgroundTasks();
    },

    // Check authentication
    checkAuth: function() {
        // Check for admin key in localStorage
        const adminKey = localStorage.getItem('chetarmy_admin_key');
        const adminData = localStorage.getItem('chetarmy_admin_data');
        
        if (adminKey === CONFIG.ADMIN.SECRET_KEY && adminData) {
            try {
                const data = JSON.parse(adminData);
                this.state.isAuthenticated = true;
                this.state.userLevel = data.level || 2;
                this.state.permissions = data.permissions || ['view'];
                this.state.lastActivity = data.lastActivity || Date.now();
                
                console.log('%c🔑 ADMIN: Authenticated', 'color: #00ff00;');
                
                // Update admin UI
                this.updateAdminUI();
                
                // Load admin data
                this.loadAdminData();
                
                // Start session timer
                this.startSessionTimer();
                
            } catch (error) {
                console.error('Admin auth error:', error);
                this.logout();
            }
        }
    },

    // Setup admin access
    setupAdminAccess: function() {
        // Add admin access via URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('admin_key')) {
            const key = urlParams.get('admin_key');
            if (key === CONFIG.ADMIN.SECRET_KEY) {
                this.authenticate({
                    level: 3,
                    permissions: ['all'],
                    username: 'owner'
                });
                
                // Remove key from URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
        
        // Add admin access via console command
        window.__admin = (command) => {
            if (command === 'login') {
                this.showAdminLogin();
            } else if (command === 'logout') {
                this.logout();
            } else if (command === 'status') {
                console.log('Admin Status:', this.state);
            }
        };
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Admin login via secret button
        const secretBtn = document.getElementById('secretAdminBtn');
        if (secretBtn) {
            secretBtn.addEventListener('click', () => this.showAdminLogin());
        }
        
        // Admin link in navigation
        const adminLink = document.querySelector('.admin-link');
        if (adminLink) {
            adminLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.state.isAuthenticated) {
                    this.showAdminPanel();
                } else {
                    this.showAdminLogin();
                }
            });
        }
        
        // Admin modal close
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeAdminModal') {
                APP.hideModal('adminModal');
            }
        });
    },

    // Show admin login
    showAdminLogin: function() {
        // Create login modal if it doesn't exist
        if (!document.getElementById('adminLoginModal')) {
            this.createAdminLoginModal();
        }
        
        // Show modal
        APP.showModal('adminLoginModal');
    },

    // Create admin login modal
    createAdminLoginModal: function() {
        const modalHTML = `
            <div class="modal-overlay" id="adminLoginModal">
                <div class="modal">
                    <button class="modal-close" id="closeAdminLoginModal">&times;</button>
                    
                    <div class="modal-header text-center">
                        <div class="admin-icon">
                            <i class="fas fa-user-shield"></i>
                        </div>
                        <h2>Admin Access</h2>
                        <p class="modal-subtitle">Restricted Area</p>
                    </div>
                    
                    <div class="modal-body">
                        <form id="adminLoginForm">
                            <div class="form-group">
                                <label>Access Key</label>
                                <input type="password" id="adminKey" placeholder="Enter admin key" autocomplete="off">
                            </div>
                            
                            <div class="form-group">
                                <label>Verification Code</label>
                                <input type="text" id="adminCode" placeholder="Optional 2FA code" autocomplete="off">
                            </div>
                            
                            <button type="submit" class="btn btn-danger btn-block">
                                <i class="fas fa-unlock-alt"></i> Authenticate
                            </button>
                        </form>
                        
                        <div class="admin-hint">
                            <p><i class="fas fa-info-circle"></i> Contact system administrator for access</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);

        // Setup form submission
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAdminLogin();
        });

        // Setup close button
        document.getElementById('closeAdminLoginModal').addEventListener('click', () => {
            APP.hideModal('adminLoginModal');
        });
    },

    // Handle admin login
    handleAdminLogin: function() {
        const key = document.getElementById('adminKey').value;
        const code = document.getElementById('adminCode').value;
        
        if (key === CONFIG.ADMIN.SECRET_KEY) {
            // Successful login
            this.authenticate({
                level: code ? 2 : 3, // 2FA users get lower level
                permissions: code ? ['view', 'edit'] : ['all'],
                username: code ? 'admin' : 'owner',
                loginTime: new Date().toISOString()
            });
            
            APP.hideModal('adminLoginModal');
            APP.showNotification('Admin access granted', 'success');
            
            // Log this access
            this.logAction('login', 'Admin login successful');
            
        } else {
            // Failed login
            APP.showNotification('Invalid access key', 'error');
            
            // Log failed attempt
            this.logAction('login_failed', `Failed attempt with key: ${key.substring(0, 5)}...`);
        }
    },

    // Authenticate admin
    authenticate: function(userData) {
        this.state.isAuthenticated = true;
        this.state.userLevel = userData.level;
        this.state.permissions = userData.permissions;
        this.state.lastActivity = Date.now();
        
        // Save to localStorage
        const adminData = {
            level: userData.level,
            permissions: userData.permissions,
            username: userData.username,
            loginTime: userData.loginTime,
            lastActivity: this.state.lastActivity
        };
        
        localStorage.setItem('chetarmy_admin_key', CONFIG.ADMIN.SECRET_KEY);
        localStorage.setItem('chetarmy_admin_data', JSON.stringify(adminData));
        
        // Update UI
        this.updateAdminUI();
        
        // Show admin panel
        this.showAdminPanel();
    },

    // Show admin panel
    showAdminPanel: function() {
        // Create panel if it doesn't exist
        if (!document.getElementById('adminPanelContent')) {
            this.createAdminPanel();
        }
        
        // Load current data
        this.loadAdminData();
        
        // Show modal
        APP.showModal('adminModal');
    },

    // Create admin panel
    createAdminPanel: function() {
        const panelHTML = `
            <div class="admin-panel">
                <div class="admin-header">
                    <div class="admin-user">
                        <i class="fas fa-user-shield"></i>
                        <div>
                            <h3>Administrator</h3>
                            <small>Level ${this.state.userLevel} • ${this.state.permissions.join(', ')}</small>
                        </div>
                    </div>
                    <button class="btn btn-danger" id="adminLogoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
                
                <div class="admin-tabs">
                    <button class="admin-tab active" data-tab="dashboard">Dashboard</button>
                    <button class="admin-tab" data-tab="users">Users</button>
                    <button class="admin-tab" data-tab="orders">Orders</button>
                    <button class="admin-tab" data-tab="products">Products</button>
                    <button class="admin-tab" data-tab="licenses">Licenses</button>
                    <button class="admin-tab" data-tab="logs">Logs</button>
                    <button class="admin-tab" data-tab="settings">Settings</button>
                </div>
                
                <div class="admin-content">
                    <div class="admin-tab-content active" id="dashboardTab">
                        <div class="admin-stats" id="adminStats"></div>
                        <div class="admin-quick-actions" id="adminActions"></div>
                        <div class="admin-recent" id="adminRecent"></div>
                    </div>
                    
                    <div class="admin-tab-content" id="usersTab">
                        <div class="admin-table-container" id="usersTable"></div>
                    </div>
                    
                    <div class="admin-tab-content" id="ordersTab">
                        <div class="admin-table-container" id="ordersTable"></div>
                    </div>
                    
                    <div class="admin-tab-content" id="productsTab">
                        <div class="admin-table-container" id="productsTable"></div>
                    </div>
                    
                    <div class="admin-tab-content" id="licensesTab">
                        <div class="admin-table-container" id="licensesTable"></div>
                    </div>
                    
                    <div class="admin-tab-content" id="logsTab">
                        <div class="admin-log-container" id="adminLogs"></div>
                    </div>
                    
                    <div class="admin-tab-content" id="settingsTab">
                        <div class="admin-settings" id="adminSettings"></div>
                    </div>
                </div>
            </div>
        `;

        // Set panel content
        document.getElementById('adminPanelContent').innerHTML = panelHTML;
        
        // Setup tab switching
        this.setupAdminTabs();
        
        // Setup logout button
        document.getElementById('adminLogoutBtn').addEventListener('click', () => this.logout());
    },

    // Setup admin tabs
    setupAdminTabs: function() {
        const tabs = document.querySelectorAll('.admin-tab');
        const contents = document.querySelectorAll('.admin-tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Show corresponding content
                const tabId = tab.dataset.tab + 'Tab';
                document.getElementById(tabId).classList.add('active');
                
                // Load tab data
                this.loadTabData(tab.dataset.tab);
            });
        });
    },

    // Load tab data
    loadTabData: function(tab) {
        switch(tab) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'licenses':
                this.loadLicenses();
                break;
            case 'logs':
                this.loadLogs();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    },

    // Load admin data
    loadAdminData: function() {
        // Load from localStorage
        this.loadLocalData();
        
        // Update dashboard
        this.loadDashboard();
    },

    // Load data from localStorage
    loadLocalData: function() {
        try {
            // Load users
            const usersData = localStorage.getItem('chetarmy_users');
            if (usersData) {
                this.data.users = JSON.parse(usersData);
            }
            
            // Load orders
            const ordersData = localStorage.getItem('chetarmy_orders');
            if (ordersData) {
                this.data.orders = JSON.parse(ordersData);
            }
            
            // Load products (from CONFIG)
            this.data.products = CONFIG.PRODUCTS;
            
            // Load licenses
            this.data.licenses = this.generateLicenseData();
            
            // Load logs
            const logsData = localStorage.getItem('chetarmy_admin_logs');
            if (logsData) {
                this.data.logs = JSON.parse(logsData);
            }
            
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    },

    // Generate license data from orders
    generateLicenseData: function() {
        const licenses = [];
        const orders = this.data.orders;
        
        orders.forEach(order => {
            if (order.licenses) {
                order.licenses.forEach(license => {
                    licenses.push({
                        ...license,
                        orderId: order.id,
                        customerEmail: order.userId,
                        purchaseDate: order.timestamp
                    });
                });
            }
        });
        
        return licenses;
    },

    // Load dashboard
    loadDashboard: function() {
        const statsContainer = document.getElementById('adminStats');
        const actionsContainer = document.getElementById('adminActions');
        const recentContainer = document.getElementById('adminRecent');
        
        if (!statsContainer) return;
        
        // Calculate stats
        const stats = {
            totalUsers: this.data.users.length,
            totalOrders: this.data.orders.length,
            totalRevenue: this.data.orders.reduce((sum, order) => sum + order.total, 0),
            activeLicenses: this.data.licenses.filter(l => l.status === 'active').length,
            pendingOrders: this.data.orders.filter(o => o.status === 'pending').length,
            todayRevenue: this.calculateTodayRevenue()
        };
        
        // Display stats
        statsContainer.innerHTML = `
            <div class="admin-stat-card">
                <div class="stat-number">${stats.totalUsers}</div>
                <div class="stat-label">Total Users</div>
            </div>
            <div class="admin-stat-card">
                <div class="stat-number">${stats.totalOrders}</div>
                <div class="stat-label">Total Orders</div>
            </div>
            <div class="admin-stat-card">
                <div class="stat-number">$${stats.totalRevenue.toFixed(2)}</div>
                <div class="stat-label">Total Revenue</div>
            </div>
            <div class="admin-stat-card">
                <div class="stat-number">${stats.activeLicenses}</div>
                <div class="stat-label">Active Licenses</div>
            </div>
        `;
        
        // Quick actions
        if (this.state.permissions.includes('all') || this.state.permissions.includes('edit')) {
            actionsContainer.innerHTML = `
                <h4>Quick Actions</h4>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="ADMIN.createProduct()">
                        <i class="fas fa-plus"></i> Add Product
                    </button>
                    <button class="btn btn-success" onclick="ADMIN.generateLicense()">
                        <i class="fas fa-key"></i> Generate License
                    </button>
                    <button class="btn btn-warning" onclick="ADMIN.exportData()">
                        <i class="fas fa-download"></i> Export Data
                    </button>
                    <button class="btn btn-danger" onclick="ADMIN.clearCache()">
                        <i class="fas fa-trash"></i> Clear Cache
                    </button>
                </div>
            `;
        }
        
        // Recent activity
        recentContainer.innerHTML = `
            <h4>Recent Activity</h4>
            <div class="recent-list">
                ${this.getRecentActivity().slice(0, 5).map(activity => `
                    <div class="recent-item">
                        <div class="recent-icon">
                            <i class="fas fa-${activity.icon}"></i>
                        </div>
                        <div class="recent-info">
                            <strong>${activity.action}</strong>
                            <small>${new Date(activity.timestamp).toLocaleString()}</small>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Calculate today's revenue
    calculateTodayRevenue: function() {
        const today = new Date().toDateString();
        return this.data.orders
            .filter(order => new Date(order.timestamp).toDateString() === today)
            .reduce((sum, order) => sum + order.total, 0);
    },

    // Get recent activity
    getRecentActivity: function() {
        // Combine logs with recent orders
        const activities = [...this.data.logs];
        
        this.data.orders.slice(-10).forEach(order => {
            activities.push({
                icon: 'shopping-cart',
                action: `New order: ${order.id}`,
                timestamp: order.timestamp
            });
        });
        
        // Sort by timestamp
        return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    // Load users table
    loadUsers: function() {
        const container = document.getElementById('usersTable');
        if (!container) return;
        
        container.innerHTML = `
            <div class="admin-table-header">
                <h4>User Management</h4>
                <button class="btn btn-sm btn-primary" onclick="ADMIN.createUser()">
                    <i class="fas fa-user-plus"></i> Add User
                </button>
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Joined</th>
                        <th>Orders</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.data.users.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td>${new Date(user.created).toLocaleDateString()}</td>
                            <td>${user.orders ? user.orders.length : 0}</td>
                            <td><span class="status-badge active">Active</span></td>
                            <td>
                                <button class="btn-icon" title="Edit" onclick="ADMIN.editUser(${user.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon" title="Delete" onclick="ADMIN.deleteUser(${user.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    // Load orders table
    loadOrders: function() {
        const container = document.getElementById('ordersTable');
        if (!container) return;
        
        container.innerHTML = `
            <div class="admin-table-header">
                <h4>Order Management</h4>
                <div class="table-filters">
                    <select onchange="ADMIN.filterOrders(this.value)">
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.data.orders.map(order => `
                        <tr>
                            <td>${order.id}</td>
                            <td>${order.userId}</td>
                            <td>$${order.total.toFixed(2)}</td>
                            <td>${new Date(order.timestamp).toLocaleDateString()}</td>
                            <td>
                                <span class="status-badge ${order.status}">
                                    ${order.status}
                                </span>
                            </td>
                            <td>${order.paymentMethod || 'N/A'}</td>
                            <td>
                                <button class="btn-icon" title="View" onclick="ADMIN.viewOrder('${order.id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon" title="Edit" onclick="ADMIN.editOrder('${order.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    // Load products table
    loadProducts: function() {
        const container = document.getElementById('productsTable');
        if (!container) return;
        
        container.innerHTML = `
            <div class="admin-table-header">
                <h4>Product Management</h4>
                <button class="btn btn-sm btn-primary" onclick="ADMIN.createProduct()">
                    <i class="fas fa-plus"></i> Add Product
                </button>
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.data.products.map(product => `
                        <tr>
                            <td>${product.id}</td>
                            <td>${product.name}</td>
                            <td>${product.category}</td>
                            <td>$${product.price.toFixed(2)}</td>
                            <td>${product.stock}</td>
                            <td>
                                <span class="status-badge ${product.stock > 0 ? 'active' : 'inactive'}">
                                    ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </td>
                            <td>
                                <button class="btn-icon" title="Edit" onclick="ADMIN.editProduct(${product.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon" title="Delete" onclick="ADMIN.deleteProduct(${product.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    // Load licenses table
    loadLicenses: function() {
        const container = document.getElementById('licensesTable');
        if (!container) return;
        
        container.innerHTML = `
            <div class="admin-table-header">
                <h4>License Management</h4>
                <button class="btn btn-sm btn-primary" onclick="ADMIN.generateLicense()">
                    <i class="fas fa-key"></i> Generate License
                </button>
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>License Key</th>
                        <th>Product</th>
                        <th>Customer</th>
                        <th>Issued</th>
                        <th>Expires</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.data.licenses.map(license => `
                        <tr>
                            <td><code>${license.licenseKey}</code></td>
                            <td>${license.productName}</td>
                            <td>${license.customerEmail}</td>
                            <td>${new Date(license.purchaseDate).toLocaleDateString()}</td>
                            <td>${new Date(license.expires).toLocaleDateString()}</td>
                            <td>
                                <span class="status-badge ${license.status}">
                                    ${license.status}
                                </span>
                            </td>
                            <td>
                                <button class="btn-icon" title="Revoke" onclick="ADMIN.revokeLicense('${license.licenseKey}')">
                                    <i class="fas fa-ban"></i>
                                </button>
                                <button class="btn-icon" title="Copy" onclick="ADMIN.copyLicense('${license.licenseKey}')">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    // Load logs
    loadLogs: function() {
        const container = document.getElementById('adminLogs');
        if (!container) return;
        
        container.innerHTML = `
            <div class="admin-log-header">
                <h4>System Logs</h4>
                <button class="btn btn-sm btn-danger" onclick="ADMIN.clearLogs()">
                    <i class="fas fa-trash"></i> Clear Logs
                </button>
            </div>
            <div class="log-list">
                ${this.data.logs.map(log => `
                    <div class="log-entry">
                        <span class="log-time">[${new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span class="log-action">${log.action}</span>
                        ${log.details ? `<span class="log-details">${log.details}</span>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Load settings
    loadSettings: function() {
        const container = document.getElementById('adminSettings');
        if (!container) return;
        
        container.innerHTML = `
            <div class="settings-section">
                <h4>System Settings</h4>
                <form id="adminSettingsForm">
                    <div class="form-group">
                        <label>Site Name</label>
                        <input type="text" value="${CONFIG.SITE.NAME}">
                    </div>
                    <div class="form-group">
                        <label>PayPal Client ID</label>
                        <input type="text" value="${CONFIG.PAYMENT.PAYPAL_CLIENT_ID}">
                    </div>
                    <div class="form-group">
                        <label>Support Email</label>
                        <input type="email" value="${CONFIG.SITE.SUPPORT_EMAIL}">
                    </div>
                    <div class="form-group">
                        <label>Currency</label>
                        <select>
                            <option ${CONFIG.PAYMENT.CURRENCY === 'USD' ? 'selected' : ''}>USD</option>
                            <option ${CONFIG.PAYMENT.CURRENCY === 'EUR' ? 'selected' : ''}>EUR</option>
                            <option ${CONFIG.PAYMENT.CURRENCY === 'GBP' ? 'selected' : ''}>GBP</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Save Settings</button>
                </form>
            </div>
            
            <div class="settings-section">
                <h4>Danger Zone</h4>
                <div class="danger-actions">
                    <button class="btn btn-danger" onclick="ADMIN.resetSite()">
                        <i class="fas fa-bomb"></i> Reset Site Data
                    </button>
                    <button class="btn btn-danger" onclick="ADMIN.exportBackup()">
                        <i class="fas fa-download"></i> Full Backup
                    </button>
                </div>
            </div>
        `;
    },

    // Update admin UI
    updateAdminUI: function() {
        // Show admin link in navigation
        const adminLink = document.querySelector('.admin-link');
        if (adminLink) {
            adminLink.classList.remove('hidden');
        }
        
        // Update page title if in admin mode
        if (this.state.isAuthenticated && !document.title.includes('Admin')) {
            document.title = `[ADMIN] ${document.title}`;
        }
    },

    // Log admin action
    logAction: function(action, details = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: action,
            details: details,
            userLevel: this.state.userLevel
        };
        
        this.data.logs.unshift(logEntry);
        
        // Save to localStorage
        try {
            localStorage.setItem('chetarmy_admin_logs', JSON.stringify(this.data.logs));
        } catch (error) {
            console.error('Error saving logs:', error);
        }
    },

    // Start background tasks
    startBackgroundTasks: function() {
        // Check for inactivity every minute
        setInterval(() => this.checkInactivity(), 60000);
        
        // Auto-save data every 5 minutes
        setInterval(() => this.autoSave(), 300000);
    },

    // Start session timer
    startSessionTimer: function() {
        setInterval(() => {
            if (this.state.isAuthenticated) {
                this.state.lastActivity = Date.now();
                
                // Update localStorage
                const adminData = JSON.parse(localStorage.getItem('chetarmy_admin_data') || '{}');
                adminData.lastActivity = this.state.lastActivity;
                localStorage.setItem('chetarmy_admin_data', JSON.stringify(adminData));
            }
        }, 30000); // Update every 30 seconds
    },

    // Check inactivity
    checkInactivity: function() {
        if (this.state.isAuthenticated) {
            const inactiveTime = Date.now() - this.state.lastActivity;
            const timeout = 30 * 60 * 1000; // 30 minutes
            
            if (inactiveTime > timeout) {
                this.logout();
                APP.showNotification('Admin session expired due to inactivity', 'warning');
            }
        }
    },

    // Auto-save data
    autoSave: function() {
        if (this.state.isAuthenticated) {
            this.logAction('auto_save', 'Automatic data backup');
        }
    },

    // Logout admin
    logout: function() {
        this.state.isAuthenticated = false;
        this.state.userLevel = 0;
        this.state.permissions = [];
        
        // Clear admin data from localStorage
        localStorage.removeItem('chetarmy_admin_key');
        localStorage.removeItem('chetarmy_admin_data');
        
        // Hide admin panel
        APP.hideModal('adminModal');
        
        // Update UI
        const adminLink = document.querySelector('.admin-link');
        if (adminLink) {
            adminLink.classList.add('hidden');
        }
        
        // Remove admin from title
        document.title = document.title.replace('[ADMIN] ', '');
        
        // Log logout
        this.logAction('logout', 'Admin session ended');
        
        APP.showNotification('Admin session ended', 'info');
    },

    // Admin actions (stubs for demo)
    createUser: function() {
        APP.showNotification('Create user functionality', 'info');
    },
    
    editUser: function(id) {
        APP.showNotification(`Edit user ${id}`, 'info');
    },
    
    deleteUser: function(id) {
        if (confirm('Delete this user?')) {
            APP.showNotification(`Deleted user ${id}`, 'success');
            this.logAction('delete_user', `User ID: ${id}`);
        }
    },
    
    viewOrder: function(id) {
        PAYMENT.trackOrder(id);
    },
    
    editOrder: function(id) {
        APP.showNotification(`Edit order ${id}`, 'info');
    },
    
    filterOrders: function(filter) {
        APP.showNotification(`Filtered orders: ${filter}`, 'info');
    },
    
    createProduct: function() {
        APP.showNotification('Create product functionality', 'info');
    },
    
    editProduct: function(id) {
        APP.showNotification(`Edit product ${id}`, 'info');
    },
    
    deleteProduct: function(id) {
        if (confirm('Delete this product?')) {
            APP.showNotification(`Deleted product ${id}`, 'success');
            this.logAction('delete_product', `Product ID: ${id}`);
        }
    },
    
    generateLicense: function() {
        const key = 'CHT-' + PAYMENT.generateLicenseKey();
        APP.showNotification(`Generated license: ${key}`, 'success');
        this.logAction('generate_license', `Key: ${key}`);
    },
    
    revokeLicense: function(key) {
        if (confirm('Revoke this license?')) {
            APP.showNotification(`Revoked license ${key}`, 'success');
            this.logAction('revoke_license', `Key: ${key}`);
        }
    },
    
    copyLicense: function(key) {
        PAYMENT.copyToClipboard(key);
        APP.showNotification('License copied to clipboard', 'success');
    },
    
    clearLogs: function() {
        if (confirm('Clear all logs?')) {
            this.data.logs = [];
            localStorage.removeItem('chetarmy_admin_logs');
            this.loadLogs();
            APP.showNotification('Logs cleared', 'success');
        }
    },
    
    clearCache: function() {
        if (confirm('Clear all cache?')) {
            localStorage.clear();
            APP.resetState();
            APP.showNotification('Cache cleared', 'success');
            setTimeout(() => location.reload(), 1000);
        }
    },
    
    exportData: function() {
        const data = {
            users: this.data.users,
            orders: this.data.orders,
            licenses: this.data.licenses,
            logs: this.data.logs,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chetarmy-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        APP.showNotification('Data exported', 'success');
        this.logAction('export_data', 'Full data export');
    },
    
    resetSite: function() {
        if (confirm('WARNING: This will reset ALL site data. Continue?')) {
            localStorage.clear();
            APP.showNotification('Site data reset. Reloading...', 'warning');
            setTimeout(() => location.reload(), 2000);
        }
    },
    
    exportBackup: function() {
        const backup = {
            config: CONFIG,
            state: APP.state,
            admin: this.state,
            data: this.data,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(backup, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chetarmy-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        APP.showNotification('Full backup exported', 'success');
        this.logAction('backup', 'Full system backup');
    }
};

// Initialize admin system
document.addEventListener('DOMContentLoaded', () => {
    ADMIN.init();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ADMIN;
} else {
    window.ADMIN = ADMIN;
}
