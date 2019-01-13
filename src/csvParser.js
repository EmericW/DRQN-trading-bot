const fs = require('fs');

function load(path) {
    const file = fs.readFileSync(path, 'utf-8');
    const content = file.split('\n');
    content.shift();
    const data = content.map((line) => {
        const values = line.split(',');
        // open, high, low, close, volume
        // return [values[1], values[2], values[3], values[4], values[6]]; // daily csv
        return [values[1], values[2], values[3], values[4], values[5]]; // hourly csv
    });
    return data;
}

module.exports = load;
