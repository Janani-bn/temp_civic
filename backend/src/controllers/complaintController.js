const Complaint = require('../models/Complaint');
const { routeToDepartment } = require('../utils/departmentRouter');
const { generateWhatsAppLink } = require('../utils/whatsapp');

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
        const complaint = await Complaint.create(complaintData, req.user?.id || null);

        // Generate WhatsApp link if phone is provided
        const whatsappLink = generateWhatsAppLink(complaint.phone, {
            complaintId: complaint.complaint_id,
            issueType: complaint.issue_type,
            area: complaint.area,
            city: complaint.city,
            status: complaint.status
        });

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
                createdAt: complaint.created_at,
                whatsappLink
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get complaints created by the authenticated user
 * GET /complaints/user
 */
const getComplaintsByUser = async (req, res, next) => {
    try {
        const complaints = await Complaint.findByUserId(req.user.id);
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
 * Get complaints that the user has joined (for My Complaints page)
 * GET /complaints/joined
 */
const getJoinedComplaints = async (req, res, next) => {
    try {
        const complaints = await Complaint.getJoinedByUser(req.user.id);
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
 * Get complaints within a radius (nearby dashboard)
 * GET /complaints/nearby?lat=...&lng=...&radiusKm=...
 */
const getNearbyComplaints = async (req, res, next) => {
    try {
        const lat = Number(req.query.lat);
        const lng = Number(req.query.lng);
        const radiusKm = req.query.radiusKm ? Number(req.query.radiusKm) : 10;

        if (Number.isNaN(lat) || Number.isNaN(lng)) {
            return res.status(400).json({
                success: false,
                error: { message: 'lat and lng are required' }
            });
        }
        if (Number.isNaN(radiusKm) || radiusKm <= 0) {
            return res.status(400).json({
                success: false,
                error: { message: 'radiusKm must be a positive number' }
            });
        }

        const complaints = await Complaint.findNearby(lat, lng, radiusKm);
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
 * Join an existing complaint (increment supporter count)
 * POST /complaints/:id/join
 */
const joinComplaint = async (req, res, next) => {
    try {
        const { id } = req.params;
        const internalId = parseInt(id, 10);
        
        if (isNaN(internalId)) {
            const error = new Error('Invalid complaint ID');
            error.statusCode = 400;
            throw error;
        }

        // Track who joined (null if anonymous)
        const userId = req.user?.id || null;
        const sessionId = req.headers['x-session-id'] || null;

        const complaint = await Complaint.join(internalId, userId, sessionId);

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
 * Get grouped duplicate complaints for admin dashboard
 * GET /complaints/grouped-duplicates
 */
const getGroupedDuplicates = async (req, res, next) => {
    try {
        const groups = await Complaint.getGroupedDuplicates();
        res.json({
            success: true,
            count: groups.length,
            data: groups
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createComplaint,
    getComplaintsByUser,
    getJoinedComplaints,
    getNearbyComplaints,
    getComplaintById,
    getAllComplaints,
    updateComplaintStatus,
    assignComplaint,
    joinComplaint,
    getGroupedDuplicates
};