const pool = require('../src/config/database');
const { routeToDepartment } = require('../src/utils/departmentRouter');

const complaints = [
    {
        complaint_id: 'CF-8821',
        name: 'Arun Kumar',
        phone: '9876543210',
        email: 'arun@example.com',
        area: 'Anna Nagar',
        city: 'Chennai',
        landmark: 'Tower Park',
        issue_type: 'Pothole',
        description: 'Large pothole near the entrance of Tower Park.',
        severity: 'high',
        duration: '1 week',
        allow_volunteers: 'yes',
        want_updates: 'yes',
        status: 'Pending',
        lat: 13.0850,
        lng: 80.2101,
        supporter_count: 5
    },
    {
        complaint_id: 'CF-9902',
        name: 'Sneha Rao',
        phone: '9123456789',
        email: 'sneha@example.com',
        area: 'Anna Nagar',
        city: 'Chennai',
        landmark: 'Kandhu Sweets',
        issue_type: 'Water leakage',
        description: 'Main pipe leakage causing flooding in the morning.',
        severity: 'medium',
        duration: '3 days',
        allow_volunteers: 'no',
        want_updates: 'yes',
        status: 'In Progress',
        lat: 13.0860,
        lng: 80.2110,
        supporter_count: 3
    },
    {
        complaint_id: 'CF-1103',
        name: 'Vijay Singh',
        phone: '9988776655',
        email: 'vijay@example.com',
        area: 'Anna Nagar',
        city: 'Chennai',
        landmark: 'Blue Star Bus Stop',
        issue_type: 'Garbage overflow',
        description: 'Dustbins are full and spilling over to the road.',
        severity: 'high',
        duration: '5 days',
        allow_volunteers: 'yes',
        want_updates: 'no',
        status: 'Pending',
        lat: 13.0845,
        lng: 80.2095,
        supporter_count: 12
    }
];

async function seed() {
    console.log('🌱 Seeding Anna Nagar community reports...');
    try {
        for (const c of complaints) {
            const department = routeToDepartment(c.issue_type);
            
            // Check if already exists
            const exists = await pool.query('SELECT id FROM complaints WHERE complaint_id = $1', [c.complaint_id]);
            if (exists.rowCount > 0) {
                // Update coordinates if exists
                await pool.query(
                    'UPDATE complaints SET latitude = $1, longitude = $2, supporter_count = $3 WHERE complaint_id = $4',
                    [c.lat, c.lng, c.supporter_count, c.complaint_id]
                );
                console.log(`Updated ${c.complaint_id} with coordinates/supporters.`);
                continue;
            }

            await pool.query(
                `INSERT INTO complaints 
                (complaint_id, name, phone, email, area, city, landmark, issue_type, description, severity, duration, allow_volunteers, want_updates, status, department, latitude, longitude, supporter_count)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
                [c.complaint_id, c.name, c.phone, c.email, c.area, c.city, c.landmark, c.issue_type, c.description, c.severity, c.duration, c.allow_volunteers, c.want_updates, c.status, department, c.lat, c.lng, c.supporter_count]
            );
            console.log(`Successfully added: ${c.complaint_id} (${c.name})`);
        }
        console.log('✅ Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
