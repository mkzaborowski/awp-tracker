const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { processGoogleSheet } = require('./src/parser');

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

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

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on 0.0.0.0:${port}`);
});