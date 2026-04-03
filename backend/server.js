const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const complaintRoutes = require('./src/routes/complaints');

// Import middleware
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

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

// 2. POST /assign - Assign complaint to department
// Mounted directly as per architecture spec
app.post('/api/assign', validateDepartmentAssignment, assignComplaint);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CivicFix API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📝 API Base: http://localhost:${PORT}/api`);
});

module.exports = app;