/**
 * Go Together Server
 * Main server entry point for the Go Together application
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const database = require('./models/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tripRoutes = require('./routes/trips');
const shoppingRoutes = require('./routes/shopping');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Middleware Configuration
 */

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "https://unpkg.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
    next();
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/shopping', shoppingRoutes);

/**
 * Health Check Endpoint
 */
app.get('/api/health', async (req, res) => {
    try {
        // Check database connection
        const dbConnected = database.isConnected();
        
        res.json({
            success: true,
            message: 'Server is healthy',
            data: {
                status: 'ok',
                timestamp: new Date().toISOString(),
                database: dbConnected ? 'connected' : 'disconnected',
                version: process.env.npm_package_version || '1.0.0',
                environment: process.env.NODE_ENV || 'development'
            }
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            success: false,
            message: 'Server health check failed',
            data: {
                status: 'error',
                timestamp: new Date().toISOString()
            }
        });
    }
});

/**
 * Serve Static Files in Production
 */
if (process.env.NODE_ENV === 'production') {
    // Serve static files from the dist directory
    app.use(express.static(path.join(__dirname, '../dist')));
    
    // Handle client-side routing - serve index.html for all non-API routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}

/**
 * Error Handling Middleware
 */

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.path
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(error.status || 500).json({
        success: false,
        message: isDevelopment ? error.message : 'Internal server error',
        ...(isDevelopment && { stack: error.stack })
    });
});

/**
 * Graceful Shutdown Handler
 */
const gracefulShutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
    
    try {
        // Close database connection
        await database.close();
        console.log('Database connection closed');
        
        // Close server
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
        
        // Force close after 10 seconds
        setTimeout(() => {
            console.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
        
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

/**
 * Start Server
 */
const startServer = async () => {
    try {
        // Initialize database
        console.log('Initializing database...');
        await database.initialize();
        console.log('Database initialized successfully');
        
        // Start HTTP server
        const server = app.listen(PORT, () => {
            console.log(`
╔══════════════════════════════════════╗
║           Go Together Server         ║
║                                      ║
║  🚀 Server running on port ${PORT}      ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}           ║
║  📊 Health check: /api/health        ║
║                                      ║
║  Ready to plan adventures! 🏕️        ║
╚══════════════════════════════════════╝
            `);
        });
        
        // Store server reference for graceful shutdown
        global.server = server;
        
        return server;
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
if (require.main === module) {
    startServer();
}

module.exports = app;
