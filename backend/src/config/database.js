const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create a local SQLite database file
const dbPath = path.join(__dirname, '../../civicfix.sqlite');

// Initialize the database
const db = new Database(dbPath, { verbose: console.log });

// Emulate a pg-pool-like interface for minimal changes in other files
const pool = {
    /**
     * Executes a query against the SQLite database.
     * Automatically converts $1, $2 style parameters to ? for compatibility.
     */
    query: async (text, params = []) => {
        try {
            // Convert PostgreSQL style parameters ($1, $2) to SQLite style (?)
            const sqliteText = text.replace(/\$\d+/g, '?');
            
            const stmt = db.prepare(sqliteText);
            
            // For SELECT queries
            if (sqliteText.trim().toUpperCase().startsWith('SELECT')) {
                const rows = stmt.all(params);
                return { rows, rowCount: rows.length };
            }
            
            // For INSERT/UPDATE/DELETE with RETURNING
            if (sqliteText.toUpperCase().includes('RETURNING')) {
                // SQLite 3.35+ supports RETURNING
                const rows = stmt.all(params);
                return { rows, rowCount: rows.length };
            }
            
            // For other operations (CREATE TABLE, etc.)
            const result = stmt.run(params);
            return { rows: [], rowCount: result.changes, lastInsertRowid: result.lastInsertRowid };
        } catch (err) {
            console.error('SQLite Query Error:', err);
            throw err;
        }
    },
    
    // Add event listeners for compatibility
    on: (event, callback) => {
        if (event === 'connect') {
            console.log('Connected to SQLite database at:', dbPath);
            callback();
        }
    }
};

module.exports = pool;