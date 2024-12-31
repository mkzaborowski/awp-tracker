const axios = require("axios");
const fs = require("fs");

// URL of the public Google Spreadsheet
const SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vQT7uecuE4ONP7z6L71E1y9F0mWp-Wbs6MrXpBtJ20toZwZhUuo0MVI36ahr1jpEqJJi1hXMKTnseRI/pub?gid=332016074&single=true&output=csv";

// Function to fetch data from the Google Spreadsheet
async function fetchSpreadsheetData() {
  try {
    // Fetch the data from the Google Spreadsheet
    const response = await axios.get(SPREADSHEET_URL);
    const csvData = response.data;

    // Parse the CSV data
    const jsonData = csvToJson(csvData);

    // Write the JSON data to a file
    fs.writeFileSync("spreadsheetData.json", JSON.stringify(jsonData, null, 2));
    console.log("Data has been written to spreadsheetData.json");
  } catch (error) {
    console.error("Error fetching spreadsheet data:", error);
  }
}

// Function to convert CSV data to JSON format
function csvToJson(csv) {
  const lines = csv.split("\n");
  const result = [];
  const headers = lines[0].split(",");

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentline = lines[i].split(",");

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }

    result.push(obj);
  }

  return result;
}

// Fetch the spreadsheet data
fetchSpreadsheetData();
