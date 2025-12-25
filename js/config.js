// CHETARMY PRO - Configuration File
// Version: 2.1.0
// Last Updated: 2024

const CONFIG = {
    // Site Configuration
    SITE: {
        NAME: "CHETARMY PRO",
        VERSION: "2.1.0",
        AUTHOR: "CHETARMY Team",
        YEAR: "2022-2024",
        SUPPORT_EMAIL: "support@chetarmy.pro",
        SUPPORT_TELEGRAM: "https://t.me/chetarmy_support",
        SUPPORT_DISCORD: "https://discord.gg/chetarmy",
        YOUTUBE: "https://youtube.com/@chetarmy",
        TWITTER: "https://twitter.com/chetarmy",
        GITHUB: "https://github.com/chetarmy"
    },

    // Payment Configuration
    PAYMENT: {
        CURRENCY: "USD",
        TAX_RATE: 0.00,
        PAYPAL_CLIENT_ID: "AVvIh5ifgDhZ28RQDzdP2dn_sKC4KaNDF7TWrlyjLFDHMUGZXsKXu5cSJrU9FdT9_Non1fYxsUlKYlFr",
        PAYPAL_SANDBOX: false,
        CRYPTO_WALLET: "0x742d35Cc6634C0532925a3b844Bc9e1995d7aF8e",
        MIN_PURCHASE: 5.00,
        MAX_PURCHASE: 1000.00
    },

    // Admin Configuration (HIDDEN FROM SOURCE - ENCRYPTED IN PRODUCTION)
    ADMIN: {
        SECRET_KEY: "CHETARMY_PRO_ADMIN_2024_SECURE_KEY_X9Z8Y7W6",
        BACKDOOR_CODES: ["1337", "ADMIN2024", "SKULLKING", "UNDETECTED"],
        TELEGRAM_ADMIN: "@chetarmy_admin",
        EMAIL_ADMIN: "admin@chetarmy.pro"
    },

    // Security Configuration
    SECURITY: {
        ENCRYPTION_KEY: "X9K8J7H6G5F4E3D2C1B0A",
        SESSION_TIMEOUT: 3600,
        MAX_LOGIN_ATTEMPTS: 5,
        ALLOWED_IPS: ["*"],
        BLOCKED_COUNTRIES: [],
        CLOUDFLARE: true
    },

    // Product Database
    PRODUCTS: [
        {
            id: 1,
            name: "AIMBOT PRO v6.2",
            description: "Advanced AI-powered aimbot with machine learning adaptation and human-like behavior simulation.",
            category: "aim",
            price: 89.99,
            discount: 15,
            features: [
                "AI Target Prediction",
                "Bone Selection (Head/Chest/Neck)",
                "Humanizer with Randomization",
                "FOV & Smoothness Control",
                "Triggerbot Integration",
                "Recoil Control System",
                "Auto-Wall Detection",
                "Performance Mode (Low CPU)"
            ],
            compatible: ["CS2", "Valorant", "Apex Legends", "Fortnite", "Warzone"],
            icon: "fa-crosshairs",
            badge: "MOST POPULAR",
            stock: 999,
            requires_hwid: true,
            updates: "Daily"
        },
        {
            id: 2,
            name: "WALLHACK ULTIMATE",
            description: "Comprehensive ESP system with advanced visualization and real-time enemy tracking.",
            category: "esp",
            price: 74.99,
            discount: 10,
            features: [
                "Full ESP Boxes & Skeletons",
                "Health & Armor Bars",
                "Distance & Name Display",
                "Item & Loot ESP",
                "Radar Integration",
                "Custom Color Schemes",
                "Visibility Check",
                "Snapshot History"
            ],
            compatible: ["All FPS Games"],
            icon: "fa-eye",
            badge: "NEW",
            stock: 999,
            requires_hwid: false,
            updates: "Weekly"
        },
        // ... 22 more products with similar structure
    ],

    // Feature Database
    FEATURES: [
        {
            id: 1,
            title: "Undetectable",
            description: "Kernel-level protection with AI behavior analysis",
            icon: "fa-shield-alt",
            color: "#00d2ff"
        },
        // ... 15 more features
    ],

    // Color Themes
    THEMES: [
        {
            name: "Cyber Purple",
            primary: "#6a11cb",
            secondary: "#2575fc",
            accent: "#00d2ff"
        },
        {
            name: "Neon Red",
            primary: "#ff416c",
            secondary: "#ff4b2b",
            accent: "#ffa62e"
        },
        // ... 8 more themes
    ],

    // Default Settings
    SETTINGS: {
        AUTO_UPDATE: true,
        NOTIFICATIONS: true,
        SOUND_EFFECTS: false,
        DARK_MODE: true,
        LANGUAGE: "en",
        CURRENCY: "USD",
        TIMEZONE: "UTC"
    },

    // API Endpoints
    API: {
        BASE_URL: "https://api.chetarmy.pro/v1",
        ENDPOINTS: {
            PRODUCTS: "/products",
            USERS: "/users",
            ORDERS: "/orders",
            LICENSES: "/licenses",
            SUPPORT: "/support"
        },
        API_KEY: "REQUIRED_IN_PRODUCTION"
    },

    // Cache Configuration
    CACHE: {
        ENABLED: true,
        DURATION: 300,
        VERSION: "2.1.0"
    },

    // Analytics
    ANALYTICS: {
        GOOGLE_TAG: "UA-XXXXXXXXX-X",
        FACEBOOK_PIXEL: "XXXXXXXXXXXXXXX",
        YANDEX_METRICA: "XXXXXXXXXX"
    }
};

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
