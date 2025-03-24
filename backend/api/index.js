const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const https = require('https');
const fs = require('fs');
const cron = require('node-cron');
const { saveHistoricData, getHistoricData } = require('./src/History');
const { processGoogleSheet } = require('./src/parser');

dotenv.config();

const app = express();
const httpPort = process.env.PORT || 8080;
const httpsPort = process.env.HTTPS_PORT || 8443;

// Paths to SSL certificate and key
const sslKeyPath = process.env.SSL_KEY_PATH || './ssl/client-key.pem';
const sslCertPath = process.env.SSL_CERT_PATH || './ssl/client-cert.pem';

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Define your /awp_state endpoint
app.get('/awp_state', async (req, res) => {
  try {
    let data = JSON.parse(fs.readFileSync(`${__dirname}/output/organized_data.json`));
    res.json(data);
  } catch (error) {
    console.error('Error reading state data:', error);
    res.status(500).json({ error: 'Failed to read state data' });
  }
});

app.get('/awp_history', async (req, res) => {
  try {
    console.log('Fetching historic data...');
    let data = await getHistoricData();
    console.log('Data fetched successfully');
    res.json(data);
  } catch (error) {
    console.error('Error fetching historic data:', error);
    res.status(500).json({ error: 'Failed to fetch historic data' });
  }
});

// Schedule the task to run every 6 hours
cron.schedule('0 */6 * * *', async () => {
  try {
    await processGoogleSheet(process.env.SHEET_URL);
    await saveHistoricData();
  } catch (error) {
    console.error('Failed to process sheet:', error);
  }
});

// Start the HTTP server
app.listen(httpPort, '0.0.0.0', () => {
  console.log(`HTTP server is running on http://0.0.0.0:${httpPort}`);
  saveHistoricData().catch(error => console.error('Error saving historic data on startup:', error));
});

// Check if SSL files are available, and start the HTTPS server if they are
if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
  const sslOptions = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath),
  };

  https.createServer(sslOptions, app).listen(httpsPort, '0.0.0.0', () => {
    console.log(`HTTPS server is running on https://0.0.0.0:${httpsPort}`);
  });
} else {
  console.warn('SSL key and certificate files not found. HTTPS server will not be started.');
}