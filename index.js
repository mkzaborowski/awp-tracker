const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
require("dotenv").config();
const cors = require('cors');

const index = express();
const port = process.env.PORT;
index.use(cors());

function runParsersScript() {
  exec("node ./api/src/parser.ts", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing parsers.js: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error output from parsers.js: ${stderr}`);
      return;
    }
    console.log(`Output from parsers.js: ${stdout}`);
  });
}

function isWallStreetOpen() {
  const now = new Date();
  const day = now.getUTCDay();
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();

  // Wall Street is open Monday to Friday, 14:30 to 21:00 UTC
  const isOpen =
    day >= 1 &&
    day <= 5 &&
    (hour > 14 || (hour === 14 && minute >= 30)) &&
    hour < 21;
  return isOpen;
}

index.get("/awp_state", (req, res) => {
  const filePath = path.join(__dirname, "/api/output/organized_data.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error reading file");
      return;
    }
    res.json(JSON.parse(data));
  });
});

index.get("/awp_state2", (req, res) => {
  const filePath = path.join(__dirname, "/api/output/organized_data2.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error reading file");
      return;
    }
    res.json(JSON.parse(data));
  });
});

index.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

  // if (isWallStreetOpen()) {
  runParsersScript();

  // Check every minute to see if Wall Street session has opened or closed
  setInterval(() => {
    if (isWallStreetOpen()) {
      runParsersScript();
    }
  }, 60000); // 60000 ms = 1 minute
});
