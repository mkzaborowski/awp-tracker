import axios from 'axios';
import * as xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

interface Worksheet {
    [cell: string]: { v: any };
}

interface TableData {
    [key: string]: any;
}

interface OrganizedData {
    [sector: string]: {
        [company: string]: TableData[];
    };
}

interface ParsedResult {
    rawTables: any[];
    organizedData: OrganizedData;
    metadata: {
        lastRow: number;
        tablesFound: number;
    };
}

// Helper function to convert Google Sheets HTML URL to export URL
function convertToExportUrl(htmlUrl: string): string {
    return `https://docs.google.com/spreadsheets/d/e/2PACX-1vQT7uecuE4ONP7z6L71E1y9F0mWp-Wbs6MrXpBtJ20toZwZhUuo0MVI36ahr1jpEqJJi1hXMKTnseRI/pub?gid=1632040262&single=true&output=xlsx`;
}

async function downloadSpreadsheet(url: string, outputPath: string): Promise<string> {
    try {
        const exportUrl = convertToExportUrl(url);
        const response = await axios({
            method: 'get',
            url: exportUrl,
            responseType: 'arraybuffer',
        });

        fs.writeFileSync(outputPath, response.data);
        console.log(`Spreadsheet downloaded successfully to ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error('Error downloading spreadsheet:', error.message);
        throw error;
    }
}

function findLastDataRow(worksheet: Worksheet, startColumn: string = 'C', endColumn: string = 'AC'): number {
    const colToNum = (col: string): number => {
        let num = 0;
        for (let i = 0; i < col.length; i++) {
            num = num * 26 + col.charCodeAt(i) - 'A'.charCodeAt(0) + 1;
        }
        return num;
    };

    const getCellValue = (col: string, row: number): any => {
        const cell = worksheet[`${col}${row}`];
        return cell ? cell.v : null;
    };

    const isBottomHeader = (row: number): boolean => {
        const firstCell = getCellValue('C', row);
        const secondCell = getCellValue('D', row);
        return (
            firstCell &&
            typeof firstCell === 'string' &&
            (firstCell.includes('adds') ||
                firstCell.toLowerCase().includes('asjnijnijn') ||
                false)
        );
    };

    let row = JSON.parse(fs.readFileSync(`${__dirname}/../temp/xlsx_metadata.json`, 'utf-8')).row + 50;
    let lastDataRow: number | null = null;
    let consecutiveEmptyRows = 0;
    const emptyRowThreshold = row;

    while (row > 2) {
        let hasData = false;
        let isBottom = isBottomHeader(row);

        if (isBottom) {
            row--;
            lastDataRow = row;
            fs.writeFileSync(`${__dirname}/../../api/temp/xlsx_metadata.json`, JSON.stringify({ row: lastDataRow }));
            break;
        }

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

    return lastDataRow ?? 188;
}

function parseStackedTables(filePath: string): ParsedResult {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName] as Worksheet;

    const startColumn = 'C';
    const endColumn = 'AC';
    const dataStartRow = 2;
    const dataEndRow = findLastDataRow(worksheet, startColumn, endColumn);

    console.log(`Detected last data row: ${dataEndRow}`);

    const colToNum = (col: string): number => {
        let num = 0;
        for (let i = 0; i < col.length; i++) {
            num = num * 26 + col.charCodeAt(i) - 'A'.charCodeAt(0) + 1;
        }
        return num;
    };

    const getCellValue = (col: string, row: number): any => {
        const cell = worksheet[`${col}${row}`];
        return cell ? cell.v : null;
    };

    const isHeaderRow = (row: number): boolean => {
        const firstCell = getCellValue('C', row);
        if (!firstCell || typeof firstCell !== 'string') return false;

        const secondCell = getCellValue('D', row);
        const thirdCell = getCellValue('E', row);
        return (
            firstCell &&
            !firstCell.includes('Total') &&
            Boolean(secondCell || thirdCell)
        );
    };

    const isEmptyRow = (row: number): boolean => {
        for (let col = colToNum(startColumn); col <= colToNum(endColumn); col++) {
            const colLetter = String.fromCharCode(64 + col);
            if (getCellValue(colLetter, row)) {
                return false;
            }
        }
        return true;
    };

    const tableStarts: number[] = [];
    for (let row = dataStartRow; row <= dataEndRow; row++) {
        if (isHeaderRow(row) && !isEmptyRow(row)) {
            tableStarts.push(row);
        }
    }

    const processTable = (startRow: number) => {
        const headers: string[] = [];
        for (let col = colToNum(startColumn); col <= colToNum(endColumn); col++) {
            const colLetter = String.fromCharCode(64 + col);
            const headerValue = getCellValue(colLetter, startRow);
            if (headerValue) headers.push(headerValue);
        }

        const tableData: TableData[] = [];
        let currentRow = startRow + 1;

        while (currentRow <= dataEndRow) {
            if (isEmptyRow(currentRow) || isHeaderRow(currentRow)) {
                break;
            }

            const rowData: TableData = {};
            let hasData = false;

            headers.forEach((header, index) => {
                const colLetter = String.fromCharCode(64 + colToNum(startColumn) + index);
                const value = getCellValue(colLetter, currentRow);
                if (value !== null) {
                    rowData[header] = value;
                    hasData = true;
                }
            });

            if (hasData && (rowData["% of portfolio assets"] !== 0 || rowData["% of portfolio assets"] !== 0.00)) {
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
    const organizedData: OrganizedData = {};

    tables.forEach((table, index) => {
        table.data.forEach((row) => {
            const sector = typeof row["Coin"] === 'string' ? "Coin" : `Section ${index + 1}`;
            const company = row.Company || row.Name || row["Company/Asset"] || row["Coin"] || `Entry ${index}`;

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

async function processGoogleSheet(sheetUrl: string): Promise<ParsedResult> {
    try {
        const tempDir = path.join(`${__dirname}/../`, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const filePath = path.join(tempDir, 'downloaded_sheet.xlsx');
        await downloadSpreadsheet(sheetUrl, filePath);

        const result = parseStackedTables(filePath);

        const outputPath = path.join(`${__dirname}/../`, 'output');
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
        }

        fs.writeFileSync(
            path.join(outputPath, 'organized_data.json'),
            JSON.stringify(result.organizedData, null, 2)
        );

        console.log('Processing completed successfully');
        console.log('Metadata:', result.metadata);
        return result;
    } catch (error) {
        console.error('Error in processing:', error);
        throw error;
    }
}

export { processGoogleSheet };

if (require.main === module) {
    processGoogleSheet(process.env.SHEET_URL as string)
.then((result) => {
        console.log('Tables found:', result.rawTables.length);
        console.log('Last data row:', result.metadata.lastRow);
        console.log('Output saved to output/organized_data.json');
    })
        .catch((error) => {
            console.error('Failed to process sheet:', error);
        });
}