const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const https = require('https');
const fs = require('fs');
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
    const sheetUrl = process.env.SHEET_URL;
    const result = await processGoogleSheet(sheetUrl);
    res.json(result.organizedData);
  } catch (error) {
    console.error('Failed to process sheet:', error);
    res.status(500).json({ error: 'Failed to process sheet' });
  }
});

// Start the HTTP server
app.listen(httpPort, '0.0.0.0', () => {
  console.log(`HTTP server is running on http://0.0.0.0:${httpPort}`);
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