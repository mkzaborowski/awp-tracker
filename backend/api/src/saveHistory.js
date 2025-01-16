const { processGoogleSheet } = require('./parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    password: String(process.env.DATABASE_PASSWORD), // Ensure password is a string
});

const saveHistoricData = async () => {
    try {
        const sheetUrl = process.env.SHEET_URL;
        const result = await processGoogleSheet(sheetUrl);
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        // Save data to PostgreSQL
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create table if it doesn't exist
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS historic_data (
                    date DATE PRIMARY KEY,
                    data JSONB
                );
            `;
            await client.query(createTableQuery);

            const insertQuery = `
                INSERT INTO historic_data (date, data)
                VALUES ($1, $2)
                ON CONFLICT (date) DO UPDATE
                SET data = EXCLUDED.data;
            `;
            await client.query(insertQuery, [timestamp, result.organizedData]);
            await client.query('COMMIT');
            console.log(`Historic data saved to PostgreSQL for date ${timestamp}`);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Failed to save historic data to PostgreSQL:', error);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Failed to save historic data:', error);
    }
};

module.exports = { saveHistoricData };