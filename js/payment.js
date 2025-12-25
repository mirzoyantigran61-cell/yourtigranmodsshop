// CHETARMY PRO - Payment System
// PayPal integration with validation and order processing

const PAYMENT = {
    // Payment configuration
    config: {
        currency: 'USD',
        environment: CONFIG.PAYMENT.PAYPAL_SANDBOX ? 'sandbox' : 'production',
        clientId: CONFIG.PAYMENT.PAYPAL_CLIENT_ID,
        allowedCountries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'PL'],
        minAmount: CONFIG.PAYMENT.MIN_PURCHASE,
        maxAmount: CONFIG.PAYMENT.MAX_PURCHASE
    },

    // Current order
    currentOrder: null,

    // Initialize payment system
    init: function() {
        console.log('💳 Payment system initialized');
        
        this.loadPayPalSDK();
        this.setupPaymentButtons();
        this.setupCryptoPayment();
        this.setupGiftCards();
        this.setupOrderTracking();
    },

    // Load PayPal SDK
    loadPayPalSDK: function() {
        if (!this.config.clientId || this.config.clientId === 'YOUR_PAYPAL_CLIENT_ID_HERE') {
            console.warn('⚠️ PayPal client ID not configured');
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${this.config.clientId}&currency=${this.config.currency}`;
        script.async = true;
        
        script.onload = () => {
            console.log('✅ PayPal SDK loaded');
            this.setupPayPalButtons();
        };
        
        script.onerror = () => {
            console.error('❌ Failed to load PayPal SDK');
            this.showPaymentError('Failed to load payment system. Please try again later.');
        };
        
        document.head.appendChild(script);
    },

    // Setup PayPal buttons
    setupPayPalButtons: function() {
        if (typeof paypal === 'undefined') {
            console.error('PayPal SDK not available');
            return;
        }

        // Render PayPal button in checkout modal
        const paypalContainer = document.getElementById('paypalButtonContainer');
        if (paypalContainer) {
            paypal.Buttons({
                style: {
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'paypal'
                },
                
                createOrder: (data, actions) => {
                    return this.createPayPalOrder();
                },
                
                onApprove: (data, actions) => {
                    return this.handlePayPalApproval(data, actions);
                },
                
                onError: (err) => {
                    console.error('PayPal error:', err);
                    this.showPaymentError('Payment failed: ' + err.message);
                },
                
                onCancel: (data) => {
                    console.log('Payment cancelled by user');
                    this.showPaymentError('Payment cancelled');
                }
            }).render('#paypalButtonContainer');
        }
    },

    // Setup payment method buttons
    setupPaymentButtons: function() {
        const methodCards = document.querySelectorAll('.method-card');
        
        methodCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove active class from all cards
                methodCards.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked card
                card.classList.add('active');
                
                // Show corresponding payment form
                const method = card.querySelector('span').textContent.toLowerCase();
                this.showPaymentMethod(method);
            });
        });
    },

    // Show payment method
    showPaymentMethod: function(method) {
        // Hide all payment forms
        document.querySelectorAll('.payment-form').forEach(form => {
            form.classList.add('hidden');
        });
        
        // Show selected payment form
        const form = document.getElementById(`${method}Form`);
        if (form) {
            form.classList.remove('hidden');
        }
    },

    // Setup crypto payment
    setupCryptoPayment: function() {
        const cryptoForm = document.getElementById('cryptoForm');
        if (!cryptoForm) return;

        // Update wallet address
        const walletAddress = cryptoForm.querySelector('.wallet-address');
        if (walletAddress) {
            walletAddress.textContent = CONFIG.PAYMENT.CRYPTO_WALLET;
            
            // Copy to clipboard on click
            walletAddress.addEventListener('click', () => {
                this.copyToClipboard(CONFIG.PAYMENT.CRYPTO_WALLET);
                APP.showNotification('Wallet address copied to clipboard', 'success');
            });
        }

        // Generate QR code
        this.generateCryptoQR();
    },

    // Generate crypto QR code
    generateCryptoQR: function() {
        const qrContainer = document.getElementById('cryptoQR');
        if (!qrContainer || !CONFIG.PAYMENT.CRYPTO_WALLET) return;

        // In production, use a QR code library
        // For demo, create a simple representation
        qrContainer.innerHTML = `
            <div class="qr-placeholder">
                <div class="qr-text">ETH: ${CONFIG.PAYMENT.CRYPTO_WALLET.substring(0, 12)}...</div>
                <div class="qr-hint">Scan with crypto wallet</div>
            </div>
        `;
    },

    // Setup gift cards
    setupGiftCards: function() {
        const giftCardForm = document.getElementById('giftcardForm');
        if (!giftCardForm) return;

        giftCardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const code = giftCardForm.querySelector('input[type="text"]').value;
            this.validateGiftCard(code);
        });
    },

    // Setup order tracking
    setupOrderTracking: function() {
        // Check for order in URL
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order');
        
        if (orderId) {
            this.trackOrder(orderId);
        }
    },

    // Initialize checkout
    initCheckout: function(cartItems) {
        if (!cartItems || cartItems.length === 0) {
            APP.showNotification('Cart is empty', 'error');
            return;
        }

        // Calculate total
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * CONFIG.PAYMENT.TAX_RATE;
        const total = subtotal + tax;

        // Validate amount
        if (total < this.config.minAmount) {
            APP.showNotification(`Minimum purchase is $${this.config.minAmount}`, 'error');
            return;
        }

        if (total > this.config.maxAmount) {
            APP.showNotification(`Maximum purchase is $${this.config.maxAmount}`, 'error');
            return;
        }

        // Create order object
        this.currentOrder = {
            id: 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            items: cartItems,
            subtotal: subtotal,
            tax: tax,
            total: total,
            currency: this.config.currency,
            timestamp: new Date().toISOString(),
            status: 'pending',
            paymentMethod: null
        };

        // Show checkout modal
        this.showCheckoutModal();
    },

    // Show checkout modal
    showCheckoutModal: function() {
        if (!this.currentOrder) return;

        const modal = document.getElementById('checkoutModal');
        if (!modal) {
            this.createCheckoutModal();
        }

        // Update order summary
        this.updateOrderSummary();

        // Show modal
        APP.showModal('checkoutModal');
    },

    // Create checkout modal
    createCheckoutModal: function() {
        const modalHTML = `
            <div class="modal-overlay" id="checkoutModal">
                <div class="modal modal-large">
                    <button class="modal-close" id="closeCheckoutModal">&times;</button>
                    
                    <div class="modal-header">
                        <h2>Checkout</h2>
                    </div>
                    
                    <div class="modal-body">
                        <div class="checkout-container">
                            <div class="order-summary">
                                <h3>Order Summary</h3>
                                <div id="orderSummary"></div>
                                <div class="order-total">
                                    <span>Total:</span>
                                    <span id="orderTotal">$0.00</span>
                                </div>
                            </div>
                            
                            <div class="payment-methods">
                                <h3>Payment Method</h3>
                                <div class="method-selection">
                                    <div class="method-card active" data-method="paypal">
                                        <i class="fab fa-paypal"></i>
                                        <span>PayPal</span>
                                    </div>
                                    <div class="method-card" data-method="crypto">
                                        <i class="fab fa-bitcoin"></i>
                                        <span>Crypto</span>
                                    </div>
                                    <div class="method-card" data-method="card">
                                        <i class="fas fa-credit-card"></i>
                                        <span>Card</span>
                                    </div>
                                </div>
                                
                                <div class="payment-forms">
                                    <div id="paypalForm" class="payment-form">
                                        <div id="paypalButtonContainer"></div>
                                    </div>
                                    
                                    <div id="cryptoForm" class="payment-form hidden">
                                        <div class="crypto-info">
                                            <p>Send exact amount to:</p>
                                            <div class="wallet-address">
                                                ${CONFIG.PAYMENT.CRYPTO_WALLET}
                                            </div>
                                            <div id="cryptoQR"></div>
                                            <p class="crypto-note">
                                                After payment, email transaction hash to ${CONFIG.SITE.SUPPORT_EMAIL}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div id="cardForm" class="payment-form hidden">
                                        <form id="cardPaymentForm">
                                            <div class="form-group">
                                                <label>Card Number</label>
                                                <input type="text" placeholder="1234 5678 9012 3456" maxlength="19">
                                            </div>
                                            <div class="form-row">
                                                <div class="form-group">
                                                    <label>Expiry Date</label>
                                                    <input type="text" placeholder="MM/YY">
                                                </div>
                                                <div class="form-group">
                                                    <label>CVV</label>
                                                    <input type="text" placeholder="123" maxlength="3">
                                                </div>
                                            </div>
                                            <button type="submit" class="btn btn-primary">
                                                Pay $<span id="cardTotal">0.00</span>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);

        // Setup event listeners
        this.setupCheckoutModalEvents();
        
        // Load PayPal SDK if needed
        if (!window.paypal) {
            this.loadPayPalSDK();
        }
    },

    // Setup checkout modal events
    setupCheckoutModalEvents: function() {
        // Close button
        document.getElementById('closeCheckoutModal').addEventListener('click', () => {
            APP.hideModal('checkoutModal');
        });

        // Payment method selection
        document.querySelectorAll('.method-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.method-card').forEach(c => {
                    c.classList.remove('active');
                });
                card.classList.add('active');
                
                const method = card.dataset.method;
                this.showPaymentForm(method);
            });
        });

        // Card form submission
        document.getElementById('cardPaymentForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processCardPayment();
        });
    },

    // Update order summary
    updateOrderSummary: function() {
        if (!this.currentOrder) return;

        const summaryContainer = document.getElementById('orderSummary');
        const totalContainer = document.getElementById('orderTotal');
        const cardTotalContainer = document.getElementById('cardTotal');

        if (summaryContainer) {
            let summaryHTML = '';
            
            this.currentOrder.items.forEach(item => {
                summaryHTML += `
                    <div class="order-item">
                        <span>${item.name} × ${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `;
            });
            
            summaryHTML += `
                <div class="order-subtotal">
                    <span>Subtotal</span>
                    <span>$${this.currentOrder.subtotal.toFixed(2)}</span>
                </div>
                <div class="order-tax">
                    <span>Tax</span>
                    <span>$${this.currentOrder.tax.toFixed(2)}</span>
                </div>
            `;
            
            summaryContainer.innerHTML = summaryHTML;
        }

        if (totalContainer) {
            totalContainer.textContent = `$${this.currentOrder.total.toFixed(2)}`;
        }

        if (cardTotalContainer) {
            cardTotalContainer.textContent = this.currentOrder.total.toFixed(2);
        }
    },

    // Show payment form
    showPaymentForm: function(method) {
        // Hide all forms
        document.querySelectorAll('.payment-form').forEach(form => {
            form.classList.add('hidden');
        });
        
        // Show selected form
        const form = document.getElementById(`${method}Form`);
        if (form) {
            form.classList.remove('hidden');
        }
        
        // Update current payment method
        this.currentOrder.paymentMethod = method;
    },

    // Create PayPal order
    createPayPalOrder: function() {
        if (!this.currentOrder) {
            throw new Error('No order to process');
        }

        // In production, this would call your backend
        // For demo, create a mock order
        const items = this.currentOrder.items.map(item => ({
            name: item.name,
            unit_amount: {
                currency_code: this.config.currency,
                value: item.price.toFixed(2)
            },
            quantity: item.quantity.toString()
        }));

        return fetch('/api/create-paypal-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: this.config.currency,
                        value: this.currentOrder.total.toFixed(2),
                        breakdown: {
                            item_total: {
                                currency_code: this.config.currency,
                                value: this.currentOrder.subtotal.toFixed(2)
                            },
                            tax_total: {
                                currency_code: this.config.currency,
                                value: this.currentOrder.tax.toFixed(2)
                            }
                        }
                    },
                    items: items,
                    description: 'CHETARMY PRO Products',
                    custom_id: this.currentOrder.id
                }]
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                return data.id;
            } else {
                throw new Error('Failed to create PayPal order');
            }
        })
        .catch(error => {
            console.error('PayPal order creation error:', error);
            this.showPaymentError('Failed to create payment order');
            throw error;
        });
    },

    // Handle PayPal approval
    handlePayPalApproval: function(data, actions) {
        return actions.order.capture().then((details) => {
            // Payment successful
            console.log('Payment completed:', details);
            
            // Update order with PayPal details
            this.currentOrder.paypalDetails = details;
            this.currentOrder.status = 'completed';
            this.currentOrder.paymentId = details.id;
            
            // Process successful payment
            return this.processSuccessfulPayment();
        });
    },

    // Process card payment
    processCardPayment: function() {
        // Validate card details
        const cardForm = document.getElementById('cardPaymentForm');
        const cardNumber = cardForm.querySelector('input[type="text"]').value;
        const expiry = cardForm.querySelectorAll('input')[1].value;
        const cvv = cardForm.querySelectorAll('input')[2].value;

        if (!this.validateCardDetails(cardNumber, expiry, cvv)) {
            this.showPaymentError('Invalid card details');
            return;
        }

        // Show processing
        APP.showNotification('Processing payment...', 'info');

        // Simulate API call
        setTimeout(() => {
            // Mock successful payment
            this.currentOrder.status = 'completed';
            this.currentOrder.paymentId = 'CARD-' + Date.now();
            
            this.processSuccessfulPayment();
        }, 2000);
    },

    // Validate card details
    validateCardDetails: function(cardNumber, expiry, cvv) {
        // Basic validation
        if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
            return false;
        }

        if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
            return false;
        }

        if (!cvv || cvv.length < 3) {
            return false;
        }

        return true;
    },

    // Validate gift card
    validateGiftCard: function(code) {
        // In production, this would validate with your backend
        // For demo, accept any 16-character code
        if (code && code.length === 16) {
            APP.showNotification('Gift card applied successfully', 'success');
            return true;
        } else {
            APP.showNotification('Invalid gift card code', 'error');
            return false;
        }
    },

    // Process successful payment
    processSuccessfulPayment: function() {
        // Generate license keys
        const licenses = this.generateLicenses();
        
        // Create order record
        const orderRecord = {
            ...this.currentOrder,
            userId: APP.state.user?.id || 'guest',
            licenses: licenses,
            deliveryEmail: APP.state.user?.email || null,
            delivered: false
        };

        // Save order
        this.saveOrder(orderRecord);

        // Send confirmation
        this.sendConfirmation(orderRecord);

        // Update UI
        this.showSuccessScreen(orderRecord);

        // Clear cart
        APP.state.cart = [];
        APP.updateCartUI();
        APP.saveState();

        console.log('✅ Payment processed successfully:', orderRecord);
    },

    // Generate license keys
    generateLicenses: function() {
        return this.currentOrder.items.map(item => ({
            productId: item.id,
            productName: item.name,
            licenseKey: 'CHT-' + this.generateLicenseKey(),
            hwidLocked: item.requires_hwid || false,
            expires: this.calculateExpiryDate(),
            status: 'active'
        }));
    },

    // Generate random license key
    generateLicenseKey: function() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let key = '';
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) key += '-';
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
    },

    // Calculate expiry date (30 days from now)
    calculateExpiryDate: function() {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString();
    },

    // Save order to localStorage
    saveOrder: function(order) {
        try {
            // Get existing orders
            const existingOrders = JSON.parse(localStorage.getItem('chetarmy_orders') || '[]');
            
            // Add new order
            existingOrders.push(order);
            
            // Save back
            localStorage.setItem('chetarmy_orders', JSON.stringify(existingOrders));
            
            // Update user's orders if logged in
            if (APP.state.user) {
                if (!APP.state.user.orders) {
                    APP.state.user.orders = [];
                }
                APP.state.user.orders.push(order.id);
                APP.saveState();
            }
        } catch (error) {
            console.error('Error saving order:', error);
        }
    },

    // Send confirmation
    sendConfirmation: function(order) {
        // In production, this would email the licenses
        // For demo, show them on screen and copy to clipboard
        
        const licenseText = order.licenses.map(license => 
            `${license.productName}: ${license.licenseKey}`
        ).join('\n');
        
        // Copy to clipboard
        this.copyToClipboard(licenseText);
        
        // Also save to localStorage for access later
        localStorage.setItem(`chetarmy_license_${order.id}`, licenseText);
    },

    // Show success screen
    showSuccessScreen: function(order) {
        // Hide checkout modal
        APP.hideModal('checkoutModal');
        
        // Show success modal
        this.showSuccessModal(order);
        
        // Show notification
        APP.showNotification('Payment successful! Licenses copied to clipboard.', 'success');
    },

    // Show success modal
    showSuccessModal: function(order) {
        const modalHTML = `
            <div class="modal-overlay active" id="successModal">
                <div class="modal">
                    <div class="modal-header text-center">
                        <div class="success-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h2>Payment Successful!</h2>
                    </div>
                    
                    <div class="modal-body">
                        <div class="order-details">
                            <p><strong>Order ID:</strong> ${order.id}</p>
                            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                            <p><strong>Date:</strong> ${new Date(order.timestamp).toLocaleString()}</p>
                        </div>
                        
                        <div class="licenses">
                            <h3>Your License Keys</h3>
                            <div class="license-list">
                                ${order.licenses.map(license => `
                                    <div class="license-item">
                                        <strong>${license.productName}</strong>
                                        <code>${license.licenseKey}</code>
                                        <small>Expires: ${new Date(license.expires).toLocaleDateString()}</small>
                                    </div>
                                `).join('')}
                            </div>
                            <p class="license-note">
                                <i class="fas fa-clipboard"></i>
                                Licenses have been copied to your clipboard
                            </p>
                        </div>
                        
                        <div class="next-steps">
                            <h3>Next Steps</h3>
                            <ol>
                                <li>Download the loader from our website</li>
                                <li>Run the loader and enter your license key</li>
                                <li>Follow the installation instructions</li>
                                <li>Join our Discord for support</li>
                            </ol>
                        </div>
                        
                        <div class="success-actions">
                            <button class="btn btn-primary" id="downloadLoaderBtn">
                                <i class="fas fa-download"></i> Download Loader
                            </button>
                            <button class="btn btn-secondary" onclick="APP.hideModal('successModal')">
                                <i class="fas fa-home"></i> Return Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing success modal
        const existingModal = document.getElementById('successModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add new modal
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);

        // Setup download button
        document.getElementById('downloadLoaderBtn').addEventListener('click', () => {
            this.downloadLoader();
        });
    },

    // Download loader
    downloadLoader: function() {
        // In production, this would download the actual loader
        // For demo, show a message
        APP.showNotification('Download would start in production', 'info');
        
        // Close success modal
        APP.hideModal('successModal');
    },

    // Track order
    trackOrder: function(orderId) {
        // Get order from localStorage
        const orders = JSON.parse(localStorage.getItem('chetarmy_orders') || '[]');
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
            // Show order status
            this.showOrderStatus(order);
        }
    },

    // Show order status
    showOrderStatus: function(order) {
        // Create status modal
        const modalHTML = `
            <div class="modal-overlay active" id="orderStatusModal">
                <div class="modal">
                    <button class="modal-close" onclick="APP.hideModal('orderStatusModal')">&times;</button>
                    
                    <div class="modal-header">
                        <h2>Order Status</h2>
                    </div>
                    
                    <div class="modal-body">
                        <div class="order-status">
                            <div class="status-header">
                                <strong>Order ID:</strong> ${order.id}
                            </div>
                            
                            <div class="status-timeline">
                                <div class="status-step ${order.status === 'pending' ? 'active' : 'completed'}">
                                    <div class="step-icon">1</div>
                                    <div class="step-info">
                                        <strong>Order Placed</strong>
                                        <span>${new Date(order.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                                
                                <div class="status-step ${order.status === 'processing' ? 'active' : order.status === 'completed' ? 'completed' : ''}">
                                    <div class="step-icon">2</div>
                                    <div class="step-info">
                                        <strong>Payment Processed</strong>
                                        <span>${order.paymentId ? 'Completed' : 'Pending'}</span>
                                    </div>
                                </div>
                                
                                <div class="status-step ${order.status === 'completed' ? 'active' : ''}">
                                    <div class="step-icon">3</div>
                                    <div class="step-info">
                                        <strong>License Delivered</strong>
                                        <span>${order.delivered ? 'Delivered' : 'Processing'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            ${order.licenses ? `
                                <div class="license-section">
                                    <h4>Licenses</h4>
                                    ${order.licenses.map(license => `
                                        <div class="license-item">
                                            <code>${license.licenseKey}</code>
                                            <span class="license-status ${license.status}">${license.status}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);
    },

    // Copy text to clipboard
    copyToClipboard: function(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    },

    // Show payment error
    showPaymentError: function(message) {
        APP.showNotification(message, 'error');
        
        // Log error for debugging
        console.error('Payment Error:', message);
    }
};

// Initialize payment system
document.addEventListener('DOMContentLoaded', () => {
    PAYMENT.init();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PAYMENT;
} else {
    window.PAYMENT = PAYMENT;
}
