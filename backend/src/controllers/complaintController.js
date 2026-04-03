const Complaint = require('../models/Complaint');
const { routeToDepartment } = require('../utils/departmentRouter');

/**
 * Create a new complaint
 * POST /complaints
 */
const createComplaint = async (req, res, next) => {
    try {
        const complaintData = req.body;
        
        // If a file was uploaded, add the image_url to complaintData
        if (req.file) {
            // Store relative path so backend/server can serve it statically
            complaintData.imageUrl = `/uploads/${req.file.filename}`;
        }

        // Create complaint (auto-generates ID and assigns department)
        const complaint = await Complaint.create(complaintData);

        res.status(201).json({
            success: true,
            data: {
                complaintId: complaint.complaint_id,
                name: complaint.name,
                phone: complaint.phone,
                area: complaint.area,
                city: complaint.city,
                issueType: complaint.issue_type,
                description: complaint.description,
                severity: complaint.severity,
                status: complaint.status,
                department: complaint.department,
                createdAt: complaint.created_at
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get complaint by ID
 * GET /complaints/:id
 */
const getComplaintById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Try to find by complaint_id first, then by internal id
        let complaint = await Complaint.findByComplaintId(id);

        if (!complaint) {
            // Try internal id if numeric
            const internalId = parseInt(id, 10);
            if (!isNaN(internalId)) {
                complaint = await Complaint.findById(internalId);
            }
        }

        if (!complaint) {
            const error = new Error('Complaint not found');
            error.statusCode = 404;
            throw error;
        }

        res.json({
            success: true,
            data: complaint
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get all complaints (admin endpoint)
 * GET /complaints
 */
const getAllComplaints = async (req, res, next) => {
    try {
        const { status, department } = req.query;
        const filters = {};

        if (status) filters.status = status;
        if (department) filters.department = department;

        const complaints = await Complaint.findAll(filters);

        res.json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update complaint status
 * PUT /complaints/:id
 */
const updateComplaintStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const internalId = parseInt(id, 10);
        if (isNaN(internalId)) {
            const error = new Error('Invalid complaint ID');
            error.statusCode = 400;
            throw error;
        }

        const complaint = await Complaint.updateStatus(internalId, status);

        if (!complaint) {
            const error = new Error('Complaint not found');
            error.statusCode = 404;
            throw error;
        }

        res.json({
            success: true,
            data: complaint
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Assign complaint to department
 * POST /assign
 */
const assignComplaint = async (req, res, next) => {
    try {
        const { complaintId, department, autoAssign } = req.body;

        // Try to find complaint
        let complaint = await Complaint.findByComplaintId(complaintId);

        if (!complaint) {
            const internalId = parseInt(complaintId, 10);
            if (!isNaN(internalId)) {
                complaint = await Complaint.findById(internalId);
            }
        }

        if (!complaint) {
            const error = new Error('Complaint not found');
            error.statusCode = 404;
            throw error;
        }

        let assignedComplaint;

        if (autoAssign && complaint.issue_type) {
            // Auto-assign based on issue type
            assignedComplaint = await Complaint.autoAssignToDepartment(
                complaint.id,
                complaint.issue_type
            );
        } else if (department) {
            // Manual assignment
            assignedComplaint = await Complaint.assignToDepartment(
                complaint.id,
                department
            );
        } else {
            const error = new Error('Department required or enable autoAssign');
            error.statusCode = 400;
            throw error;
        }

        res.json({
            success: true,
            data: assignedComplaint
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete complaint (admin only)
 * DELETE /complaints/:id
 */
const deleteComplaint = async (req, res, next) => {
    try {
        const { id } = req.params;
        const internalId = parseInt(id, 10);

        if (isNaN(internalId)) {
            const error = new Error('Invalid complaint ID');
            error.statusCode = 400;
            throw error;
        }

        const deleted = await Complaint.delete(internalId);

        if (!deleted) {
            const error = new Error('Complaint not found');
            error.statusCode = 404;
            throw error;
        }

        res.json({
            success: true,
            message: 'Complaint deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createComplaint,
    getComplaintById,
    getAllComplaints,
    updateComplaintStatus,
    assignComplaint,
    deleteComplaint
};