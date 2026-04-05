const pool = require('../src/config/database');
const { routeToDepartment } = require('../src/utils/departmentRouter');

const complaints = [
    {
        complaint_id: 'CF-8821',
        name: 'Arun Kumar',
        phone: '9876543210',
        email: 'arun@example.com',
        area: 'Downtown',
        city: 'Chennai',
        landmark: 'Near Central Library',
        issue_type: 'Pothole',
        description: 'Large pothole in the middle of the main road is causing traffic and potential accidents.',
        severity: 'high',
        duration: '3 weeks',
        allow_volunteers: 'yes',
        want_updates: 'yes',
        status: 'Pending'
    },
    {
        complaint_id: 'CF-9902',
        name: 'Sneha Rao',
        phone: '9123456789',
        email: 'sneha@example.com',
        area: 'West End',
        city: 'Bangalore',
        landmark: 'Opposite Metro Station',
        issue_type: 'Streetlight not working',
        description: 'The streetlights from pillar 45 to 50 are completely out for past 5 days. Unsafe at night.',
        severity: 'medium',
        duration: '5 days',
        allow_volunteers: 'no',
        want_updates: 'yes',
        status: 'In Progress'
    },
    {
        complaint_id: 'CF-1103',
        name: 'Vijay Singh',
        phone: '9988776655',
        email: 'vijay@example.com',
        area: 'North Hills',
        city: 'Mumbai',
        landmark: 'Behind Gandhi Park',
        issue_type: 'Garbage overflow',
        description: 'Trash collection has not happened for 2 weeks. The bins are overflowing and causing bad smell.',
        severity: 'high',
        duration: '2 weeks',
        allow_volunteers: 'yes',
        want_updates: 'no',
        status: 'Pending'
    },
    {
        complaint_id: 'CF-4456',
        name: 'Meera Nair',
        phone: '9445566778',
        email: 'meera@example.com',
        area: 'Lake View',
        city: 'Hyderabad',
        landmark: 'Next to Blue Towers',
        issue_type: 'Water leakage',
        description: 'Main water pipe is leaking continuously. Thousands of gallons being wasted every day.',
        severity: 'medium',
        duration: '2 days',
        allow_volunteers: 'no',
        want_updates: 'yes',
        status: 'Resolved'
    }
];

async function seed() {
    console.log('🌱 Seeding community reports...');
    try {
        for (const c of complaints) {
            const department = routeToDepartment(c.issue_type);
            
            // Check if already exists
            const exists = await pool.query('SELECT id FROM complaints WHERE complaint_id = $1', [c.complaint_id]);
            if (exists.rowCount > 0) {
                console.log(`Skipping ${c.complaint_id} (already exists)`);
                continue;
            }

            await pool.query(
                `INSERT INTO complaints 
                (complaint_id, name, phone, email, area, city, landmark, issue_type, description, severity, duration, allow_volunteers, want_updates, status, department)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
                [c.complaint_id, c.name, c.phone, c.email, c.area, c.city, c.landmark, c.issue_type, c.description, c.severity, c.duration, c.allow_volunteers, c.want_updates, c.status, department]
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
