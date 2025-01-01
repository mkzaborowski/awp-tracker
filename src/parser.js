const axios = require("axios");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

// Helper function to convert Google Sheets HTML URL to export URL
function convertToExportUrl(htmlUrl) {
  const matches = htmlUrl.match(/d\/e\/([-\w]{50,})/);
  if (!matches) {
    throw new Error("Invalid Google Sheets URL format");
  }
  const docId = matches[1];
  return `https://docs.google.com/spreadsheets/d/e/2PACX-1vQT7uecuE4ONP7z6L71E1y9F0mWp-Wbs6MrXpBtJ20toZwZhUuo0MVI36ahr1jpEqJJi1hXMKTnseRI/pub?gid=1632040262&single=true&output=xlsx`;
}

async function downloadSpreadsheet(url, outputPath) {
  try {
    const exportUrl = convertToExportUrl(url);
    const response = await axios({
      method: "get",
      url: exportUrl,
      responseType: "arraybuffer",
    });

    fs.writeFileSync(outputPath, response.data);
    console.log(`Spreadsheet downloaded successfully to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("Error downloading spreadsheet:", error.message);
    throw error;
  }
}

function findLastDataRow(worksheet, startColumn = "C", endColumn = "AC") {
  const colToNum = (col) => {
    let num = 0;
    for (let i = 0; i < col.length; i++) {
      num = num * 26 + col.charCodeAt(i) - "A".charCodeAt(0) + 1;
    }
    return num;
  };

  const getCellValue = (col, row) => {
    const cell = worksheet[`${col}${row}`];
    return cell ? cell.v : null;
  };

  // Function to check if a row might be the bottom header (to be excluded)
  const isBottomHeader = (row) => {
    // Add specific logic to identify the bottom header
    // For example, check for specific text patterns or formatting
    const firstCell = getCellValue("C", row);
    const secondCell = getCellValue("D", row);
    console.log(firstCell, secondCell, row);
    return (
      firstCell &&
      typeof firstCell === "string" &&
      // Add specific conditions that identify the bottom header
      (firstCell.includes("adds") ||
        firstCell.toLowerCase().includes("asjnijnijn") ||
        // Add more conditions as needed
        false)
    );
  };

  // Start from a reasonably high row number and work backwards
  let row = 150; // Adjust this if your sheet might be larger
  let lastDataRow = null;
  let consecutiveEmptyRows = 0;
  const emptyRowThreshold = 100; // Stop after this many empty rows

  while (row > 2) {
    // Don't go above the header row
    let hasData = false;
    let isBottom = isBottomHeader(row);

    // If we find the bottom header, skip it
    if (isBottom) {
      row--;
      lastDataRow = row;
      break;
    }

    // Check if row has any data
    for (let col = colToNum(startColumn); col <= colToNum(endColumn); col++) {
      const colLetter = String.fromCharCode(64 + col);
      if (getCellValue(colLetter, row) !== null) {
        hasData = true;
        break;
      }
    }

    consecutiveEmptyRows++;
    if (consecutiveEmptyRows > emptyRowThreshold) {
      break;
    }

    row--;
  }

  return lastDataRow || 63; // Fallback to 188 if no last row found
}

function parseStackedTables(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Define the column range but make row range dynamic
  const startColumn = "C";
  const endColumn = "AC";
  const dataStartRow = 2; // C2
  const dataEndRow = findLastDataRow(worksheet, startColumn, endColumn);

  console.log(`Detected last data row: ${dataEndRow}`);

  const colToNum = (col) => {
    let num = 0;
    for (let i = 0; i < col.length; i++) {
      num = num * 26 + col.charCodeAt(i) - "A".charCodeAt(0) + 1;
    }
    return num;
  };

  const getCellValue = (col, row) => {
    const cell = worksheet[`${col}${row}`];
    return cell ? cell.v : null;
  };

  // Enhanced header detection
  const isHeaderRow = (row) => {
    const firstCell = getCellValue("C", row);
    if (!firstCell || typeof firstCell !== "string") return false;

    // Add more sophisticated header detection
    // For example, check for patterns in multiple columns
    const secondCell = getCellValue("D", row);
    const thirdCell = getCellValue("E", row);
    // Return true if it matches your header pattern
    // Adjust these conditions based on your actual headers
    return (
      firstCell &&
      !firstCell.includes("Total") &&
      // Add more conditions that identify a valid header row
      Boolean(secondCell || thirdCell)
    );
  };

  const isEmptyRow = (row) => {
    for (let col = colToNum(startColumn); col <= colToNum(endColumn); col++) {
      const colLetter = String.fromCharCode(64 + col);
      if (getCellValue(colLetter, row)) {
        return false;
      }
    }
    return true;
  };

  // Find all table starting positions
  const tableStarts = [];
  for (let row = dataStartRow; row <= dataEndRow; row++) {
    if (isHeaderRow(row) && !isEmptyRow(row)) {
      tableStarts.push(row);
    }
  }

  // Process each table
  const processTable = (startRow) => {
    const headers = [];
    for (let col = colToNum(startColumn); col <= colToNum(endColumn); col++) {
      const colLetter = String.fromCharCode(64 + col);
      const headerValue = getCellValue(colLetter, startRow);
      if (headerValue) headers.push(headerValue);
    }

    const tableData = [];
    let currentRow = startRow + 1;

    while (currentRow <= dataEndRow) {
      if (isEmptyRow(currentRow) || isHeaderRow(currentRow)) {
        break;
      }

      const rowData = {};
      let hasData = false;

      headers.forEach((header, index) => {
        const colLetter = String.fromCharCode(
          64 + colToNum(startColumn) + index
        );
        const value = getCellValue(colLetter, currentRow);
        if (value !== null) {
          rowData[header] = value;
          hasData = true;
        }
      });

      if (hasData) {
        tableData.push(rowData);
      }

      currentRow++;
    }

    delete tableData[Object.keys(tableData)[Object.keys(tableData).length - 1]];

    return {
      startRow,
      headers,
      data: tableData,
    };
  };

  const tables = tableStarts.map((startRow) => processTable(startRow));
  const organizedData = {};

  tables.forEach((table, index) => {
    table.data.forEach((row) => {
      // Adjust these based on your actual column headers
      const sector =
        typeof row["Coin"] === String ? "Coin" : `Section ${index + 1}`;
      const company =
        row.Company ||
        row.Name ||
        row["Company/Asset"] ||
        row["Coin"] ||
        `Entry ${index}`;

      if (!organizedData[sector]) {
        organizedData[sector] = {};
      }

      if (!organizedData[sector][company]) {
        organizedData[sector][company] = [];
      }

      organizedData[sector][company].push(row);
    });
  });

  return {
    rawTables: tables,
    organizedData: organizedData,
    metadata: {
      lastRow: dataEndRow,
      tablesFound: tables.length,
    },
  };
}

async function processGoogleSheet(sheetUrl) {
  try {
    const tempDir = path.join(`${__dirname}/../`, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const filePath = path.join(tempDir, "downloaded_sheet.xlsx");
    await downloadSpreadsheet(sheetUrl, filePath);

    const result = parseStackedTables(filePath);

    const outputPath = path.join(`${__dirname}/../`, "output");
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath);
    }

    fs.writeFileSync(
      path.join(outputPath, "organized_data.json"),
      JSON.stringify(result.organizedData, null, 2)
    );

    console.log("Processing completed successfully");
    console.log("Metadata:", result.metadata);
    return result;
  } catch (error) {
    console.error("Error in processing:", error);
    throw error;
  }
}

module.exports = { processGoogleSheet };

if (require.main === module) {
  const sheetUrl =
    "https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vQT7uecuE4ONP7z6L71E1y9F0mWp-Wbs6MrXpBtJ20toZwZhUuo0MVI36ahr1jpEqJJi1hXMKTnseRI/pubhtml/sheet?headers=false&gid=1632040262";
  processGoogleSheet(sheetUrl)
    .then((result) => {
      console.log("Tables found:", result.rawTables.length);
      console.log("Last data row:", result.metadata.lastRow);
      console.log("Output saved to output/organized_data.json");
    })
    .catch((error) => {
      console.error("Failed to process sheet:", error);
    });
}
