// CHETARMY PRO - Color Picker System
// Advanced theme customization with real-time preview

const ColorPicker = {
    // Available themes
    themes: [
        {
            id: 'cyber-purple',
            name: 'Cyber Purple',
            colors: {
                primary: '#6a11cb',
                secondary: '#2575fc',
                accent: '#00d2ff',
                dark: '#0a0a0f',
                darker: '#050508'
            },
            gradient: 'linear-gradient(135deg, #6a11cb, #2575fc)'
        },
        {
            id: 'neon-red',
            name: 'Neon Red',
            colors: {
                primary: '#ff416c',
                secondary: '#ff4b2b',
                accent: '#ffa62e',
                dark: '#0f0a0a',
                darker: '#080505'
            },
            gradient: 'linear-gradient(135deg, #ff416c, #ff4b2b)'
        },
        // ... 10 more themes
    ],

    // Current theme
    currentTheme: null,

    // Initialize color picker
    init: function() {
        console.log('🎨 Color Picker initialized');
        
        this.loadSavedTheme();
        this.setupColorPicker();
        this.setupThemeSelector();
        this.setupCustomColor();
        this.setupPreview();
        this.setupExport();
        
        // Apply initial theme
        if (this.currentTheme) {
            this.applyTheme(this.currentTheme);
        }
    },

    // Load saved theme from localStorage
    loadSavedTheme: function() {
        const savedTheme = localStorage.getItem('chetarmy_theme');
        if (savedTheme) {
            try {
                this.currentTheme = JSON.parse(savedTheme);
            } catch (e) {
                console.error('Error loading saved theme:', e);
                this.currentTheme = this.themes[0];
            }
        } else {
            this.currentTheme = this.themes[0];
        }
    },

    // Setup color picker UI
    setupColorPicker: function() {
        const container = document.getElementById('colorPicker');
        if (!container) return;

        // Clear container
        container.innerHTML = '';

        // Create theme grid
        const themeGrid = document.createElement('div');
        themeGrid.className = 'theme-grid';
        themeGrid.id = 'themeGrid';

        // Add theme options
        this.themes.forEach((theme, index) => {
            const themeCard = this.createThemeCard(theme, index === 0);
            themeGrid.appendChild(themeCard);
        });

        container.appendChild(themeGrid);
    },

    // Create theme card
    createThemeCard: function(theme, isActive = false) {
        const card = document.createElement('div');
        card.className = `theme-card ${isActive ? 'active' : ''}`;
        card.dataset.themeId = theme.id;
        
        card.innerHTML = `
            <div class="theme-preview" style="background: ${theme.gradient};"></div>
            <div class="theme-info">
                <h4>${theme.name}</h4>
                <div class="theme-colors">
                    <span class="color-dot" style="background: ${theme.colors.primary}"></span>
                    <span class="color-dot" style="background: ${theme.colors.secondary}"></span>
                    <span class="color-dot" style="background: ${theme.colors.accent}"></span>
                </div>
            </div>
        `;

        // Add click event
        card.addEventListener('click', () => this.selectTheme(theme));

        return card;
    },

    // Setup theme selector
    setupThemeSelector: function() {
        const themeGrid = document.getElementById('themeGrid');
        if (!themeGrid) return;

        // Add click events to theme cards
        themeGrid.addEventListener('click', (e) => {
            const themeCard = e.target.closest('.theme-card');
            if (themeCard) {
                const themeId = themeCard.dataset.themeId;
                const theme = this.themes.find(t => t.id === themeId);
                if (theme) {
                    this.selectTheme(theme);
                }
            }
        });
    },

    // Setup custom color picker
    setupCustomColor: function() {
        const customColorInput = document.createElement('div');
        customColorInput.className = 'custom-color-section';
        customColorInput.innerHTML = `
            <h3>Custom Colors</h3>
            <div class="color-inputs">
                <div class="color-input-group">
                    <label>Primary Color</label>
                    <input type="color" id="customPrimary" value="${this.currentTheme.colors.primary}">
                    <input type="text" id="customPrimaryHex" value="${this.currentTheme.colors.primary}" maxlength="7">
                </div>
                <div class="color-input-group">
                    <label>Secondary Color</label>
                    <input type="color" id="customSecondary" value="${this.currentTheme.colors.secondary}">
                    <input type="text" id="customSecondaryHex" value="${this.currentTheme.colors.secondary}" maxlength="7">
                </div>
                <div class="color-input-group">
                    <label>Accent Color</label>
                    <input type="color" id="customAccent" value="${this.currentTheme.colors.accent}">
                    <input type="text" id="customAccentHex" value="${this.currentTheme.colors.accent}" maxlength="7">
                </div>
            </div>
            <div class="custom-color-actions">
                <button class="btn btn-secondary" id="previewCustom">Preview</button>
                <button class="btn btn-primary" id="saveCustom">Save as Custom Theme</button>
                <button class="btn btn-outline" id="resetColors">Reset to Default</button>
            </div>
        `;

        document.getElementById('colorPicker').appendChild(customColorInput);

        // Setup event listeners
        this.setupCustomColorEvents();
    },

    // Setup custom color events
    setupCustomColorEvents: function() {
        // Color inputs
        const colorInputs = ['Primary', 'Secondary', 'Accent'];
        
        colorInputs.forEach(color => {
            const colorInput = document.getElementById(`custom${color}`);
            const hexInput = document.getElementById(`custom${color}Hex`);
            
            // Update hex when color input changes
            colorInput.addEventListener('input', (e) => {
                hexInput.value = e.target.value;
            });
            
            // Update color input when hex changes
            hexInput.addEventListener('input', (e) => {
                const value = e.target.value;
                if (this.isValidHex(value)) {
                    colorInput.value = value;
                }
            });
        });

        // Preview button
        document.getElementById('previewCustom').addEventListener('click', () => {
            this.previewCustomTheme();
        });

        // Save button
        document.getElementById('saveCustom').addEventListener('click', () => {
            this.saveCustomTheme();
        });

        // Reset button
        document.getElementById('resetColors').addEventListener('click', () => {
            this.resetToDefault();
        });
    },

    // Setup live preview
    setupPreview: function() {
        const previewSection = document.createElement('div');
        previewSection.className = 'theme-preview-section';
        previewSection.innerHTML = `
            <h3>Live Preview</h3>
            <div class="preview-container">
                <div class="preview-header">
                    <div class="preview-logo">CHETARMY</div>
                    <nav class="preview-nav">
                        <a href="#">Home</a>
                        <a href="#">Products</a>
                        <a href="#">Support</a>
                    </nav>
                </div>
                <div class="preview-content">
                    <div class="preview-card">
                        <h4>Product Card</h4>
                        <p>This is how your products will look</p>
                        <button class="preview-btn">Buy Now</button>
                    </div>
                    <div class="preview-stats">
                        <div class="preview-stat">
                            <span class="stat-value">1,234</span>
                            <span class="stat-label">Users</span>
                        </div>
                        <div class="preview-stat">
                            <span class="stat-value">99%</span>
                            <span class="stat-label">Uptime</span>
                        </div>
                    </div>
                </div>
                <div class="preview-footer">
                    <span>© 2024 CHETARMY PRO</span>
                </div>
            </div>
        `;

        document.getElementById('colorPicker').appendChild(previewSection);
    },

    // Setup export functionality
    setupExport: function() {
        const exportSection = document.createElement('div');
        exportSection.className = 'export-section';
        exportSection.innerHTML = `
            <h3>Export Theme</h3>
            <div class="export-options">
                <button class="btn btn-secondary" id="exportCSS">
                    <i class="fas fa-code"></i> Export CSS Variables
                </button>
                <button class="btn btn-secondary" id="exportJSON">
                    <i class="fas fa-file-code"></i> Export JSON Config
                </button>
                <button class="btn btn-primary" id="copyTheme">
                    <i class="fas fa-copy"></i> Copy Theme Code
                </button>
            </div>
            <div class="export-preview">
                <textarea id="themeCode" readonly placeholder="Theme code will appear here..."></textarea>
            </div>
        `;

        document.getElementById('colorPicker').appendChild(exportSection);

        // Setup export events
        document.getElementById('exportCSS').addEventListener('click', () => this.exportCSS());
        document.getElementById('exportJSON').addEventListener('click', () => this.exportJSON());
        document.getElementById('copyTheme').addEventListener('click', () => this.copyThemeCode());
    },

    // Select theme
    selectTheme: function(theme) {
        // Update active card
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('active');
        });
        
        const activeCard = document.querySelector(`.theme-card[data-theme-id="${theme.id}"]`);
        if (activeCard) {
            activeCard.classList.add('active');
        }

        // Apply theme
        this.applyTheme(theme);
        
        // Update current theme
        this.currentTheme = theme;
        
        // Save to localStorage
        this.saveTheme();
        
        // Update custom color inputs
        this.updateCustomInputs(theme);
        
        // Show notification
        APP.showNotification(`Theme changed to ${theme.name}`, 'success');
    },

    // Apply theme to website
    applyTheme: function(theme) {
        // Update CSS variables
        const root = document.documentElement;
        
        root.style.setProperty('--primary-color', theme.colors.primary);
        root.style.setProperty('--secondary-color', theme.colors.secondary);
        root.style.setProperty('--accent-color', theme.colors.accent);
        
        // Update gradient
        const gradient = `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`;
        root.style.setProperty('--gradient-primary', gradient);
        
        // Update preview
        this.updatePreview(theme);
    },

    // Update preview with current theme
    updatePreview: function(theme) {
        const previewContainer = document.querySelector('.preview-container');
        if (!previewContainer) return;

        // Update preview colors
        previewContainer.style.setProperty('--preview-primary', theme.colors.primary);
        previewContainer.style.setProperty('--preview-secondary', theme.colors.secondary);
        previewContainer.style.setProperty('--preview-accent', theme.colors.accent);
        
        // Update specific elements
        const previewHeader = previewContainer.querySelector('.preview-header');
        const previewCard = previewContainer.querySelector('.preview-card');
        const previewBtn = previewContainer.querySelector('.preview-btn');
        
        if (previewHeader) {
            previewHeader.style.background = `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`;
        }
        
        if (previewCard) {
            previewCard.style.borderColor = theme.colors.accent;
        }
        
        if (previewBtn) {
            previewBtn.style.background = `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`;
        }
    },

    // Update custom color inputs
    updateCustomInputs: function(theme) {
        const colors = ['Primary', 'Secondary', 'Accent'];
        
        colors.forEach(color => {
            const colorInput = document.getElementById(`custom${color}`);
            const hexInput = document.getElementById(`custom${color}Hex`);
            
            if (colorInput && hexInput) {
                colorInput.value = theme.colors[color.toLowerCase()];
                hexInput.value = theme.colors[color.toLowerCase()];
            }
        });
    },

    // Preview custom theme
    previewCustomTheme: function() {
        const customTheme = this.getCustomTheme();
        
        if (customTheme) {
            // Create temporary theme for preview
            const tempTheme = {
                id: 'custom-preview',
                name: 'Custom Preview',
                colors: customTheme,
                gradient: `linear-gradient(135deg, ${customTheme.primary}, ${customTheme.secondary})`
            };
            
            // Apply preview
            this.applyTheme(tempTheme);
            
            APP.showNotification('Custom theme preview applied', 'info');
        }
    },

    // Save custom theme
    saveCustomTheme: function() {
        const customTheme = this.getCustomTheme();
        
        if (customTheme) {
            // Create new theme object
            const newTheme = {
                id: `custom-${Date.now()}`,
                name: `Custom Theme ${new Date().toLocaleDateString()}`,
                colors: customTheme,
                gradient: `linear-gradient(135deg, ${customTheme.primary}, ${customTheme.secondary})`,
                custom: true
            };
            
            // Add to themes array
            this.themes.push(newTheme);
            
            // Update theme grid
            this.setupColorPicker();
            
            // Select the new theme
            this.selectTheme(newTheme);
            
            APP.showNotification('Custom theme saved successfully', 'success');
        }
    },

    // Get custom theme from inputs
    getCustomTheme: function() {
        const primary = document.getElementById('customPrimaryHex').value;
        const secondary = document.getElementById('customSecondaryHex').value;
        const accent = document.getElementById('customAccentHex').value;
        
        // Validate hex colors
        if (!this.isValidHex(primary) || !this.isValidHex(secondary) || !this.isValidHex(accent)) {
            APP.showNotification('Please enter valid hex colors', 'error');
            return null;
        }
        
        return {
            primary: primary,
            secondary: secondary,
            accent: accent,
            dark: '#0a0a0f',
            darker: '#050508'
        };
    },

    // Reset to default theme
    resetToDefault: function() {
        const defaultTheme = this.themes[0];
        this.selectTheme(defaultTheme);
        APP.showNotification('Reset to default theme', 'info');
    },

    // Export CSS variables
    exportCSS: function() {
        const theme = this.currentTheme;
        const css = `/* CHETARMY PRO Theme - ${theme.name} */
:root {
    --primary-color: ${theme.colors.primary};
    --secondary-color: ${theme.colors.secondary};
    --accent-color: ${theme.colors.accent};
    --dark-bg: ${theme.colors.dark};
    --darker-bg: ${theme.colors.darker};
    
    --gradient-primary: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary});
    --gradient-accent: linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary});
}

/* Generated on ${new Date().toLocaleDateString()} */
/* https://chetarmy.pro */`;

        document.getElementById('themeCode').value = css;
        APP.showNotification('CSS variables exported to textarea', 'info');
    },

    // Export JSON config
    exportJSON: function() {
        const theme = this.currentTheme;
        const config = {
            theme: {
                name: theme.name,
                version: "1.0.0",
                author: "CHETARMY PRO",
                colors: theme.colors,
                gradients: {
                    primary: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    accent: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`
                },
                metadata: {
                    generated: new Date().toISOString(),
                    source: "CHETARMY PRO Theme System"
                }
            }
        };

        document.getElementById('themeCode').value = JSON.stringify(config, null, 2);
        APP.showNotification('JSON config exported to textarea', 'info');
    },

    // Copy theme code to clipboard
    copyThemeCode: function() {
        const textarea = document.getElementById('themeCode');
        if (!textarea || !textarea.value) {
            APP.showNotification('No theme code to copy', 'error');
            return;
        }

        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile devices

        try {
            navigator.clipboard.writeText(textarea.value).then(() => {
                APP.showNotification('Theme code copied to clipboard', 'success');
            });
        } catch (err) {
            // Fallback for older browsers
            document.execCommand('copy');
            APP.showNotification('Theme code copied to clipboard', 'success');
        }
    },

    // Save theme to localStorage
    saveTheme: function() {
        try {
            localStorage.setItem('chetarmy_theme', JSON.stringify(this.currentTheme));
        } catch (e) {
            console.error('Error saving theme:', e);
        }
    },

    // Check if string is valid hex color
    isValidHex: function(color) {
        return /^#([0-9A-F]{3}){1,2}$/i.test(color);
    },

    // Generate random theme
    generateRandomTheme: function() {
        const randomColor = () => {
            return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        };

        const randomTheme = {
            id: `random-${Date.now()}`,
            name: 'Random Theme',
            colors: {
                primary: randomColor(),
                secondary: randomColor(),
                accent: randomColor(),
                dark: '#0a0a0f',
                darker: '#050508'
            },
            gradient: null,
            random: true
        };

        randomTheme.gradient = `linear-gradient(135deg, ${randomTheme.colors.primary}, ${randomTheme.colors.secondary})`;
        
        return randomTheme;
    },

    // Apply random theme (for fun)
    applyRandomTheme: function() {
        const randomTheme = this.generateRandomTheme();
        this.selectTheme(randomTheme);
        APP.showNotification('Random theme applied!', 'success');
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if color picker modal exists
    if (document.getElementById('colorPickerModal')) {
        ColorPicker.init();
    }
});

// Add random theme button for fun
document.addEventListener('DOMContentLoaded', () => {
    const randomThemeBtn = document.createElement('button');
    randomThemeBtn.className = 'btn btn-outline';
    randomThemeBtn.id = 'randomThemeBtn';
    randomThemeBtn.innerHTML = '<i class="fas fa-random"></i> Random Theme';
    randomThemeBtn.style.position = 'fixed';
    randomThemeBtn.style.bottom = '20px';
    randomThemeBtn.style.left = '20px';
    randomThemeBtn.style.zIndex = '9998';
    
    randomThemeBtn.addEventListener('click', () => {
        ColorPicker.applyRandomTheme();
    });
    
    // Only add if not in admin mode
    if (!APP.state.isAdmin) {
        document.body.appendChild(randomThemeBtn);
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorPicker;
} else {
    window.ColorPicker = ColorPicker;
}
