const fs = require('fs');
const path = require('path');

// Target directory
const targetDir = './DED/Orientasi Strategis';
const outputFile = './DED/Orientasi Strategis/file_list.json';

// Scan directory
fs.readdir(targetDir, (err, files) => {
    if (err) {
        return console.error('Unable to scan directory: ' + err);
    }

    const fileList = [];

    files.forEach((file) => {
        // Skip JSON files and other non-evidence files
        if (file.endsWith('.json') || file.startsWith('.')) {
            return;
        }

        const ext = path.extname(file).toLowerCase().replace('.', '');
        // Map file types to icons or generic labels
        const typeMap = {
            'pdf': 'pdf',
            'doc': 'word',
            'docx': 'word',
            'xls': 'excel',
            'xlsx': 'excel',
            'ppt': 'powerpoint',
            'pptx': 'powerpoint',
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image'
        };

        const type = typeMap[ext] || 'unknown';

        fileList.push({
            name: file,
            path: `DED/Orientasi Strategis/${file}`,
            type: type
        });
    });

    // Write JSON file
    fs.writeFile(outputFile, JSON.stringify(fileList, null, 4), 'utf8', (err) => {
        if (err) {
            console.error('Error writing file list:', err);
        } else {
            console.log(`Successfully updated ${outputFile} with ${fileList.length} files.`);
        }
    });
});
