const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const spreadsheetsDir = path.join(process.cwd(), 'spreadsheets');
const files = fs.readdirSync(spreadsheetsDir).filter(f => f.endsWith('.xlsx'));

const syllabus = {};

files.forEach(file => {
    const workbook = XLSX.readFile(path.join(spreadsheetsDir, file));
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Determine subject name from filename
    let subject = file.replace('_Progress.xlsx', '').replace('_Chemistry', '').replace(/_/g, ' ');
    if (file.includes('Inorganic')) subject = 'Inorganic Chemistry';
    if (file.includes('Organic')) subject = 'Organic Chemistry';
    if (file.includes('Physical')) subject = 'Physical Chemistry';

    syllabus[subject] = data;
});

fs.writeFileSync('syllabus_data.json', JSON.stringify(syllabus, null, 2));
console.log('Syllabus data parsed and saved to syllabus_data.json');
