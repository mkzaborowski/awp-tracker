const axios = require("axios");
const fs = require("fs");
const xlsx = require("xlsx");

// Configuration
const SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQT7uecuE4ONP7z6L71E1y9F0mWp-Wbs6MrXpBtJ20toZwZhUuo0MVI36ahr1jpEqJJi1hXMKTnseRI/pub?output=xlsx";
const INPUT_FILE = "./spreadsheet.xlsx"; // Local file to save the downloaded spreadsheet
const OUTPUT_FILE = "./output.json"; // Output JSON file

// Function to download the spreadsheet
async function downloadSpreadsheet() {
  console.log("Downloading spreadsheet...");
  const response = await axios({
    url: SPREADSHEET_URL,
    method: "GET",
    responseType: "arraybuffer", // Necessary for binary file downloads
  });

  fs.writeFileSync(INPUT_FILE, response.data);
  console.log(`Spreadsheet downloaded and saved as ${INPUT_FILE}`);
}

// Function to parse the spreadsheet into raw JSON
function parseSpreadsheetToJSON() {
  console.log("Parsing spreadsheet into JSON...");
  const workbook = xlsx.readFile(INPUT_FILE);

  // Convert all sheets to JSON
  const allSheets = {};
  workbook.SheetNames.forEach((sheetName) => {
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: "", // Ensure empty cells are included
    });
    allSheets[sheetName] = sheetData;
  });

  // Write JSON to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allSheets, null, 2));
  console.log(`Data successfully saved to ${OUTPUT_FILE}`);
}

// Main function
(async function main() {
  try {
    await downloadSpreadsheet();
    parseSpreadsheetToJSON();
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
