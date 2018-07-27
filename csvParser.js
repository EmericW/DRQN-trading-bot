const fs = require('fs');

function load(path) {
    const file = fs.readFileSync(path, 'utf-8');
    const content = file.split('\n');
    content.shift();
    const data = content.map((line) => {
        const values = line.split(',');
        return [values[1], values[2], values[3], values[4], values[6]];
    });
    return data;
}

module.exports = load;
