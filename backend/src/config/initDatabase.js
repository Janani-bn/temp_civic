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
            duration TEXT,
            allow_volunteers TEXT DEFAULT 'no',
            want_updates TEXT DEFAULT 'no',
            image_url TEXT,
            latitude REAL,
            longitude REAL,
            status TEXT DEFAULT 'Pending',
            department TEXT DEFAULT 'General Administration',
            supporter_count INTEGER DEFAULT 1,
            user_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            role TEXT DEFAULT 'citizen',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const createCommentsTableQuery = `
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id TEXT NOT NULL,
            author_name TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const createComplaintJoinsTableQuery = `
        CREATE TABLE IF NOT EXISTS complaint_joins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER NOT NULL,
            user_id INTEGER,
            session_id TEXT,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(createTableQuery);
        await pool.query(createUsersTableQuery);
        await pool.query(createCommentsTableQuery);
        await pool.query(createComplaintJoinsTableQuery);

        // If complaints table already existed before user_id was added, do a safe ALTER first.
        const columnsInfo = await pool.query("SELECT name FROM pragma_table_info('complaints')");
        const existingColumnNames = (columnsInfo.rows || []).map((c) => c.name);
        if (!existingColumnNames.includes('user_id')) {
            await pool.query('ALTER TABLE complaints ADD COLUMN user_id INTEGER');
        }
        
        if (!existingColumnNames.includes('duration')) {
            await pool.query('ALTER TABLE complaints ADD COLUMN duration TEXT');
        }
        
        if (!existingColumnNames.includes('allow_volunteers')) {
            await pool.query('ALTER TABLE complaints ADD COLUMN allow_volunteers TEXT DEFAULT "no"');
        }
        
        if (!existingColumnNames.includes('want_updates')) {
            await pool.query('ALTER TABLE complaints ADD COLUMN want_updates TEXT DEFAULT "no"');
        }
        
        // SQLite doesn't support IF NOT EXISTS for CREATE INDEX before version 3.27
        // But better-sqlite3 handles common errors. We'll wrap individual index creations.
        const indices = [
            'CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status)',
            'CREATE INDEX IF NOT EXISTS idx_complaints_department ON complaints(department)',
            'CREATE INDEX IF NOT EXISTS idx_complaints_complaint_id ON complaints(complaint_id)',
            'CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_comments_complaint_id ON comments(complaint_id)',
            'CREATE INDEX IF NOT EXISTS idx_joins_complaint_id ON complaint_joins(complaint_id)',
            'CREATE INDEX IF NOT EXISTS idx_joins_user_id ON complaint_joins(user_id)',
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