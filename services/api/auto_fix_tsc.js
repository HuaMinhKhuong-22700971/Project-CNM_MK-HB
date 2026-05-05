const fs = require('fs');

const log = fs.readFileSync('tsc_errors.log', 'utf8');
const lines = log.split('\n');

const fixes = {}; 

for (const text of lines) {
    const match = text.match(/^(src\/[^()]+)\((\d+),(\d+)\):.*Did you mean(?: to write)? '([^']+)'\?/);
    if (match) {
        let [_, file, line, col, rightName] = match;
        
        let wrongName = null;
        const wrongMatch1 = text.match(/Property '([^']+)' does not exist/);
        if (wrongMatch1) wrongName = wrongMatch1[1];
        else {
            const wrongMatch2 = text.match(/but '([^']+)' does not exist/);
            if (wrongMatch2) wrongName = wrongMatch2[1];
        }
        
        if (wrongName) {
            if (!fixes[file]) fixes[file] = [];
            fixes[file].push({
                line: parseInt(line) - 1,
                col: parseInt(col) - 1, // Note: TSC column might be 0-indexed or 1-indexed, let's assume TSC is 1-indexed (col 1 -> index 0)
                wrong: wrongName,
                right: rightName
            });
        }
    }
}

for (const file of Object.keys(fixes)) {
    if (!fs.existsSync(file)) continue;
    
    const codeLines = fs.readFileSync(file, 'utf8').split('\n');
    
    fixes[file].sort((a,b) => {
        if (a.line !== b.line) return b.line - a.line;
        return b.col - a.col;
    });

    for (const fix of fixes[file]) {
        let lineCode = codeLines[fix.line];
        
        // Sometimes tsc col is exactly the start of the word, sometimes it's somewhat off.
        // Let's just do a string replace of the exact word bounded by word boundaries, starting from the col approx.
        // Actually, replacing exactly at col is safest IF col is 1-indexed. Let's try exact column match.
        if (lineCode.substring(fix.col, fix.col + fix.wrong.length) === fix.wrong) {
            codeLines[fix.line] = lineCode.substring(0, fix.col) + fix.right + lineCode.substring(fix.col + fix.wrong.length);
        } else if (lineCode.substring(fix.col - 1, fix.col - 1 + fix.wrong.length) === fix.wrong) {
            // Because TSC col sometimes differs by 1
            codeLines[fix.line] = lineCode.substring(0, fix.col - 1) + fix.right + lineCode.substring(fix.col - 1 + fix.wrong.length);
        } else {
            // Fallback: replace the last occurrence of the word on that line
            const index = lineCode.lastIndexOf(fix.wrong);
            if (index !== -1) {
                codeLines[fix.line] = lineCode.substring(0, index) + fix.right + lineCode.substring(index + fix.wrong.length);
            }
        }
    }
    fs.writeFileSync(file, codeLines.join('\n'));
}
console.log('Auto-fixed all "Did you mean" errors!');
