const pool = require('./database');

const initDatabase = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            area TEXT NOT NULL,
            city TEXT NOT NULL,
            landmark TEXT,
            issue_type TEXT NOT NULL,
            description TEXT NOT NULL,
            severity TEXT DEFAULT 'medium',
            image_url TEXT,
            latitude REAL,
            longitude REAL,
            status TEXT DEFAULT 'Pending',
            department TEXT DEFAULT 'General Administration',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(createTableQuery);
        
        // SQLite doesn't support IF NOT EXISTS for CREATE INDEX before version 3.27
        // But better-sqlite3 handles common errors. We'll wrap individual index creations.
        const indices = [
            'CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status)',
            'CREATE INDEX IF NOT EXISTS idx_complaints_department ON complaints(department)',
            'CREATE INDEX IF NOT EXISTS idx_complaints_complaint_id ON complaints(complaint_id)'
        ];

        for (const index of indices) {
            await pool.query(index);
        }

        console.log('Complaints table and indices created successfully');
    } catch (err) {
        console.error('Error creating complaints table:', err);
        throw err;
    }
};

// Run if called directly
if (require.main === module) {
    initDatabase()
        .then(() => {
            console.log('Database initialization complete');
            process.exit(0);
        })
        .catch((err) => {
            console.error('Database initialization failed:', err);
            process.exit(1);
        });
}

module.exports = initDatabase;