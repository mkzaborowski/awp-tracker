const { processGoogleSheet } = require('./parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const pool = new Pool({
    connectionString: "postgresql://postgres:darimane@localhost:5432/awp_tracker",
    password: String(process.env.DATABASE_PASSWORD), // Ensure password is a string
});

const saveHistoricData = async () => {
    try {
        const data = JSON.parse(fs.readFileSync(`${__dirname}/../output/organized_data.json`, 'utf-8'));
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
            await client.query(insertQuery, [timestamp, data]);
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

const getHistoricData = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query(`
            SELECT * FROM public.historic_data
            ORDER BY date ASC;
        `);
        await client.query('COMMIT');
        return result.rows;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to get historic data:', error);
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    saveHistoricData,
    getHistoricData
};