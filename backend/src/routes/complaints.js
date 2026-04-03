const express = require('express');
const router = express.Router();

const {
    createComplaint,
    getComplaintById,
    getAllComplaints,
    updateComplaintStatus,
    assignComplaint,
    deleteComplaint
} = require('../controllers/complaintController');

const {
    validateComplaint,
    validateStatusUpdate,
    validateDepartmentAssignment
} = require('../middleware/validateComplaint');
const upload = require('../middleware/uploadMiddleware');

// Routes match the architecture specification:

// 1. POST /complaints - Create complaint
// Generates unique complaint ID, stores in database, handles image upload
router.post('/', upload.single('image'), validateComplaint, createComplaint);

// 2. GET /complaints/:id - Fetch complaint details
router.get('/:id', getComplaintById);

// 3. GET /complaints - List all complaints (admin)
router.get('/', getAllComplaints);

// 4. PUT /complaints/:id - Update status (Pending → In Progress → Resolved)
router.put('/:id', validateStatusUpdate, updateComplaintStatus);

// 5. POST /assign - Assign complaint to department
// (Note: This is mounted at /api/assign in server.js)
router.post('/assign', validateDepartmentAssignment, assignComplaint);

// Admin: Delete complaint
router.delete('/:id', deleteComplaint);

module.exports = router;