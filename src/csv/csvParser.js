const fs = require('fs');

function load(path) {
    const file = fs.readFileSync(path, 'utf-8');
    const content = file.split('\n');
    content.shift();
    const data = content.map((line) => {
        const values = line.split(',');
        // open, high, low, close, volume
        return [
            Number(values[1]).toFixed(2),
            Number(values[2]).toFixed(2),
            Number(values[3]).toFixed(2),
            Number(values[4]).toFixed(2),
            Number(values[6]).toFixed(2),
        ];
    });
    return data;
}

module.exports = load;
