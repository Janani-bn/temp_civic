const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const complaintRoutes = require('./src/routes/complaints');
const authRoutes = require('./src/routes/auth');
const commentRoutes = require('./src/routes/comments');

// Import middleware
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// Ensure DB schema exists (idempotent)
const initDatabase = require('./src/config/initDatabase');

// Import controllers for direct mounting
const { assignComplaint } = require('./src/controllers/complaintController');
const { validateDepartmentAssignment } = require('./src/middleware/validateComplaint');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'CivicFix API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
// 1. POST /complaints, GET /complaints, GET /complaints/:id, PUT /complaints/:id
app.use('/api/complaints', complaintRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Comments routes
app.use('/api/comments', commentRoutes);

// 2. POST /assign - Assign complaint to department
// Mounted directly as per architecture spec
app.post('/api/assign', validateDepartmentAssignment, assignComplaint);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server (after DB init)
initDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 CivicFix API Server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
            console.log(`📝 API Base: http://localhost:${PORT}/api`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });

module.exports = app;